import { Link } from 'react-router-dom'
import { useStore } from '../lib/store'
import { DEMO_STORIES } from '../lib/seed'
import { CATEGORIES, popularity, timeAgo } from '../lib/util'
import { Icon, categoryIcon } from '../components/Icons'
import { StartupCard } from '../components/StartupCard'
import { Avatar } from '../components/ProfileView'
import { DemoBadge, Logo, SectionHeading } from '../components/ui'

export default function Home() {
  const { startups, opportunities, userById } = useStore()
  const trending = [...startups].sort((a, b) => popularity(b) - popularity(a)).slice(0, 4)
  const floating = trending.slice(0, 3)
  const opps = opportunities.slice(0, 4)

  return (
    <div className="container-x">
      {/* Hero */}
      <section className="relative grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-electric-400">Discover · Build · Grow</p>
          <h1 className="text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
            Discover What the World Will Use{' '}
            <span className="bg-gradient-to-r from-electric-400 to-violet-400 bg-clip-text text-transparent">Next.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-slate-400">
            Discover promising startups, explore innovative products, meet talented people, and turn your ideas into something real.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/explore" className="btn-primary !px-6 !py-3">
              Explore Startups <Icon name="arrow" className="h-4 w-4" />
            </Link>
            <Link to="/launch" className="btn-ghost !px-6 !py-3">
              Launch Your Startup
            </Link>
          </div>
          <p className="mt-6 text-xs text-slate-500">
            Listings you see below are fictional demonstration data until real founders start publishing.
          </p>
        </div>

        <div className="relative mx-auto hidden h-[420px] w-full max-w-lg lg:block" aria-hidden="true">
          <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-electric-500 via-violet-500 to-ink-700 opacity-80 blur-sm" />
          <div className="absolute left-1/2 top-1/2 h-80 w-[26rem] -translate-x-1/2 -translate-y-1/2 -rotate-[20deg] rounded-[50%] border-2 border-violet-400/50" />
          <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-electric-500/20 blur-3xl" />
          {floating.map((s, i) => (
            <div
              key={s.id}
              className={`card absolute w-64 bg-ink-800/90 p-4 shadow-glow backdrop-blur ${i === 0 ? 'floaty left-0 top-4' : i === 1 ? 'floaty-2 right-0 top-1/3' : 'floaty bottom-2 left-8'}`}
            >
              <div className="flex items-center gap-3">
                <Logo startup={s} size="h-10 w-10" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{s.name}</p>
                  <p className="line-clamp-2 text-xs text-slate-400">{s.tagline}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section className="py-10">
        <SectionHeading title="Trending startups" subtitle="Ranked by views and saves (demonstration numbers)." to="/explore?sort=popular" />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {trending.map((s) => (
            <StartupCard key={s.id} startup={s} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-10">
        <SectionHeading title="Popular categories" subtitle="Browse by what people are building." to="/explore" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((c) => {
            const count = startups.filter((s) => s.category === c).length
            return (
              <Link key={c} to={`/explore?category=${encodeURIComponent(c)}`} className="card group flex flex-col gap-3 p-4 transition hover:border-electric-400/40 hover:bg-ink-700/70">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-electric-500/15 text-electric-400 group-hover:bg-electric-500/25">
                  <Icon name={categoryIcon(c)} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{c}</p>
                  <p className="text-xs text-slate-500">
                    {count} {count === 1 ? 'startup' : 'startups'}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Opportunities + stories */}
      <section className="grid gap-8 py-10 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <SectionHeading title="Collaboration opportunities" to="/community?tab=opportunities" />
          <div className="space-y-3">
            {opps.map((o) => (
              <Link key={o.id} to="/community?tab=opportunities" className="card flex items-center gap-3 p-4 hover:border-electric-400/40">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400">
                  <Icon name={o.type === 'Hackathon' ? 'bolt' : o.type === 'Challenge' ? 'trending' : 'users'} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{o.title}</p>
                  <p className="text-xs text-slate-500">
                    {o.type} · {o.authorName} · {timeAgo(o.createdAt)}
                  </p>
                </div>
                {o.demo && <DemoBadge />}
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          <SectionHeading title="Founder stories" subtitle="Fictional demonstration stories until real ones are shared." />
          <div className="grid gap-4 sm:grid-cols-3">
            {DEMO_STORIES.map((st) => {
              const f = userById(st.founderId)
              const s = startups.find((x) => x.slug === st.startupSlug)
              if (!f || !s) return null
              return (
                <Link key={st.startupSlug} to={`/startup/${s.slug}`} className="card flex flex-col p-5 hover:border-electric-400/40">
                  <p className="flex-1 text-sm leading-relaxed text-slate-200">“{st.quote}”</p>
                  <div className="mt-4 flex items-center gap-3">
                    <Avatar name={f.name} size="h-9 w-9" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{f.name}</p>
                      <p className="truncate text-xs text-slate-500">Founder of {s.name}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <DemoBadge />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Launch CTA */}
      <section className="py-10">
        <div className="card relative overflow-hidden p-8 sm:p-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-violet-500/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-electric-500/20 blur-3xl" />
          <div className="relative grid items-center gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-extrabold">Launch your startup</h2>
              <p className="mt-3 max-w-md text-slate-400">
                Create a beautiful startup page in four short steps, get discovered, collect feedback and find collaborators.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-slate-300">
                {['Guided four-step launch wizard', 'Save drafts and preview before publishing', 'Updates, feedback and a shareable page'].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <Icon name="check" className="h-4 w-4 text-emerald-400" /> {t}
                  </li>
                ))}
              </ul>
              <Link to="/launch" className="btn-primary mt-7 !px-6 !py-3">
                Start now <Icon name="arrow" className="h-4 w-4" />
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="mx-auto max-w-xs -rotate-2">
                <StartupCard
                  preview
                  startup={{
                    id: 'p', slug: 'p', name: 'Your Startup', tagline: 'What you are building, in one line.', description: '', category: 'Your category',
                    website: '', logo: '', screenshots: [], color: '#8b5cf6', problem: '', audience: '', different: '', stage: 'Idea', founderId: '',
                    createdAt: new Date().toISOString(), views: 0, saves: 0, demo: false, updates: [], feedback: [],
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
