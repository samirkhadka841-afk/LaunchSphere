import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { Field, PageTitle, Toggle } from '../components/ui'

export default function Settings() {
  const { currentUser, updateUser, deleteAccount, resetDemo, state, authMode } = useStore()
  const nav = useNavigate()
  const [name, setName] = useState(currentUser?.name ?? '')
  const [bio, setBio] = useState(currentUser?.bio ?? '')
  const [location, setLocation] = useState(currentUser?.location ?? '')
  const [skills, setSkills] = useState(currentUser?.skills.join(', ') ?? '')
  const [err, setErr] = useState('')
  const [saved, setSaved] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!currentUser) return null
  const s = currentUser.settings

  const save = (e: FormEvent) => {
    e.preventDefault()
    if (name.trim().length < 2) return setErr('Your name must be at least 2 characters.')
    updateUser({
      name: name.trim().slice(0, 60),
      bio: bio.trim().slice(0, 500),
      location: location.trim().slice(0, 60),
      skills: skills.split(',').map((x) => x.trim()).filter(Boolean).slice(0, 12),
    })
    setErr('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const exportData = () => {
    const mine = state.startups.filter((x) => x.founderId === currentUser.id)
    const { passHash, salt, ...profile } = currentUser
    const blob = new Blob([JSON.stringify({ profile, startups: mine, saved: state.saved[currentUser.id] ?? [] }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'launchsphere-my-data.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container-x py-10">
      <PageTitle title="Settings" subtitle="Manage your profile, preferences and privacy." />
      <div className="mx-auto max-w-2xl space-y-8">
        <form onSubmit={save} className="card space-y-4 p-6">
          <h2 className="text-lg font-bold">Profile</h2>
          <Field label="Name" error={err} htmlFor="s-name"><input id="s-name" className="input" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Email" hint={authMode === 'supabase' ? 'Managed by your Supabase account.' : 'Email cannot be changed in prototype mode.'} htmlFor="s-email">
            <input id="s-email" className="input opacity-70" value={currentUser.email} readOnly />
          </Field>
          <Field label="Location" htmlFor="s-loc"><input id="s-loc" className="input" value={location} maxLength={60} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" /></Field>
          <Field label="Bio" htmlFor="s-bio" hint={`${bio.length}/500`}><textarea id="s-bio" className="input min-h-[100px]" value={bio} maxLength={500} onChange={(e) => setBio(e.target.value)} /></Field>
          <Field label="Skills" htmlFor="s-skills" hint="Separate with commas (up to 12)."><input id="s-skills" className="input" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Design, React, Marketing" /></Field>
          <div className="flex items-center gap-3">
            <button type="submit" className="btn-primary">Save profile</button>
            {saved && <span role="status" className="text-sm text-emerald-400">Saved</span>}
          </div>
        </form>

        <section className="card divide-y divide-white/5 p-6">
          <h2 className="pb-2 text-lg font-bold">Preferences</h2>
          <Toggle label="In-app notifications" description="Stored as a preference. Delivery needs a backend." checked={s.notifications} onChange={(v) => updateUser({ settings: { notifications: v } })} />
          <Toggle label="Product update emails" description="Stored as a preference. Emails are not sent in prototype mode." checked={s.productEmails} onChange={(v) => updateUser({ settings: { productEmails: v } })} />
        </section>

        <section className="card divide-y divide-white/5 p-6">
          <h2 className="pb-2 text-lg font-bold">Privacy</h2>
          <Toggle label="Public founder profile" description="When off, others see a private-profile message." checked={s.profilePublic} onChange={(v) => updateUser({ settings: { profilePublic: v } })} />
          <Toggle label="Show email on my profile" description="Off by default." checked={s.showEmail} onChange={(v) => updateUser({ settings: { showEmail: v } })} />
        </section>

        <section className="card space-y-4 p-6">
          <h2 className="text-lg font-bold">Your data</h2>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn-ghost" onClick={exportData}>Download my data</button>
            <button type="button" className="btn-ghost" onClick={() => { if (window.confirm('Reset all local data, including accounts, back to the demo state?')) resetDemo() }}>Reset demo data</button>
          </div>
          <div className="border-t border-white/10 pt-4">
            <h3 className="text-sm font-semibold text-red-300">Delete account</h3>
            <p className="mt-1 text-sm text-slate-500">Removes your profile, startups and posts from this browser. This cannot be undone.</p>
            {confirmDelete ? (
              <div className="mt-3 flex gap-2">
                <button type="button" className="btn-danger" onClick={async () => { await deleteAccount(); nav('/') }}>Yes, delete everything</button>
                <button type="button" className="btn-ghost" onClick={() => setConfirmDelete(false)}>Cancel</button>
              </div>
            ) : (
              <button type="button" className="btn-danger mt-3" onClick={() => setConfirmDelete(true)}>Delete account</button>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
