import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Startup } from '../lib/types'
import { Icon } from './Icons'

export function Logo({ startup, size = 'h-12 w-12' }: { startup: Pick<Startup, 'name' | 'logo' | 'color'>; size?: string }) {
  if (startup.logo) {
    return <img src={startup.logo} alt={`${startup.name} logo`} className={`${size} shrink-0 rounded-xl object-cover`} />
  }
  return (
    <div
      className={`${size} flex shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white`}
      style={{ background: `linear-gradient(135deg, ${startup.color}, ${startup.color}99)` }}
      aria-hidden="true"
    >
      {startup.name.trim().charAt(0).toUpperCase() || '?'}
    </div>
  )
}

export function DemoBadge() {
  return (
    <span
      title="Fictional demonstration data"
      className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300"
    >
      Demo
    </span>
  )
}

export function Field({
  label,
  error,
  hint,
  required,
  htmlFor,
  children,
}: {
  label: string
  error?: string
  hint?: string
  required?: boolean
  htmlFor?: string
  children: ReactNode
}) {
  return (
    <div>
      <label className="label" htmlFor={htmlFor}>
        {label} {required && <span className="text-violet-400">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1.5 text-xs font-medium text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}

export function Stars({ value, size = 'h-4 w-4' }: { value: number; size?: string }) {
  return (
    <span className="inline-flex" aria-label={`${value.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon key={i} name="star" filled={i <= Math.round(value)} className={`${size} ${i <= Math.round(value) ? 'text-amber-400' : 'text-slate-600'}`} />
      ))}
    </span>
  )
}

export function SectionHeading({
  title,
  subtitle,
  to,
  linkLabel = 'View all',
}: {
  title: string
  subtitle?: string
  to?: string
  linkLabel?: string
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold sm:text-2xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      </div>
      {to && (
        <Link to={to} className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-electric-400 hover:text-white">
          {linkLabel} <Icon name="arrow" className="h-4 w-4" />
        </Link>
      )}
    </div>
  )
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 rounded-full bg-white/5 p-3 text-slate-400">
        <Icon name="search" className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-slate-400">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function PageTitle({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-extrabold sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-slate-400">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-slate-100">{label}</p>
        {description && <p className="text-xs text-slate-500">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? 'bg-electric-500' : 'bg-white/15'} focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-400`}
      >
        <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  )
}
