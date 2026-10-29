import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { LaunchForm, Opportunity, OpportunityType, Post, Startup, State, User, UserSettings } from './types'
import { seedState } from './seed'
import { supabase } from './supabase'
import { isEmail, slugify, uid, validateAll } from './util'

const KEY = 'launchsphere:v1'

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as State
      if (parsed && parsed.version === 1 && Array.isArray(parsed.startups)) return parsed
    }
  } catch {
    /* corrupted storage: fall back to demo data */
  }
  return seedState()
}

async function hashPassword(password: string, salt: string) {
  if (!crypto?.subtle) throw new Error('Secure hashing is unavailable. Open the site on localhost or HTTPS.')
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}:${password}`))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

const defaultSettings: UserSettings = { notifications: true, productEmails: false, profilePublic: true, showEmail: false }

export interface AuthResult {
  ok: boolean
  message?: string
}
export type PublishResult = { ok: true; startup: Startup } | { ok: false; message: string }

interface Store {
  state: State
  users: User[]
  startups: Startup[]
  posts: Post[]
  opportunities: Opportunity[]
  currentUser: User | null
  savedIds: string[]
  draft: LaunchForm | null
  authMode: 'supabase' | 'local'
  userById: (id: string) => User | undefined
  signup: (name: string, email: string, password: string) => Promise<AuthResult>
  login: (email: string, password: string) => Promise<AuthResult>
  logout: () => Promise<void>
  toggleSave: (startupId: string) => void
  isSaved: (startupId: string) => boolean
  saveDraft: (form: LaunchForm) => boolean
  clearDraft: () => void
  publishStartup: (form: LaunchForm, editId?: string) => PublishResult
  deleteStartup: (id: string) => void
  incrementViews: (id: string) => void
  addUpdate: (startupId: string, text: string) => void
  addFeedback: (startupId: string, rating: number, text: string) => void
  addPost: (title: string, body: string, tag: string) => boolean
  addComment: (postId: string, text: string) => void
  addOpportunity: (type: OpportunityType, title: string, detail: string) => boolean
  toggleInterest: (oppId: string) => void
  updateUser: (patch: Partial<Omit<User, 'id' | 'settings'>> & { settings?: Partial<UserSettings> }) => void
  deleteAccount: () => Promise<void>
  resetDemo: () => void
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(load)
  const ref = useRef(state)

  /** Applies a change and persists it. Returns false (and changes nothing) if browser storage is full. */
  const commit = useCallback((fn: (s: State) => State): boolean => {
    const next = fn(ref.current)
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
    } catch {
      return false
    }
    ref.current = next
    setState(next)
    return true
  }, [])

  const currentUser = state.users.find((u) => u.id === state.currentUserId) ?? null
  const savedKey = currentUser?.id ?? 'guest'

  // When Supabase is configured, restore its session and keep a local profile mirror.
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      const su = data.session?.user
      if (su) {
        commit((s) => {
          const exists = s.users.some((u) => u.id === su.id)
          const users = exists
            ? s.users
            : [...s.users, mirrorUser(su.id, su.email ?? '', (su.user_metadata?.name as string) || '')]
          return { ...s, users, currentUserId: su.id }
        })
      } else if (ref.current.currentUserId && !ref.current.users.find((u) => u.id === ref.current.currentUserId)?.demo) {
        commit((s) => ({ ...s, currentUserId: null }))
      }
    })
  }, [commit])

  const mirrorUser = (id: string, email: string, name: string): User => ({
    id,
    name: name || email.split('@')[0] || 'New founder',
    email,
    bio: '',
    skills: [],
    location: '',
    joined: new Date().toISOString(),
    settings: { ...defaultSettings },
  })

  const requireUser = () => ref.current.users.find((u) => u.id === ref.current.currentUserId) ?? null

  const value = useMemo<Store>(() => {
    const signup: Store['signup'] = async (name, emailRaw, password) => {
      const email = emailRaw.trim().toLowerCase()
      if (name.trim().length < 2) return { ok: false, message: 'Enter your name.' }
      if (!isEmail(email)) return { ok: false, message: 'Enter a valid email address.' }
      if (password.length < 8) return { ok: false, message: 'Use a password with at least 8 characters.' }
      if (supabase) {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name: name.trim() } } })
        if (error) return { ok: false, message: error.message }
        if (!data.session || !data.user) {
          return { ok: true, message: 'Account created. Check your email to confirm it, then log in.' }
        }
        const id = data.user.id
        commit((s) => ({
          ...s,
          users: s.users.some((u) => u.id === id) ? s.users : [...s.users, mirrorUser(id, email, name.trim())],
          currentUserId: id,
        }))
        return { ok: true }
      }
      if (ref.current.users.some((u) => u.email === email)) {
        return { ok: false, message: 'An account with this email already exists in this browser.' }
      }
      try {
        const salt = uid()
        const passHash = await hashPassword(password, salt)
        const user: User = { ...mirrorUser(uid(), email, name.trim()), salt, passHash }
        const ok = commit((s) => ({ ...s, users: [...s.users, user], currentUserId: user.id }))
        return ok ? { ok: true } : { ok: false, message: 'Browser storage is full. Free some space and try again.' }
      } catch (e) {
        return { ok: false, message: (e as Error).message }
      }
    }

    const login: Store['login'] = async (emailRaw, password) => {
      const email = emailRaw.trim().toLowerCase()
      if (!isEmail(email) || !password) return { ok: false, message: 'Enter your email and password.' }
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error || !data.user) return { ok: false, message: error?.message ?? 'Could not log in.' }
        const su = data.user
        commit((s) => ({
          ...s,
          users: s.users.some((u) => u.id === su.id)
            ? s.users
            : [...s.users, mirrorUser(su.id, email, (su.user_metadata?.name as string) || '')],
          currentUserId: su.id,
        }))
        return { ok: true }
      }
      const user = ref.current.users.find((u) => u.email === email && u.passHash)
      try {
        if (!user || !user.salt || (await hashPassword(password, user.salt)) !== user.passHash) {
          return { ok: false, message: 'Incorrect email or password.' }
        }
      } catch (e) {
        return { ok: false, message: (e as Error).message }
      }
      commit((s) => ({ ...s, currentUserId: user.id }))
      return { ok: true }
    }

    const logout: Store['logout'] = async () => {
      if (supabase) await supabase.auth.signOut()
      commit((s) => ({ ...s, currentUserId: null }))
    }

    const toggleSave: Store['toggleSave'] = (startupId) => {
      commit((s) => {
        const key = s.currentUserId ?? 'guest'
        const list = s.saved[key] ?? []
        const has = list.includes(startupId)
        return {
          ...s,
          saved: { ...s.saved, [key]: has ? list.filter((i) => i !== startupId) : [...list, startupId] },
          startups: s.startups.map((st) =>
            st.id === startupId ? { ...st, saves: Math.max(0, st.saves + (has ? -1 : 1)) } : st,
          ),
        }
      })
    }

    const publishStartup: Store['publishStartup'] = (form, editId) => {
      const user = requireUser()
      if (!user) return { ok: false, message: 'Log in or create an account to publish.' }
      const invalid = validateAll(form)
      if (invalid) return { ok: false, message: 'Some required fields are missing or invalid. Please review the steps.' }
      const clean = {
        name: form.name.trim(),
        tagline: form.tagline.trim(),
        description: form.description.trim(),
        category: form.category,
        website: form.website.trim(),
        logo: form.logo,
        screenshots: form.screenshots.slice(0, 4),
        color: form.color,
        problem: form.problem.trim(),
        audience: form.audience.trim(),
        different: form.different.trim(),
        stage: form.stage as Startup['stage'],
      }
      let result: Startup | null = null
      const ok = commit((s) => {
        if (editId) {
          const existing = s.startups.find((x) => x.id === editId)
          if (!existing || existing.founderId !== user.id) return s
          result = { ...existing, ...clean }
          return { ...s, startups: s.startups.map((x) => (x.id === editId ? (result as Startup) : x)) }
        }
        let slug = slugify(clean.name)
        const taken = new Set(s.startups.map((x) => x.slug))
        if (taken.has(slug)) {
          let n = 2
          while (taken.has(`${slug}-${n}`)) n++
          slug = `${slug}-${n}`
        }
        result = {
          id: uid(),
          slug,
          ...clean,
          founderId: user.id,
          createdAt: new Date().toISOString(),
          views: 0,
          saves: 0,
          demo: false,
          updates: [],
          feedback: [],
        }
        return { ...s, startups: [result, ...s.startups] }
      })
      if (!ok) return { ok: false, message: 'Browser storage is full. Try smaller or fewer images, then publish again.' }
      if (!result) return { ok: false, message: 'You can only edit your own startups.' }
      return { ok: true, startup: result }
    }

    return {
      state,
      users: state.users,
      startups: state.startups,
      posts: state.posts,
      opportunities: state.opportunities,
      currentUser,
      savedIds: state.saved[savedKey] ?? [],
      draft: state.draft,
      authMode: supabase ? 'supabase' : 'local',
      userById: (id) => state.users.find((u) => u.id === id),
      signup,
      login,
      logout,
      toggleSave,
      isSaved: (id) => (state.saved[savedKey] ?? []).includes(id),
      saveDraft: (form) => commit((s) => ({ ...s, draft: form })),
      clearDraft: () => {
        commit((s) => ({ ...s, draft: null }))
      },
      publishStartup,
      deleteStartup: (id) => {
        const user = requireUser()
        commit((s) => {
          const target = s.startups.find((x) => x.id === id)
          if (!target || !user || target.founderId !== user.id) return s
          const saved = Object.fromEntries(Object.entries(s.saved).map(([k, v]) => [k, v.filter((i) => i !== id)]))
          return { ...s, startups: s.startups.filter((x) => x.id !== id), saved }
        })
      },
      incrementViews: (id) => {
        commit((s) => ({ ...s, startups: s.startups.map((x) => (x.id === id ? { ...x, views: x.views + 1 } : x)) }))
      },
      addUpdate: (startupId, text) => {
        const user = requireUser()
        const t = text.trim()
        if (!user || !t) return
        commit((s) => ({
          ...s,
          startups: s.startups.map((x) =>
            x.id === startupId && x.founderId === user.id
              ? { ...x, updates: [{ id: uid(), text: t.slice(0, 1000), createdAt: new Date().toISOString() }, ...x.updates] }
              : x,
          ),
        }))
      },
      addFeedback: (startupId, rating, text) => {
        const user = requireUser()
        const t = text.trim()
        if (!user || t.length < 3 || rating < 1 || rating > 5) return
        commit((s) => ({
          ...s,
          startups: s.startups.map((x) =>
            x.id === startupId
              ? {
                  ...x,
                  feedback: [
                    { id: uid(), authorId: user.id, authorName: user.name, rating, text: t.slice(0, 1000), createdAt: new Date().toISOString() },
                    ...x.feedback,
                  ],
                }
              : x,
          ),
        }))
      },
      addPost: (title, body, tag) => {
        const user = requireUser()
        if (!user || title.trim().length < 5 || body.trim().length < 10) return false
        return commit((s) => ({
          ...s,
          posts: [
            { id: uid(), title: title.trim().slice(0, 120), body: body.trim().slice(0, 2000), tag, authorId: user.id, authorName: user.name, createdAt: new Date().toISOString(), comments: [], demo: false },
            ...s.posts,
          ],
        }))
      },
      addComment: (postId, text) => {
        const user = requireUser()
        const t = text.trim()
        if (!user || !t) return
        commit((s) => ({
          ...s,
          posts: s.posts.map((p) =>
            p.id === postId
              ? { ...p, comments: [...p.comments, { id: uid(), authorId: user.id, authorName: user.name, text: t.slice(0, 1000), createdAt: new Date().toISOString() }] }
              : p,
          ),
        }))
      },
      addOpportunity: (type, title, detail) => {
        const user = requireUser()
        if (!user || title.trim().length < 5 || detail.trim().length < 10) return false
        return commit((s) => ({
          ...s,
          opportunities: [
            { id: uid(), type, title: title.trim().slice(0, 120), detail: detail.trim().slice(0, 1000), authorId: user.id, authorName: user.name, createdAt: new Date().toISOString(), interested: [], demo: false },
            ...s.opportunities,
          ],
        }))
      },
      toggleInterest: (oppId) => {
        const user = requireUser()
        if (!user) return
        commit((s) => ({
          ...s,
          opportunities: s.opportunities.map((o) =>
            o.id === oppId
              ? { ...o, interested: o.interested.includes(user.id) ? o.interested.filter((i) => i !== user.id) : [...o.interested, user.id] }
              : o,
          ),
        }))
      },
      updateUser: (patch) => {
        const user = requireUser()
        if (!user) return
        commit((s) => ({
          ...s,
          users: s.users.map((u) => {
            if (u.id !== user.id) return u
            const { settings, ...rest } = patch
            return { ...u, ...rest, settings: { ...u.settings, ...settings } }
          }),
        }))
      },
      deleteAccount: async () => {
        const user = requireUser()
        if (!user) return
        if (supabase) await supabase.auth.signOut()
        commit((s) => ({
          ...s,
          users: s.users.filter((u) => u.id !== user.id),
          currentUserId: null,
          startups: s.startups.filter((x) => x.founderId !== user.id),
          posts: s.posts.filter((p) => p.authorId !== user.id),
          opportunities: s.opportunities.filter((o) => o.authorId !== user.id),
        }))
      },
      resetDemo: () => {
        try {
          localStorage.removeItem(KEY)
        } catch {
          /* ignore */
        }
        window.location.href = '/'
      },
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, currentUser, savedKey, commit])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useStore must be used inside <StoreProvider>')
  return v
}
