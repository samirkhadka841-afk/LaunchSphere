import { useRef, useState, type ChangeEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { LaunchForm, Startup } from '../lib/types'
import { useStore } from '../lib/store'
import {
  BRAND_COLORS,
  CATEGORIES,
  MAX_LOGO_BYTES,
  MAX_SHOTS,
  MAX_SHOT_BYTES,
  STAGES,
  emptyForm,
  formFromStartup,
  previewStartup,
  readImage,
  validateAll,
  validateStep,
  type FormErrors,
} from '../lib/util'
import { Icon } from '../components/Icons'
import { StartupCard } from '../components/StartupCard'
import { ProfileHeader, ProfileOverview } from '../components/ProfileView'
import { Field } from '../components/ui'

const STEPS = ['Basic information', 'Branding', 'Product information', 'Publish']

export default function Launch() {
  const { id } = useParams()
  const nav = useNavigate()
  const { startups, currentUser, draft, saveDraft, clearDraft, publishStartup } = useStore()

  const editing = id ? startups.find((s) => s.id === id) : undefined
  const canEdit = !id || (editing && currentUser && editing.founderId === currentUser.id)

  const [form, setForm] = useState<LaunchForm>(() => (editing ? formFromStartup(editing) : draft ?? emptyForm()))
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState<FormErrors>({})
  const [notice, setNotice] = useState('')
  const [publishError, setPublishError] = useState('')
  const [published, setPublished] = useState<Startup | null>(null)
  const [uploadError, setUploadError] = useState('')
  const [copied, setCopied] = useState(false)
  const logoRef = useRef<HTMLInputElement>(null)
  const shotsRef = useRef<HTMLInputElement>(null)

  if (id && !editing) {
    return (
      <Centered title="Startup not found" body="We could not find the startup you are trying to edit.">
        <Link to="/dashboard" className="btn-primary">Back to dashboard</Link>
      </Centered>
    )
  }
  if (!canEdit) {
    return (
      <Centered title="You cannot edit this startup" body="Only the founder who published a startup can edit it.">
        <Link to="/explore" className="btn-primary">Explore startups</Link>
      </Centered>
    )
  }

  const set = <K extends keyof LaunchForm>(key: K, value: LaunchForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
    setNotice('')
  }

  const goNext = () => {
    const errs = validateStep(step, form)
    setErrors(errs)
    if (Object.keys(errs).length) return
    setStep((s) => Math.min(3, s + 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const goBack = () => {
    setErrors({})
    setStep((s) => Math.max(0, s - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const jumpTo = (target: number) => {
    if (target > step) {
      for (let i = 0; i < target; i++) {
        const errs = validateStep(i, form)
        if (Object.keys(errs).length) {
          setStep(i)
          setErrors(errs)
          return
        }
      }
    }
    setErrors({})
    setStep(target)
  }

  const onSaveDraft = () => {
    if (saveDraft(form)) setNotice('Draft saved in this browser. You can leave and come back.')
    else setNotice('Could not save the draft: browser storage is full. Try removing images.')
  }

  const onLogo = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      set('logo', await readImage(file, MAX_LOGO_BYTES))
      setUploadError('')
    } catch (err) {
      setUploadError((err as Error).message)
    }
  }

  const onShots = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (!files.length) return
    const room = MAX_SHOTS - form.screenshots.length
    if (room <= 0) {
      setUploadError(`You can add up to ${MAX_SHOTS} screenshots.`)
      return
    }
    const results: string[] = []
    let err = files.length > room ? `Only ${MAX_SHOTS} screenshots are allowed; extra files were skipped. ` : ''
    for (const file of files.slice(0, room)) {
      try {
        results.push(await readImage(file, MAX_SHOT_BYTES))
      } catch (ex) {
        err += (ex as Error).message + ' '
      }
    }
    if (results.length) set('screenshots', [...form.screenshots, ...results])
    setUploadError(err.trim())
  }

  const onPublish = () => {
    setPublishError('')
    const invalid = validateAll(form)
    if (invalid) {
      setStep(invalid.step)
      setErrors(invalid.errors)
      return
    }
    if (!currentUser) {
      saveDraft(form)
      return
    }
    const res = publishStartup(form, editing?.id)
    if (!res.ok) {
      setPublishError(res.message)
      return
    }
    if (!editing) clearDraft()
    setPublished(res.startup)
  }

  if (published) {
    const url = `${window.location.origin}/startup/${published.slug}`
    return (
      <div className="container-x py-16">
        <div className="card mx-auto max-w-xl p-8 text-center sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
            <Icon name="check" className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-3xl font-extrabold">{editing ? 'Changes saved' : 'Your startup is published'}</h1>
          <p className="mt-2 text-slate-400">
            {published.name} is now live on LaunchSphere. In prototype mode it is visible only in this browser.
          </p>
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-white/10 bg-ink-900 p-2 pl-4 text-left">
            <Link to={`/startup/${published.slug}`} className="min-w-0 flex-1 truncate text-sm text-electric-400 hover:text-white">
              {url}
            </Link>
            <button
              type="button"
              className="btn-ghost !px-3 !py-1.5 text-xs"
              onClick={() => {
                navigator.clipboard?.writeText(url).then(() => setCopied(true), () => setCopied(false))
              }}
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to={`/startup/${published.slug}`} className="btn-primary">View startup page</Link>
            <Link to="/dashboard" className="btn-ghost">Go to dashboard</Link>
          </div>
          <ul className="mt-8 space-y-2 text-left text-sm text-slate-400">
            <li className="flex gap-2"><Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> Post updates from your startup page to keep followers informed.</li>
            <li className="flex gap-2"><Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> Share it in the community to find collaborators.</li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="container-x py-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-extrabold sm:text-4xl">{editing ? `Edit ${editing.name}` : 'Launch your startup'}</h1>
        <p className="mt-2 text-slate-400">Four short steps. You can go back at any time and your draft can be saved.</p>

        {/* Progress */}
        <nav aria-label="Progress" className="mt-8">
          <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuemin={1} aria-valuemax={4} aria-valuenow={step + 1}>
            <div className="h-full rounded-full bg-gradient-to-r from-electric-500 to-violet-500 transition-all" style={{ width: `${((step + 1) / 4) * 100}%` }} />
          </div>
          <ol className="grid grid-cols-4 gap-2">
            {STEPS.map((label, i) => (
              <li key={label}>
                <button
                  type="button"
                  onClick={() => jumpTo(i)}
                  aria-current={i === step ? 'step' : undefined}
                  className={`flex w-full items-center gap-2 rounded-xl border px-2 py-2 text-left text-xs sm:px-3 sm:text-sm ${
                    i === step ? 'border-electric-400/50 bg-electric-500/10 text-white' : 'border-white/10 text-slate-400 hover:bg-white/5'
                  }`}
                >
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-electric-500 text-white' : 'bg-white/10'}`}>
                    {i < step ? <Icon name="check" className="h-3.5 w-3.5" /> : i + 1}
                  </span>
                  <span className="hidden sm:inline">{label}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <div className="card mt-6 p-6 sm:p-8">
          {step === 0 && (
            <div className="space-y-5">
              <StepTitle title="Basic information" text="Tell people what you are building." />
              <Field label="Startup name" required error={errors.name} htmlFor="name">
                <input id="name" className="input" value={form.name} maxLength={60} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Orbit Notes" />
              </Field>
              <Field label="Tagline" required error={errors.tagline} htmlFor="tagline" hint={`${form.tagline.length}/100`}>
                <input id="tagline" className="input" value={form.tagline} maxLength={100} onChange={(e) => set('tagline', e.target.value)} placeholder="A short, catchy line" />
              </Field>
              <Field label="Description" required error={errors.description} htmlFor="description" hint={`${form.description.length}/2000`}>
                <textarea id="description" className="input min-h-[140px]" value={form.description} maxLength={2000} onChange={(e) => set('description', e.target.value)} placeholder="Describe your startup in detail" />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Category" required error={errors.category} htmlFor="category">
                  <select id="category" className="input" value={form.category} onChange={(e) => set('category', e.target.value)}>
                    <option value="">Select a category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Website URL (optional)" error={errors.website} htmlFor="website">
                  <input id="website" type="url" className="input" value={form.website} maxLength={200} onChange={(e) => set('website', e.target.value)} placeholder="https://yourwebsite.com" />
                </Field>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <StepTitle title="Branding" text="Add your logo, product images and a brand color." />
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-6">
                  <div>
                    <p className="label">Logo</p>
                    <div className="flex items-center gap-4">
                      {form.logo ? (
                        <img src={form.logo} alt="Logo preview" className="h-20 w-20 rounded-xl border border-white/10 object-cover" />
                      ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-white/20 text-slate-600">
                          <Icon name="upload" />
                        </div>
                      )}
                      <div className="space-y-2">
                        <input ref={logoRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={onLogo} aria-label="Upload logo" />
                        <button type="button" className="btn-ghost !py-2" onClick={() => logoRef.current?.click()}>
                          <Icon name="upload" className="h-4 w-4" /> {form.logo ? 'Replace' : 'Upload logo'}
                        </button>
                        {form.logo && (
                          <button type="button" className="ml-2 text-xs text-slate-400 hover:text-red-300" onClick={() => set('logo', '')}>Remove</button>
                        )}
                        <p className="text-xs text-slate-500">PNG, JPG or WebP, up to {MAX_LOGO_BYTES / 1024} KB.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="label">Screenshots or product images</p>
                    <input ref={shotsRef} type="file" accept="image/png,image/jpeg,image/webp" multiple className="hidden" onChange={onShots} aria-label="Upload screenshots" />
                    <button type="button" className="btn-ghost !py-2" disabled={form.screenshots.length >= MAX_SHOTS} onClick={() => shotsRef.current?.click()}>
                      <Icon name="upload" className="h-4 w-4" /> Add images ({form.screenshots.length}/{MAX_SHOTS})
                    </button>
                    <p className="mt-1.5 text-xs text-slate-500">PNG, JPG or WebP, up to {MAX_SHOT_BYTES / 1024} KB each.</p>
                    {form.screenshots.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        {form.screenshots.map((src, i) => (
                          <div key={i} className="group relative">
                            <img src={src} alt={`Screenshot ${i + 1}`} className="aspect-video w-full rounded-lg border border-white/10 object-cover" />
                            <button
                              type="button"
                              aria-label={`Remove screenshot ${i + 1}`}
                              onClick={() => set('screenshots', form.screenshots.filter((_, j) => j !== i))}
                              className="absolute right-1.5 top-1.5 rounded-full bg-ink-950/80 p-1 text-slate-200 hover:text-red-300"
                            >
                              <Icon name="x" className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {uploadError && <p role="alert" className="text-xs font-medium text-red-400">{uploadError}</p>}

                  <Field label="Brand color" required error={errors.color}>
                    <div className="flex flex-wrap items-center gap-2">
                      {BRAND_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          aria-label={`Use color ${c}`}
                          aria-pressed={form.color === c}
                          onClick={() => set('color', c)}
                          className={`h-8 w-8 rounded-full border-2 ${form.color === c ? 'border-white' : 'border-transparent'}`}
                          style={{ background: c }}
                        />
                      ))}
                      <label className="ml-1 inline-flex items-center gap-2 text-xs text-slate-400">
                        Custom
                        <input type="color" value={form.color} onChange={(e) => set('color', e.target.value)} className="h-8 w-10 cursor-pointer rounded border border-white/10 bg-transparent" aria-label="Custom brand color" />
                      </label>
                    </div>
                  </Field>
                </div>

                <div>
                  <p className="label">Card preview</p>
                  <StartupCard preview startup={previewStartup(form, currentUser?.id ?? '')} />
                  <p className="mt-2 text-xs text-slate-500">This is how your startup appears in Explore and on the home page.</p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <StepTitle title="Product information" text="Help visitors understand why your product matters." />
              <Field label="What problem does your startup solve?" required error={errors.problem} htmlFor="problem">
                <textarea id="problem" className="input min-h-[100px]" value={form.problem} maxLength={800} onChange={(e) => set('problem', e.target.value)} />
              </Field>
              <Field label="Who is your target audience?" required error={errors.audience} htmlFor="audience">
                <textarea id="audience" className="input min-h-[80px]" value={form.audience} maxLength={500} onChange={(e) => set('audience', e.target.value)} />
              </Field>
              <Field label="What makes your product different?" required error={errors.different} htmlFor="different">
                <textarea id="different" className="input min-h-[100px]" value={form.different} maxLength={800} onChange={(e) => set('different', e.target.value)} />
              </Field>
              <Field label="Current stage" required error={errors.stage}>
                <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Current stage">
                  {STAGES.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      role="radio"
                      aria-checked={form.stage === s.value}
                      onClick={() => set('stage', s.value)}
                      className={`rounded-xl border p-4 text-left transition ${form.stage === s.value ? 'border-electric-400 bg-electric-500/10' : 'border-white/10 hover:bg-white/5'}`}
                    >
                      <p className="font-semibold text-white">{s.label}</p>
                      <p className="mt-0.5 text-xs text-slate-400">{s.hint}</p>
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <StepTitle title="Review and publish" text="Check your startup profile. Use Edit links to change any section." />
              <ProfileHeader startup={previewStartup(form, currentUser?.id ?? '')} />
              <ProfileOverview
                startup={previewStartup(form, currentUser?.id ?? '')}
                founder={currentUser ?? undefined}
                onEdit={(s) => jumpTo(s)}
              />
              {!currentUser && (
                <div className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-4 text-sm text-amber-100">
                  You need an account to publish. Your draft is saved in this browser, so nothing is lost.
                  <div className="mt-3 flex gap-2">
                    <Link to="/signup?next=/launch" onClick={() => saveDraft(form)} className="btn-primary !py-2">Create account</Link>
                    <Link to="/login?next=/launch" onClick={() => saveDraft(form)} className="btn-ghost !py-2">Log in</Link>
                  </div>
                </div>
              )}
              {publishError && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{publishError}</p>}
            </div>
          )}

          {/* Footer controls */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6">
            <div className="flex items-center gap-3">
              {!editing && (
                <button type="button" onClick={onSaveDraft} className="btn-ghost !py-2">Save draft</button>
              )}
              <Link to={editing ? '/dashboard' : '/'} className="text-sm text-slate-400 hover:text-white">Cancel</Link>
            </div>
            <div className="flex items-center gap-3">
              {step > 0 && (
                <button type="button" onClick={goBack} className="btn-ghost">Back</button>
              )}
              {step < 3 ? (
                <button type="button" onClick={goNext} className="btn-primary">
                  Continue <Icon name="arrow" className="h-4 w-4" />
                </button>
              ) : (
                <button type="button" onClick={onPublish} disabled={!currentUser} className="btn-primary">
                  {editing ? 'Save changes' : 'Publish startup'}
                </button>
              )}
            </div>
          </div>
          {notice && <p role="status" className="mt-3 text-right text-xs text-emerald-400">{notice}</p>}
          {Object.keys(errors).length > 0 && step < 3 && (
            <p role="alert" className="mt-3 text-right text-xs text-red-400">Please fix the highlighted fields to continue.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function StepTitle({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mt-1 text-sm text-slate-400">{text}</p>
    </div>
  )
}

function Centered({ title, body, children }: { title: string; body: string; children: React.ReactNode }) {
  return (
    <div className="container-x py-24 text-center">
      <h1 className="text-3xl font-extrabold">{title}</h1>
      <p className="mx-auto mt-2 max-w-md text-slate-400">{body}</p>
      <div className="mt-6">{children}</div>
    </div>
  )
}
