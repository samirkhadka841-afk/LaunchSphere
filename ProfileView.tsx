import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Startup, User } from '../lib/types'
import { avgRating, formatCount } from '../lib/util'
import { Icon } from './Icons'
import { DemoBadge, Logo, Stars } from './ui'

export function ProfileHeader({ startup, actions }: { startup: Startup; actions?: ReactNode }) {
  const rating = avgRating(startup)
  return (
    <div className="card relative overflow-hidden p-6 sm:p-8">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-32 opacity-30"
        style={{ background: `linear-gradient(180deg, ${startup.color}66, transparent)` }}
      />
      <div className="relative flex flex-wrap items-start justify-between gap-5">
        <div className="flex items-start gap-4">
          <Logo startup={startup} size="h-20 w-20" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold sm:text-3xl">{startup.name}</h1>
              {startup.demo && <DemoBadge />}
            </div>
            <p className="mt-1 max-w-xl text-slate-300">{startup.tagline}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="chip">{startup.category}</span>
              <span className="chip border-violet-400/30 bg-violet-500/10 text-violet-300">{startup.stage}</span>
            </div>
          </div>
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      <dl className="relative mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-5 text-center">
        <div>
          <dt className="text-xs text-slate-500">Views</dt>
          <dd className="mt-1 flex items-center justify-center gap-1.5 text-lg font-bold text-white">
            <Icon name="eye" className="h-4 w-4 text-slate-400" /> {formatCount(startup.views)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Rating</dt>
          <dd className="mt-1 flex items-center justify-center gap-1.5 text-lg font-bold text-white">
            {rating ? (
              <>
                <Stars value={rating} size="h-4 w-4" /> {rating.toFixed(1)}
              </>
            ) : (
              <span className="text-sm font-medium text-slate-500">No ratings yet</span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Saves</dt>
          <dd className="mt-1 flex items-center justify-center gap-1.5 text-lg font-bold text-white">
            <Icon name="bookmark" className="h-4 w-4 text-slate-400" /> {formatCount(startup.saves)}
          </dd>
        </div>
      </dl>
    </div>
  )
}

export function ProfileOverview({ startup, founder, onEdit }: { startup: Startup; founder?: User; onEdit?: (step: number) => void }) {
  const edit = (step: number) =>
    onEdit && (
      <button type="button" onClick={() => onEdit(step)} className="inline-flex items-center gap-1 text-xs font-medium text-electric-400 hover:text-white">
        <Icon name="edit" className="h-3.5 w-3.5" /> Edit
      </button>
    )

  const block = (title: string, text: string, step: number) => (
    <section className="card p-5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">{title}</h3>
        {edit(step)}
      </div>
      <p className="whitespace-pre-line text-sm leading-relaxed text-slate-200">{text || 'Not provided yet.'}</p>
    </section>
  )

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        {block('About', startup.description, 0)}
        <div className="grid gap-6 sm:grid-cols-2">
          {block('The problem', startup.problem, 2)}
          {block('Who it is for', startup.audience, 2)}
        </div>
        {block('What makes it different', startup.different, 2)}
        <section className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Screenshots</h3>
            {edit(1)}
          </div>
          {startup.screenshots.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {startup.screenshots.map((src, i) => (
                <img key={i} src={src} alt={`${startup.name} screenshot ${i + 1}`} className="aspect-video w-full rounded-xl border border-white/10 object-cover" />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No screenshots added yet.</p>
          )}
        </section>
      </div>
      <aside className="space-y-6">
        <section className="card p-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Founder</h3>
          {founder ? (
            <Link to={`/founder/${founder.id}`} className="flex items-center gap-3 rounded-xl hover:bg-white/5">
              <Avatar name={founder.name} />
              <div>
                <p className="font-semibold text-white">{founder.name}</p>
                <p className="text-xs text-slate-500">{founder.location || 'View profile'}</p>
              </div>
            </Link>
          ) : (
            <p className="text-sm text-slate-500">Founder unavailable.</p>
          )}
        </section>
        <section className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Links</h3>
            {edit(0)}
          </div>
          {startup.website ? (
            <a
              href={startup.website}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center gap-2 break-all text-sm text-electric-400 hover:text-white"
            >
              <Icon name="link" className="h-4 w-4 shrink-0" /> {startup.website.replace(/^https?:\/\//, '')}
            </a>
          ) : (
            <p className="text-sm text-slate-500">No website listed.</p>
          )}
        </section>
      </aside>
    </div>
  )
}

export function Avatar({ name, size = 'h-11 w-11' }: { name: string; size?: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
  return (
    <div className={`${size} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-electric-500 to-violet-500 text-sm font-bold text-white`} aria-hidden="true">
      {initials || '?'}
    </div>
  )
}
