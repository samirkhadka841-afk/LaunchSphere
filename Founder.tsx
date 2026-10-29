import { Link, useParams } from 'react-router-dom'
import { useStore } from '../lib/store'
import { Avatar } from '../components/ProfileView'
import { StartupCard } from '../components/StartupCard'
import { DemoBadge } from '../components/ui'
import { Icon } from '../components/Icons'

export default function Founder() {
  const { id } = useParams()
  const { userById, startups, currentUser } = useStore()
  const user = id ? userById(id) : undefined
  const isSelf = Boolean(user && currentUser && user.id === currentUser.id)

  if (!user) {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="text-3xl font-extrabold">Founder not found</h1>
        <Link to="/explore" className="btn-primary mt-6">Explore startups</Link>
      </div>
    )
  }
  if (!user.settings.profilePublic && !isSelf) {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="text-3xl font-extrabold">This profile is private</h1>
        <p className="mt-2 text-slate-400">The founder has chosen not to show their profile publicly.</p>
      </div>
    )
  }

  const projects = startups.filter((s) => s.founderId === user.id)
  const joined = new Date(user.joined).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

  return (
    <div className="container-x py-10">
      <div className="card p-6 sm:p-8">
        <div className="flex flex-wrap items-start gap-5">
          <Avatar name={user.name} size="h-20 w-20 text-2xl" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold sm:text-3xl">{user.name}</h1>
              {user.demo && <DemoBadge />}
            </div>
            <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400">
              {user.location && <span>{user.location}</span>}
              <span className="inline-flex items-center gap-1"><Icon name="calendar" className="h-4 w-4" /> Joined {joined}</span>
              {user.settings.showEmail && user.email && <span>{user.email}</span>}
            </p>
          </div>
          {isSelf && <Link to="/settings" className="btn-ghost"><Icon name="edit" className="h-4 w-4" /> Edit profile</Link>}
        </div>
        <p className="mt-5 max-w-2xl whitespace-pre-line text-slate-300">
          {user.bio || (isSelf ? 'Add a short bio in Settings so people know who you are.' : 'This founder has not added a bio yet.')}
        </p>
        <div className="mt-5">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">Skills</h2>
          {user.skills.length ? (
            <div className="flex flex-wrap gap-2">{user.skills.map((s) => <span key={s} className="chip">{s}</span>)}</div>
          ) : (
            <p className="text-sm text-slate-500">No skills listed.</p>
          )}
        </div>
      </div>

      <h2 className="mb-5 mt-10 text-xl font-bold">Published projects</h2>
      {projects.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((s) => <StartupCard key={s.id} startup={s} />)}
        </div>
      ) : (
        <div className="card p-8 text-center text-sm text-slate-400">
          No projects published yet.
          {isSelf && <div className="mt-4"><Link to="/launch" className="btn-primary">Launch your startup</Link></div>}
        </div>
      )}
    </div>
  )
}
