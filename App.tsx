import { Route, Routes } from 'react-router-dom'
import { Layout, RequireAuth } from './components/Layout'
import Home from './pages/Home'
import Launch from './pages/Launch'
import Explore from './pages/Explore'
import StartupProfile from './pages/StartupProfile'
import Community from './pages/Community'
import Founder from './pages/Founder'
import Saved from './pages/Saved'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import Tools from './pages/Tools'
import Resources from './pages/Resources'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="explore" element={<Explore />} />
        <Route path="launch" element={<Launch />} />
        <Route path="launch/:id/edit" element={<RequireAuth><Launch /></RequireAuth>} />
        <Route path="startup/:slug" element={<StartupProfile />} />
        <Route path="community" element={<Community />} />
        <Route path="founder/:id" element={<Founder />} />
        <Route path="saved" element={<Saved />} />
        <Route path="login" element={<Auth mode="login" />} />
        <Route path="signup" element={<Auth mode="signup" />} />
        <Route path="dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="settings" element={<RequireAuth><Settings /></RequireAuth>} />
        <Route path="tools" element={<Tools />} />
        <Route path="resources" element={<Resources />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
