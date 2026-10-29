import type { LaunchForm, Stage, Startup } from './types'

export const CATEGORIES = [
  'Developer Tools',
  'Fintech',
  'Health & Fitness',
  'Education',
  'Design',
  'Social & Community',
  'Entertainment',
  'Sustainability',
  'Productivity',
] as const

export const STAGES: { value: Stage; label: string; hint: string }[] = [
  { value: 'Idea', label: 'Idea', hint: 'Still shaping the concept' },
  { value: 'Prototype', label: 'Prototype', hint: 'Something people can try or see' },
  { value: 'Launched', label: 'Launched', hint: 'Available to real users' },
]

export const BRAND_COLORS = ['#3b74ff', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#ec4899', '#64748b']

export const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']
export const MAX_LOGO_BYTES = 512 * 1024
export const MAX_SHOT_BYTES = 1024 * 1024
export const MAX_SHOTS = 4

export const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36)

export function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'startup'
  )
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d ago`
  const mo = Math.floor(d / 30)
  if (mo < 12) return `${mo}mo ago`
  return `${Math.floor(mo / 12)}y ago`
}

export function formatCount(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n)
}

export function isHttpUrl(v: string) {
  try {
    const u = new URL(v)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
export const isHexColor = (v: string) => /^#[0-9a-fA-F]{6}$/.test(v)

export function popularity(s: Startup) {
  return s.views + s.saves * 5
}

export function emptyForm(): LaunchForm {
  return {
    name: '',
    tagline: '',
    description: '',
    category: '',
    website: '',
    logo: '',
    screenshots: [],
    color: BRAND_COLORS[0],
    problem: '',
    audience: '',
    different: '',
    stage: '',
  }
}

export function formFromStartup(s: Startup): LaunchForm {
  return {
    name: s.name,
    tagline: s.tagline,
    description: s.description,
    category: s.category,
    website: s.website,
    logo: s.logo,
    screenshots: s.screenshots,
    color: s.color,
    problem: s.problem,
    audience: s.audience,
    different: s.different,
    stage: s.stage,
  }
}

export type FormErrors = Partial<Record<keyof LaunchForm, string>>

/** Step index: 0 basics, 1 branding, 2 product. Used by the UI and again before publishing. */
export function validateStep(step: number, f: LaunchForm): FormErrors {
  const e: FormErrors = {}
  if (step === 0) {
    const name = f.name.trim()
    if (name.length < 2) e.name = 'Enter a startup name (at least 2 characters).'
    else if (name.length > 60) e.name = 'Keep the name under 60 characters.'
    const tag = f.tagline.trim()
    if (tag.length < 5) e.tagline = 'Add a short tagline (at least 5 characters).'
    else if (tag.length > 100) e.tagline = 'Keep the tagline under 100 characters.'
    const d = f.description.trim()
    if (d.length < 30) e.description = `Describe your startup in at least 30 characters (${d.length} so far).`
    else if (d.length > 2000) e.description = 'Keep the description under 2000 characters.'
    if (!f.category) e.category = 'Choose a category.'
    if (f.website.trim() && !isHttpUrl(f.website.trim())) e.website = 'Enter a full URL starting with http:// or https://'
  }
  if (step === 1) {
    if (!isHexColor(f.color)) e.color = 'Choose a valid brand color.'
  }
  if (step === 2) {
    if (f.problem.trim().length < 10) e.problem = 'Describe the problem in at least 10 characters.'
    if (f.audience.trim().length < 10) e.audience = 'Describe your target audience in at least 10 characters.'
    if (f.different.trim().length < 10) e.different = 'Explain what makes it different (at least 10 characters).'
    if (!f.stage) e.stage = 'Select the current stage of the product.'
  }
  return e
}

export function validateAll(f: LaunchForm): { step: number; errors: FormErrors } | null {
  for (let i = 0; i < 3; i++) {
    const errors = validateStep(i, f)
    if (Object.keys(errors).length) return { step: i, errors }
  }
  return null
}

/** Reads an image after checking its type and size. Rejects with a user-friendly Error. */
export function readImage(file: File, maxBytes: number): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!IMAGE_TYPES.includes(file.type)) {
      reject(new Error(`${file.name}: only PNG, JPG or WebP images are allowed.`))
      return
    }
    if (file.size > maxBytes) {
      reject(new Error(`${file.name}: file is too large (max ${Math.round(maxBytes / 1024)} KB).`))
      return
    }
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = () => reject(new Error(`${file.name}: could not be read.`))
    r.readAsDataURL(file)
  })
}

export function previewStartup(f: LaunchForm, founderId: string): Startup {
  return {
    id: 'preview',
    slug: 'preview',
    name: f.name.trim() || 'Your startup name',
    tagline: f.tagline.trim() || 'Your tagline appears here',
    description: f.description.trim() || 'Your description appears here.',
    category: f.category || 'Category',
    website: f.website.trim(),
    logo: f.logo,
    screenshots: f.screenshots,
    color: f.color,
    problem: f.problem.trim(),
    audience: f.audience.trim(),
    different: f.different.trim(),
    stage: (f.stage || 'Idea') as Stage,
    founderId,
    createdAt: new Date().toISOString(),
    views: 0,
    saves: 0,
    demo: false,
    updates: [],
    feedback: [],
  }
}

export function avgRating(s: Startup) {
  if (!s.feedback.length) return 0
  return s.feedback.reduce((a, b) => a + b.rating, 0) / s.feedback.length
}
