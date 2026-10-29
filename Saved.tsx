import { Link } from 'react-router-dom'
import { useStore } from '../lib/store'
import { StartupCard } from '../components/StartupCard'
import { EmptyState, PageTitle } from '../components/ui'

export default function Saved() {
  const { startups, savedIds, currentUser } = useStore()
  const list = startups.filter((s) => savedIds.includes(s.id))

  return (
    <div className="container-x py-10">
      <PageTitle title="Saved startups" subtitle="Your bookmarks, kept in this browser." />
      {!currentUser && (
        <p className="mb-6 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-400">
          You are not logged in. Bookmarks are stored as a guest on this device.{' '}
          <Link to="/signup?next=/saved" className="font-semibold text-electric-400 hover:text-white">Create an account</Link> to keep them with your profile.
        </p>
      )}
      {list.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((s) => <StartupCard key={s.id} startup={s} />)}
        </div>
      ) : (
        <EmptyState
          title="Nothing saved yet"
          body="Use the bookmark icon on any startup card to save it here."
          action={<Link to="/explore" className="btn-primary">Explore startups</Link>}
        />
      )}
    </div>
  )
}
