import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageTitle } from '../components/ui'

const GUIDES = [
  {
    title: 'Write a startup description people understand',
    body: 'Start with who it is for, then the problem, then how you solve it. Skip buzzwords. If a stranger cannot repeat it back in one sentence, simplify it.',
  },
  {
    title: 'Get useful early feedback',
    body: 'Ask specific questions ("Where did you get stuck?") instead of "What do you think?". Talk to five people from your target audience before you ask the crowd.',
  },
  {
    title: 'Choose screenshots that sell the product',
    body: 'Show the single screen that delivers the core value first. Crop out empty states, add short captions and keep the file size small so pages load fast.',
  },
  {
    title: 'Find the right collaborator',
    body: 'Be concrete about the skills you need, the time commitment and what you can offer. A short trial project is a better test than a long conversation.',
  },
  {
    title: 'Plan your first month after launch',
    body: 'Post a short update every week, answer all feedback within two days and decide on one number you will track, such as saves, sign-ups or conversations.',
  },
]

export default function Resources() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="container-x py-10">
      <PageTitle title="Resources" subtitle="Short guides for founders at every stage." />
      <div className="mx-auto max-w-3xl space-y-3">
        {GUIDES.map((g, i) => (
          <div key={g.title} className="card overflow-hidden">
            <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-4 p-5 text-left">
              <span className="font-semibold text-white">{g.title}</span>
              <span className="text-xl text-slate-500">{open === i ? '−' : '+'}</span>
            </button>
            {open === i && <p className="px-5 pb-5 text-sm leading-relaxed text-slate-300">{g.body}</p>}
          </div>
        ))}
        <div className="pt-6 text-center">
          <Link to="/launch" className="btn-primary">Ready? Launch your startup</Link>
        </div>
      </div>
    </div>
  )
}
