import { Link } from 'react-router-dom'
import type { Startup } from '../lib/types'
import { formatCount, timeAgo } from '../lib/util'
import { useStore } from '../lib/store'
import { Icon } from './Icons'
import { DemoBadge, Logo } from './ui'

export function StartupCard({ startup, preview = false }: { startup: Startup; preview?: boolean }) {
  const { isSaved, toggleSave } = useStore()
  const saved = !preview && isSaved(startup.id)

  const top = (
    <>
      <div className="flex items-start gap-3">
        <Logo startup={startup} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-base font-semibold text-white">{startup.name}</h3>
            <span className="chip shrink-0 border-violet-400/30 bg-violet-500/10 text-violet-300">{startup.stage}</span>
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-slate-400">{startup.tagline}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="chip">{startup.category}</span>
        {startup.demo && <DemoBadge />}
      </div>
    </>
  )

  const stats = (
    <div className="flex items-center gap-3 text-xs text-slate-500">
      <span className="inline-flex items-center gap-1" title="Views">
        <Icon name="eye" className="h-3.5 w-3.5" />
        {formatCount(startup.views)}
      </span>
      <span className="inline-flex items-center gap-1" title="Saves">
        <Icon name="bookmark" className="h-3.5 w-3.5" />
        {formatCount(startup.saves)}
      </span>
    </div>
  )

  const date = (
    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
      <Icon name="calendar" className="h-3.5 w-3.5" />
      {preview ? 'Just now' : timeAgo(startup.createdAt)}
    </span>
  )

  if (preview) {
    return (
      <div className="card p-5">
        {top}
        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
          {date}
          {stats}
        </div>
      </div>
    )
  }

  return (
    <div className="card group p-5 transition hover:border-electric-400/40 hover:bg-ink-700/70">
      <Link
        to={`/startup/${startup.slug}`}
        className="block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-400"
        aria-label={`Open ${startup.name}`}
      >
        {top}
      </Link>
      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
        <div className="flex items-center gap-4">
          {date}
          {stats}
        </div>
        <button
          type="button"
          onClick={() => toggleSave(startup.id)}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${startup.name} from saved` : `Save ${startup.name}`}
          title={saved ? 'Saved. Click to remove' : 'Save for later'}
          className={`rounded-lg p-1.5 transition ${saved ? 'text-electric-400' : 'text-slate-500 hover:text-white'}`}
        >
          <Icon name="bookmark" filled={saved} className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
