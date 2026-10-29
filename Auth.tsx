import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '../lib/store'
import { isEmail } from '../lib/util'
import { Field } from '../components/ui'

function safeNext(raw: string | null) {
  // Only allow internal paths to prevent open redirects.
  return raw && raw.startsWith('/') && !raw.startsWith('//') ? raw : '/dashboard'
}

export default function Auth({ mode }: { mode: 'login' | 'signup' }) {
  const { login, signup, currentUser, authMode } = useStore()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const next = safeNext(params.get('next'))
  const nextQuery = params.get('next') ? `?next=${encodeURIComponent(next)}` : ''

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({})
  const [message, setMessage] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  if (currentUser && !busy) return <Navigate to={next} replace />

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const errs: typeof errors = {}
    if (mode === 'signup' && name.trim().length < 2) errs.name = 'Enter your name.'
    if (!isEmail(email)) errs.email = 'Enter a valid email address.'
    if (mode === 'signup' ? password.length < 8 : !password) errs.password = mode === 'signup' ? 'Use at least 8 characters.' : 'Enter your password.'
    setErrors(errs)
    setMessage('')
    setInfo('')
    if (Object.keys(errs).length) return
    setBusy(true)
    const res = mode === 'signup' ? await signup(name, email, password) : await login(email, password)
    setBusy(false)
    if (!res.ok) return setMessage(res.message ?? 'Something went wrong.')
    if (res.message) return setInfo(res.message)
    nav(next, { replace: true })
  }

  return (
    <div className="container-x py-12">
      <div className="mx-auto grid max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-ink-800/70 md:grid-cols-2">
        <div className="relative hidden flex-col justify-end overflow-hidden bg-gradient-to-br from-electric-600/40 via-violet-600/30 to-ink-900 p-8 md:flex">
          <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-violet-500/30 blur-3xl" />
          <h2 className="relative text-3xl font-extrabold">Build. Discover. Grow.</h2>
          <p className="relative mt-3 text-slate-300">Join founders, creators and builders sharing what they are making.</p>
        </div>

        <div className="p-6 sm:p-10">
          <div className="mb-6 flex rounded-xl bg-ink-900 p-1 text-sm font-semibold">
            <Link to={`/login${nextQuery}`} className={`flex-1 rounded-lg py-2 text-center ${mode === 'login' ? 'bg-electric-500 text-white' : 'text-slate-400 hover:text-white'}`}>Log in</Link>
            <Link to={`/signup${nextQuery}`} className={`flex-1 rounded-lg py-2 text-center ${mode === 'signup' ? 'bg-electric-500 text-white' : 'text-slate-400 hover:text-white'}`}>Sign up</Link>
          </div>

          <form onSubmit={submit} className="space-y-4" noValidate>
            {mode === 'signup' && (
              <Field label="Full name" error={errors.name} htmlFor="name">
                <input id="name" className="input" autoComplete="name" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} />
              </Field>
            )}
            <Field label="Email address" error={errors.email} htmlFor="email">
              <input id="email" type="email" className="input" autoComplete="email" value={email} maxLength={120} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field label="Password" error={errors.password} htmlFor="password" hint={mode === 'signup' ? 'At least 8 characters.' : undefined}>
              <input id="password" type="password" className="input" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={password} maxLength={128} onChange={(e) => setPassword(e.target.value)} />
            </Field>
            {message && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{message}</p>}
            {info && <p role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">{info}</p>}
            <button type="submit" disabled={busy} className="btn-primary w-full !py-3">
              {busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Log in'}
            </button>
          </form>

          <p className="mt-5 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-400">
            {authMode === 'supabase'
              ? 'Authentication is handled by Supabase.'
              : 'Prototype mode: Supabase is not configured, so this account exists only in this browser and cannot be used on another device. Passwords are salted and hashed locally. Social sign-in is unavailable until a backend is connected.'}
          </p>
        </div>
      </div>
    </div>
  )
}
