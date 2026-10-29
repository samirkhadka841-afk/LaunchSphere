import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { isSupabaseConfigured } from '../lib/supabase'
import { Icon, type IconName } from './Icons'
import { Avatar } from './ProfileView'

const NAV: { to: string; label: string; icon: IconName }[] = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/explore', label: 'Explore', icon: 'search' },
  { to: '/launch', label: 'Launch', icon: 'rocket' },
  { to: '/community', label: 'Community', icon: 'users' },
  { to: '/tools', label: 'Tools', icon: 'grid' },
  { to: '/resources', label: 'Resources', icon: 'book' },
]

export function BrandLogo() {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="LaunchSphere home">
      <svg viewBox="0 0 64 64" className="h-9 w-9" aria-hidden="true">
        <defs>
          <linearGradient id="ls-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#3b74ff" />
            <stop offset="1" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="22" fill="url(#ls-g)" />
        <ellipse cx="32" cy="32" rx="30" ry="9" fill="none" stroke="#a78bfa" strokeWidth="3" transform="rotate(-20 32 32)" />
      </svg>
      <span className="text-xl font-extrabold tracking-tight text-white">LaunchSphere</span>
    </Link>
  )
}

function SearchBar({ className = '', onDone }: { className?: string; onDone?: () => void }) {
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const t = q.trim()
    nav(t ? `/explore?q=${encodeURIComponent(t)}` : '/explore')
    onDone?.()
  }
  return (
    <form onSubmit={submit} role="search" className={className}>
      <div className="relative">
        <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search startups…"
          aria-label="Search startups"
          maxLength={80}
          className="input rounded-full !py-2 pl-9"
        />
      </div>
    </form>
  )
}

function UserMenu() {
  const { currentUser, logout } = useStore()
  const [open, setOpen] = useState(false)
  const nav = useNavigate()
  const { pathname } = useLocation()
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  if (!currentUser) {
    return (
      <div className="flex items-center gap-2">
        <Link to="/login" className="btn-ghost !px-3.5 !py-2">
          Log in
        </Link>
        <Link to="/signup" className="btn-primary !px-3.5 !py-2">
          Sign up
        </Link>
      </div>
    )
  }
  const items: { to: string; label: string; icon: IconName }[] = [
    { to: '/dashboard', label: 'Dashboard', icon: 'chart' },
    { to: `/founder/${currentUser.id}`, label: 'My profile', icon: 'user' },
    { to: '/saved', label: 'Saved startups', icon: 'bookmark' },
    { to: '/settings', label: 'Settings', icon: 'sliders' },
  ]
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="menu" aria-label="Open account menu" className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-400">
        <Avatar name={currentUser.name} size="h-9 w-9" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div role="menu" className="card absolute right-0 z-50 mt-2 w-56 overflow-hidden bg-ink-800 p-1.5 shadow-xl">
            <div className="border-b border-white/10 px-3 py-2">
              <p className="truncate text-sm font-semibold text-white">{currentUser.name}</p>
              <p className="truncate text-xs text-slate-500">{currentUser.email}</p>
            </div>
            {items.map((i) => (
              <Link key={i.to} to={i.to} role="menuitem" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
                <Icon name={i.icon} className="h-4 w-4" /> {i.label}
              </Link>
            ))}
            <button
              type="button"
              role="menuitem"
              onClick={async () => {
                await logout()
                nav('/')
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/5 hover:text-white"
            >
              <Icon name="logout" className="h-4 w-4" /> Log out
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function Header() {
  const [mobile, setMobile] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => {
    setMobile(false)
  }, [pathname])

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-ink-950/80 backdrop-blur-lg">
      <div className="container-x flex h-16 items-center gap-4">
        <BrandLogo />
        <nav className="ml-4 hidden items-center gap-1 xl:flex" aria-label="Main">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-electric-500/15 text-electric-400' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`
              }
            >
              <Icon name={n.icon} className="h-4 w-4" /> {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto hidden w-full max-w-xs md:block xl:max-w-sm">
          <SearchBar />
        </div>
        <div className="ml-auto md:ml-0">
          <UserMenu />
        </div>
        <button type="button" onClick={() => setMobile((m) => !m)} aria-label="Toggle menu" aria-expanded={mobile} className="rounded-lg p-2 text-slate-300 hover:bg-white/5 xl:hidden">
          <Icon name={mobile ? 'x' : 'menu'} />
        </button>
      </div>
      {mobile && (
        <div className="border-t border-white/10 bg-ink-900 xl:hidden">
          <div className="container-x space-y-1 py-3">
            <SearchBar className="mb-3 md:hidden" onDone={() => setMobile(false)} />
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-electric-500/15 text-electric-400' : 'text-slate-300 hover:bg-white/5'}`
                }
              >
                <Icon name={n.icon} className="h-4 w-4" /> {n.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}

function ModeBanner() {
  return (
    <div className="border-b border-amber-400/20 bg-amber-400/5 px-4 py-1.5 text-center text-xs text-amber-200/90">
      {isSupabaseConfigured
        ? 'Accounts use Supabase. Startups, posts and uploads are still stored in this browser only (prototype). Sample listings are fictional demonstration data.'
        : 'Prototype mode: accounts and data are stored only in this browser. Sample listings are fictional demonstration data.'}
    </div>
  )
}

function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-ink-900/60">
      <div className="container-x grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <BrandLogo />
          <p className="mt-3 max-w-xs text-sm text-slate-500">Discover startups, showcase projects, find collaborators and grow.</p>
        </div>
        <FooterCol title="Product" links={[['/explore', 'Explore'], ['/launch', 'Launch a startup'], ['/saved', 'Saved'], ['/tools', 'Tools']]} />
        <FooterCol title="Community" links={[['/community', 'Discussions'], ['/community?tab=opportunities', 'Opportunities'], ['/resources', 'Resources']]} />
        <FooterCol title="Account" links={[['/login', 'Log in'], ['/signup', 'Sign up'], ['/dashboard', 'Dashboard'], ['/settings', 'Settings']]} />
      </div>
      <div className="border-t border-white/5 py-4 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} LaunchSphere. Demonstration data is fictional.
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-200">{title}</h4>
      <ul className="space-y-2 text-sm">
        {links.map(([to, label]) => (
          <li key={to}>
            <Link to={to} className="text-slate-500 hover:text-white">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Layout() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return (
    <div className="flex min-h-screen flex-col">
      <ModeBanner />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { currentUser } = useStore()
  const { pathname } = useLocation()
  if (!currentUser) return <Navigate to={`/login?next=${encodeURIComponent(pathname)}`} replace />
  return <>{children}</>
}
