import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useStore } from '../lib/store'
import { timeAgo } from '../lib/util'
import { Icon } from '../components/Icons'
import { Avatar, ProfileHeader, ProfileOverview } from '../components/ProfileView'
import { Stars } from '../components/ui'

type Tab = 'overview' | 'updates' | 'feedback'

export default function StartupProfile() {
  const { slug } = useParams()
  const { startups, userById, currentUser, isSaved, toggleSave, incrementViews, addUpdate, addFeedback } = useStore()
  const startup = startups.find((s) => s.slug === slug)
  const [tab, setTab] = useState<Tab>('overview')
  const [update, setUpdate] = useState('')
  const [rating, setRating] = useState(5)
  const [text, setText] = useState('')
  const [fbError, setFbError] = useState('')

  const id = startup?.id
  const isOwner = Boolean(startup && currentUser && startup.founderId === currentUser.id)

  useEffect(() => {
    if (!id || isOwner) return
    try {
      const key = `viewed:${id}`
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, '1')
    } catch {
      return
    }
    incrementViews(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isOwner])

  if (!startup) {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="text-3xl font-extrabold">Startup not found</h1>
        <p className="mt-2 text-slate-400">It may have been removed, or the link is incorrect.</p>
        <Link to="/explore" className="btn-primary mt-6">Explore startups</Link>
      </div>
    )
  }

  const saved = isSaved(startup.id)
  const founder = userById(startup.founderId)
  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'updates', label: 'Updates', count: startup.updates.length },
    { id: 'feedback', label: 'Feedback', count: startup.feedback.length },
  ]

  const submitFeedback = (e: React.FormEvent) => {
    e.preventDefault()
    if (text.trim().length < 3) {
      setFbError('Write at least a few words of feedback.')
      return
    }
    addFeedback(startup.id, rating, text)
    setText('')
    setFbError('')
  }

  return (
    <div className="container-x py-10">
      <Link to="/explore" className="mb-5 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white">
        <Icon name="arrow" className="h-4 w-4 rotate-180" /> Back to Explore
      </Link>

      <ProfileHeader
        startup={startup}
        actions={
          <>
            <button type="button" onClick={() => toggleSave(startup.id)} aria-pressed={saved} className={saved ? 'btn-primary' : 'btn-ghost'}>
              <Icon name="bookmark" filled={saved} className="h-4 w-4" /> {saved ? 'Saved' : 'Save'}
            </button>
            {startup.website && (
              <a href={startup.website} target="_blank" rel="noopener noreferrer nofollow" className="btn-ghost">
                <Icon name="link" className="h-4 w-4" /> Visit website
              </a>
            )}
            {isOwner && (
              <Link to={`/launch/${startup.id}/edit`} className="btn-ghost">
                <Icon name="edit" className="h-4 w-4" /> Edit
              </Link>
            )}
          </>
        }
      />

      <div className="mt-8 flex gap-1 border-b border-white/10" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium ${tab === t.id ? 'border-electric-400 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && <span className="ml-1.5 text-xs text-slate-500">{t.count}</span>}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'overview' && <ProfileOverview startup={startup} founder={founder} />}

        {tab === 'updates' && (
          <div className="mx-auto max-w-2xl space-y-4">
            {isOwner && (
              <form
                className="card p-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  addUpdate(startup.id, update)
                  setUpdate('')
                }}
              >
                <label htmlFor="upd" className="label">Post an update</label>
                <textarea id="upd" className="input min-h-[90px]" maxLength={1000} value={update} onChange={(e) => setUpdate(e.target.value)} placeholder="Share progress, a new feature or a milestone" />
                <div className="mt-3 text-right">
                  <button type="submit" className="btn-primary !py-2" disabled={!update.trim()}>Post update</button>
                </div>
              </form>
            )}
            {startup.updates.length ? (
              startup.updates.map((u) => (
                <article key={u.id} className="card p-5">
                  <p className="text-xs text-slate-500">{timeAgo(u.createdAt)}</p>
                  <p className="mt-1 whitespace-pre-line text-sm text-slate-200">{u.text}</p>
                </article>
              ))
            ) : (
              <p className="card p-6 text-center text-sm text-slate-500">No updates yet.</p>
            )}
          </div>
        )}

        {tab === 'feedback' && (
          <div className="mx-auto max-w-2xl space-y-4">
            {currentUser ? (
              <form onSubmit={submitFeedback} className="card p-4">
                <p className="label">Leave feedback</p>
                <div className="mb-3 flex items-center gap-1" role="radiogroup" aria-label="Rating">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? 's' : ''}`} onClick={() => setRating(n)}>
                      <Icon name="star" filled={n <= rating} className={`h-6 w-6 ${n <= rating ? 'text-amber-400' : 'text-slate-600'}`} />
                    </button>
                  ))}
                </div>
                <textarea className="input min-h-[90px]" maxLength={1000} value={text} onChange={(e) => { setText(e.target.value); setFbError('') }} placeholder="What works well? What could be better?" aria-label="Feedback" />
                {fbError && <p role="alert" className="mt-1.5 text-xs font-medium text-red-400">{fbError}</p>}
                <div className="mt-3 text-right">
                  <button type="submit" className="btn-primary !py-2">Submit feedback</button>
                </div>
              </form>
            ) : (
              <div className="card p-5 text-sm text-slate-400">
                <Link to={`/login?next=/startup/${startup.slug}`} className="font-semibold text-electric-400 hover:text-white">Log in</Link> to leave feedback.
              </div>
            )}
            {startup.feedback.length ? (
              startup.feedback.map((f) => (
                <article key={f.id} className="card p-5">
                  <div className="flex items-center gap-3">
                    <Avatar name={f.authorName} size="h-9 w-9" />
                    <div>
                      <p className="text-sm font-semibold text-white">{f.authorName}</p>
                      <p className="text-xs text-slate-500">{timeAgo(f.createdAt)}</p>
                    </div>
                    <div className="ml-auto"><Stars value={f.rating} /></div>
                  </div>
                  <p className="mt-3 whitespace-pre-line text-sm text-slate-200">{f.text}</p>
                </article>
              ))
            ) : (
              <p className="card p-6 text-center text-sm text-slate-500">No feedback yet. Be the first.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
