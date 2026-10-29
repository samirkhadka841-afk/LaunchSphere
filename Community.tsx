import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useStore } from '../lib/store'
import type { OpportunityType } from '../lib/types'
import { timeAgo } from '../lib/util'
import { Icon } from '../components/Icons'
import { Avatar } from '../components/ProfileView'
import { DemoBadge, PageTitle } from '../components/ui'

const TAGS = ['Discussion', 'Advice', 'Growth', 'Collaboration']
const TYPES: OpportunityType[] = ['Co-founder', 'Collaboration', 'Hackathon', 'Challenge']

export default function Community() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'opportunities' ? 'opportunities' : 'discussions'
  const { currentUser, posts, opportunities, addPost, addComment, addOpportunity, toggleInterest } = useStore()

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tag, setTag] = useState(TAGS[0])
  const [postErr, setPostErr] = useState('')
  const [open, setOpen] = useState<string | null>(null)
  const [comment, setComment] = useState('')

  const [oType, setOType] = useState<OpportunityType>('Co-founder')
  const [oTitle, setOTitle] = useState('')
  const [oDetail, setODetail] = useState('')
  const [oErr, setOErr] = useState('')

  const loginHint = (
    <div className="card p-4 text-sm text-slate-400">
      <Link to="/login?next=/community" className="font-semibold text-electric-400 hover:text-white">Log in</Link> or{' '}
      <Link to="/signup?next=/community" className="font-semibold text-electric-400 hover:text-white">sign up</Link> to take part.
    </div>
  )

  const submitPost = (e: FormEvent) => {
    e.preventDefault()
    if (title.trim().length < 5) return setPostErr('Give your post a title (at least 5 characters).')
    if (body.trim().length < 10) return setPostErr('Write a little more (at least 10 characters).')
    if (!addPost(title, body, tag)) return setPostErr('Could not save the post. Browser storage may be full.')
    setTitle('')
    setBody('')
    setPostErr('')
  }

  const submitOpp = (e: FormEvent) => {
    e.preventDefault()
    if (oTitle.trim().length < 5) return setOErr('Give it a title (at least 5 characters).')
    if (oDetail.trim().length < 10) return setOErr('Add some detail (at least 10 characters).')
    if (!addOpportunity(oType, oTitle, oDetail)) return setOErr('Could not save. Browser storage may be full.')
    setOTitle('')
    setODetail('')
    setOErr('')
  }

  return (
    <div className="container-x py-10">
      <PageTitle title="Community" subtitle="Ask questions, share progress and find people to build with." />

      <div className="mb-6 flex gap-2" role="tablist">
        {(['discussions', 'opportunities'] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            type="button"
            onClick={() => setParams(t === 'discussions' ? {} : { tab: t }, { replace: true })}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium capitalize ${tab === t ? 'border-electric-400 bg-electric-500/15 text-electric-400' : 'border-white/10 text-slate-400 hover:bg-white/5'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'discussions' ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {posts.map((p) => (
              <article key={p.id} className="card p-5">
                <div className="flex items-start gap-3">
                  <Avatar name={p.authorName} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <Link to={`/founder/${p.authorId}`} className="font-semibold text-slate-200 hover:text-white">{p.authorName}</Link>
                      <span>{timeAgo(p.createdAt)}</span>
                      <span className="chip">{p.tag}</span>
                      {p.demo && <DemoBadge />}
                    </div>
                    <h3 className="mt-1.5 text-base font-semibold text-white">{p.title}</h3>
                    <p className="mt-1 whitespace-pre-line text-sm text-slate-300">{p.body}</p>
                    <button type="button" onClick={() => setOpen(open === p.id ? null : p.id)} aria-expanded={open === p.id} className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-electric-400 hover:text-white">
                      <Icon name="chat" className="h-4 w-4" /> {p.comments.length} {p.comments.length === 1 ? 'comment' : 'comments'}
                    </button>
                  </div>
                </div>
                {open === p.id && (
                  <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
                    {p.comments.map((c) => (
                      <div key={c.id} className="flex gap-3">
                        <Avatar name={c.authorName} size="h-8 w-8" />
                        <div className="rounded-xl bg-white/5 px-3 py-2">
                          <p className="text-xs text-slate-500"><span className="font-semibold text-slate-200">{c.authorName}</span> · {timeAgo(c.createdAt)}</p>
                          <p className="mt-0.5 whitespace-pre-line text-sm text-slate-300">{c.text}</p>
                        </div>
                      </div>
                    ))}
                    {currentUser ? (
                      <form
                        className="flex gap-2"
                        onSubmit={(e) => {
                          e.preventDefault()
                          addComment(p.id, comment)
                          setComment('')
                        }}
                      >
                        <input className="input" value={comment} maxLength={1000} onChange={(e) => setComment(e.target.value)} placeholder="Write a comment" aria-label="Comment" />
                        <button type="submit" className="btn-primary !py-2" disabled={!comment.trim()}>Reply</button>
                      </form>
                    ) : (
                      loginHint
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>

          <aside>
            {currentUser ? (
              <form onSubmit={submitPost} className="card sticky top-24 space-y-3 p-5">
                <h2 className="text-base font-bold">Start a discussion</h2>
                <input className="input" placeholder="Title" aria-label="Title" maxLength={120} value={title} onChange={(e) => { setTitle(e.target.value); setPostErr('') }} />
                <textarea className="input min-h-[110px]" placeholder="What would you like to discuss?" aria-label="Post body" maxLength={2000} value={body} onChange={(e) => { setBody(e.target.value); setPostErr('') }} />
                <select className="input" aria-label="Tag" value={tag} onChange={(e) => setTag(e.target.value)}>
                  {TAGS.map((t) => <option key={t}>{t}</option>)}
                </select>
                {postErr && <p role="alert" className="text-xs font-medium text-red-400">{postErr}</p>}
                <button type="submit" className="btn-primary w-full">Post</button>
              </form>
            ) : (
              loginHint
            )}
          </aside>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {opportunities.map((o) => {
              const joined = currentUser ? o.interested.includes(currentUser.id) : false
              return (
                <article key={o.id} className="card flex flex-wrap items-start gap-4 p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400">
                    <Icon name={o.type === 'Hackathon' ? 'bolt' : o.type === 'Challenge' ? 'trending' : 'users'} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="chip border-violet-400/30 bg-violet-500/10 text-violet-300">{o.type}</span>
                      <span>{o.authorName} · {timeAgo(o.createdAt)}</span>
                      {o.demo && <DemoBadge />}
                    </div>
                    <h3 className="mt-1.5 text-base font-semibold text-white">{o.title}</h3>
                    <p className="mt-1 text-sm text-slate-300">{o.detail}</p>
                    <p className="mt-2 text-xs text-slate-500">{o.interested.length} interested</p>
                  </div>
                  {currentUser ? (
                    <button type="button" onClick={() => toggleInterest(o.id)} aria-pressed={joined} className={joined ? 'btn-primary !py-2' : 'btn-ghost !py-2'}>
                      {joined ? 'Interested ✓' : "I'm interested"}
                    </button>
                  ) : (
                    <Link to="/login?next=/community%3Ftab%3Dopportunities" className="btn-ghost !py-2">Log in to respond</Link>
                  )}
                </article>
              )
            })}
          </div>
          <aside>
            {currentUser ? (
              <form onSubmit={submitOpp} className="card sticky top-24 space-y-3 p-5">
                <h2 className="text-base font-bold">Post an opportunity</h2>
                <select className="input" aria-label="Type" value={oType} onChange={(e) => setOType(e.target.value as OpportunityType)}>
                  {TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
                <input className="input" placeholder="Title" aria-label="Title" maxLength={120} value={oTitle} onChange={(e) => { setOTitle(e.target.value); setOErr('') }} />
                <textarea className="input min-h-[100px]" placeholder="Describe who you are looking for" aria-label="Details" maxLength={1000} value={oDetail} onChange={(e) => { setODetail(e.target.value); setOErr('') }} />
                {oErr && <p role="alert" className="text-xs font-medium text-red-400">{oErr}</p>}
                <button type="submit" className="btn-primary w-full">Post opportunity</button>
              </form>
            ) : (
              loginHint
            )}
          </aside>
        </div>
      )}
    </div>
  )
}
