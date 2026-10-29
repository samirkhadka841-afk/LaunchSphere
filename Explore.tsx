import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useStore } from '../lib/store'
import { CATEGORIES, STAGES, popularity } from '../lib/util'
import { StartupCard } from '../components/StartupCard'
import { EmptyState, PageTitle } from '../components/ui'
import { Icon } from '../components/Icons'

type Sort = 'popular' | 'newest' | 'saved'

export default function Explore() {
  const { startups } = useStore()
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const category = params.get('category') ?? ''
  const stage = params.get('stage') ?? ''
  const sort = (params.get('sort') as Sort) || 'popular'

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const results = useMemo(() => {
    const term = q.trim().toLowerCase()
    const list = startups.filter((s) => {
      if (category && s.category !== category) return false
      if (stage && s.stage !== stage) return false
      if (!term) return true
      return [s.name, s.tagline, s.description, s.category].some((t) => t.toLowerCase().includes(term))
    })
    return list.sort((a, b) => {
      if (sort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sort === 'saved') return b.saves - a.saves
      return popularity(b) - popularity(a)
    })
  }, [startups, q, category, stage, sort])

  const hasFilters = Boolean(q || category || stage)

  return (
    <div className="container-x py-10">
      <PageTitle title="Explore startups" subtitle="Search and filter by category, stage and popularity." />

      <div className="card mb-6 grid gap-3 p-4 md:grid-cols-4">
        <div className="relative md:col-span-2">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input className="input pl-9" placeholder="Search by name, tagline or description" aria-label="Search startups" value={q} maxLength={80} onChange={(e) => update('q', e.target.value)} />
        </div>
        <select className="input" aria-label="Category" value={category} onChange={(e) => update('category', e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select className="input" aria-label="Sort by" value={sort} onChange={(e) => update('sort', e.target.value)}>
          <option value="popular">Most popular</option>
          <option value="saved">Most saved</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Stage</span>
        {[{ value: '', label: 'Any' }, ...STAGES].map((s) => (
          <button
            key={s.value || 'any'}
            type="button"
            aria-pressed={stage === s.value}
            onClick={() => update('stage', s.value)}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${stage === s.value ? 'border-electric-400 bg-electric-500/15 text-electric-400' : 'border-white/10 text-slate-400 hover:bg-white/5'}`}
          >
            {s.label}
          </button>
        ))}
        {hasFilters && (
          <button type="button" onClick={() => setParams({}, { replace: true })} className="ml-auto text-xs text-slate-400 hover:text-white">
            Clear all filters
          </button>
        )}
      </div>

      <p className="mb-4 text-sm text-slate-500" role="status">
        {results.length} {results.length === 1 ? 'startup' : 'startups'}
        {category && ` in ${category}`}
        {q && ` matching “${q}”`}
      </p>

      {results.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((s) => (
            <StartupCard key={s.id} startup={s} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No startups match"
          body="Try a different search or clear your filters. Or be the first to launch something in this space."
          action={<Link to="/launch" className="btn-primary">Launch your startup</Link>}
        />
      )}
    </div>
  )
}
