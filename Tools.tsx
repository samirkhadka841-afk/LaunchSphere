import { useEffect, useState } from 'react'
import { PageTitle } from '../components/ui'
import { Icon } from '../components/Icons'

const CHECKLIST = [
  'Write a one-sentence description of the problem you solve',
  'Talk to at least five people in your target audience',
  'Create a simple landing page or startup profile',
  'Prepare two or three clear screenshots',
  'Decide how you will collect feedback',
  'List ten places your audience already gathers',
  'Plan your first week of updates after launch',
]

const KEY = 'launchsphere:checklist'

export default function Tools() {
  const [done, setDone] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? '[]') as string[]
    } catch {
      return []
    }
  })
  const [tagline, setTagline] = useState('')

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(done))
    } catch {
      /* ignore */
    }
  }, [done])

  const words = tagline.trim() ? tagline.trim().split(/\s+/).length : 0
  const tips: string[] = []
  if (tagline.trim()) {
    if (tagline.length > 100) tips.push('Over 100 characters: LaunchSphere will not accept it. Trim it down.')
    if (words > 12) tips.push('More than 12 words. Short taglines are easier to remember.')
    if (words < 4) tips.push('Very short. Add who it is for or what it does.')
    if (/\b(best|revolutionary|world-class|leading)\b/i.test(tagline)) tips.push('Avoid vague superlatives. Say something specific.')
    if (!tips.length) tips.push('Looks clear and concise.')
  }

  return (
    <div className="container-x py-10">
      <PageTitle title="Tools" subtitle="Small, practical helpers for founders. They run entirely in your browser." />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="text-lg font-bold">Launch checklist</h2>
          <p className="mt-1 text-sm text-slate-400">{done.length} of {CHECKLIST.length} complete. Progress is saved in this browser.</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-electric-500 to-violet-500 transition-all" style={{ width: `${(done.length / CHECKLIST.length) * 100}%` }} />
          </div>
          <ul className="mt-5 space-y-2">
            {CHECKLIST.map((item) => {
              const on = done.includes(item)
              return (
                <li key={item}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg p-2 hover:bg-white/5">
                    <input type="checkbox" className="mt-0.5 h-4 w-4 accent-electric-500" checked={on} onChange={() => setDone((d) => (on ? d.filter((x) => x !== item) : [...d, item]))} />
                    <span className={`text-sm ${on ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{item}</span>
                  </label>
                </li>
              )
            })}
          </ul>
          {done.length > 0 && <button type="button" className="mt-3 text-xs text-slate-400 hover:text-white" onClick={() => setDone([])}>Reset checklist</button>}
        </section>

        <section className="card p-6">
          <h2 className="text-lg font-bold">Tagline checker</h2>
          <p className="mt-1 text-sm text-slate-400">Paste a tagline and get quick, rule-based feedback.</p>
          <input className="input mt-4" aria-label="Tagline" placeholder="e.g. Plan your week around what matters" value={tagline} maxLength={160} onChange={(e) => setTagline(e.target.value)} />
          <p className="mt-2 text-xs text-slate-500">{tagline.length} characters · {words} words</p>
          <ul className="mt-3 space-y-2">
            {tips.map((t) => (
              <li key={t} className="flex gap-2 text-sm text-slate-300"><Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-electric-400" /> {t}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
