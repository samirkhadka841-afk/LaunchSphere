import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../lib/store'
import { avgRating, formatCount, timeAgo } from '../lib/util'
import { Icon } from '../components/Icons'
import { Logo, PageTitle, Stars } from '../components/ui'

export default function Dashboard() {
  const { currentUser, startups, draft, clearDraft, deleteStartup } = useStore()
  const [confirm, setConfirm] = useState<string | null>(null)
  const mine = startups.filter((s) => s.founderId === currentUser?.id)

  const views = mine.reduce((a, s) => a + s.views, 0)
  const saves = mine.reduce((a, s) => a + s.saves, 0)
  const feedback = mine.flatMap((s) => s.feedback)
  const avg = feedback.length ? feedback.reduce((a, f) => a + f.rating, 0) / feedback.length : 0

  const activity = mine
    .flatMap((s) => [
      ...s.updates.map((u) => ({ at: u.createdAt, text: `You posted an update on ${s.name}` })),
      ...s.feedback.map((f) => ({ at: f.createdAt, text: `${f.authorName} left ${f.rating}-star feedback on ${s.name}` })),
      { at: s.createdAt, text: `${s.name} was published` },
    ])
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 6)

  return (
    <div className="container-x py-10">
      <PageTitle title="Dashboard" subtitle={`Welcome back, ${currentUser?.name.split(' ')[0] ?? ''}. Manage your startups and see how they are doing.`}>
        <Link to="/launch" className="btn-primary"><Icon name="plus" className="h-4 w-4" /> New startup</Link>
      </PageTitle>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Startups', value: String(mine.length) },
          { label: 'Total views', value: formatCount(views) },
          { label: 'Total saves', value: formatCount(saves) },
          { label: 'Average rating', value: avg ? avg.toFixed(1) : '—' },
        ].map((k) => (
          <div key={k.label} className="card p-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">{k.label}</p>
            <p className="mt-2 text-3xl font-extrabold text-white">{k.value}</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-slate-500">Analytics in prototype mode are counted in this browser only.</p>

      {draft && (
        <div className="card mt-8 flex flex-wrap items-center justify-between gap-3 border-amber-400/30 bg-amber-400/5 p-5">
          <div>
            <p className="font-semibold text-white">Unpublished draft: {draft.name || 'Untitled startup'}</p>
            <p className="text-sm text-slate-400">Pick up where you left off.</p>
          </div>
          <div className="flex gap-2">
            <Link to="/launch" className="btn-primary !py-2">Continue draft</Link>
            <button type="button" onClick={clearDraft} className="btn-ghost !py-2">Discard</button>
          </div>
        </div>
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <h2 className="mb-4 text-xl font-bold">Your startups</h2>
          {mine.length ? (
            <div className="space-y-3">
              {mine.map((s) => (
                <div key={s.id} className="card flex flex-wrap items-center gap-4 p-4">
                  <Logo startup={s} />
                  <div className="min-w-0 flex-1">
                    <Link to={`/startup/${s.slug}`} className="font-semibold text-white hover:text-electric-400">{s.name}</Link>
                    <p className="truncate text-sm text-slate-500">{s.category} · {s.stage} · {formatCount(s.views)} views · {s.saves} saves</p>
                    {s.feedback.length > 0 && <div className="mt-1 flex items-center gap-2 text-xs text-slate-500"><Stars value={avgRating(s)} size="h-3.5 w-3.5" /> {s.feedback.length} reviews</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/launch/${s.id}/edit`} className="btn-ghost !px-3 !py-2" aria-label={`Edit ${s.name}`}><Icon name="edit" className="h-4 w-4" /> Edit</Link>
                    {confirm === s.id ? (
                      <>
                        <button type="button" className="btn-danger !px-3 !py-2" onClick={() => { deleteStartup(s.id); setConfirm(null) }}>Confirm delete</button>
                        <button type="button" className="btn-ghost !px-3 !py-2" onClick={() => setConfirm(null)}>Cancel</button>
                      </>
                    ) : (
                      <button type="button" className="btn-ghost !px-3 !py-2" aria-label={`Delete ${s.name}`} onClick={() => setConfirm(s.id)}><Icon name="trash" className="h-4 w-4" /></button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <p className="text-slate-400">You have not published a startup yet.</p>
              <Link to="/launch" className="btn-primary mt-4">Launch your first startup</Link>
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold">Recent activity</h2>
          <div className="card divide-y divide-white/5">
            {activity.length ? (
              activity.map((a, i) => (
                <div key={i} className="flex items-start justify-between gap-3 p-4 text-sm">
                  <span className="text-slate-300">{a.text}</span>
                  <span className="shrink-0 text-xs text-slate-500">{timeAgo(a.at)}</span>
                </div>
              ))
            ) : (
              <p className="p-5 text-sm text-slate-500">Activity will appear here.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
