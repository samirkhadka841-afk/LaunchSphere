import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container-x py-28 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-electric-400">404</p>
      <h1 className="mt-2 text-4xl font-extrabold">Page not found</h1>
      <p className="mt-3 text-slate-400">The page you are looking for does not exist or has moved.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link to="/" className="btn-primary">Go home</Link>
        <Link to="/explore" className="btn-ghost">Explore startups</Link>
      </div>
    </div>
  )
}
