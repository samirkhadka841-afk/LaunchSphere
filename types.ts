export type Stage = 'Idea' | 'Prototype' | 'Launched'

export interface UserSettings {
  notifications: boolean
  productEmails: boolean
  profilePublic: boolean
  showEmail: boolean
}

export interface User {
  id: string
  name: string
  email: string
  bio: string
  skills: string[]
  location: string
  joined: string
  demo?: boolean
  salt?: string
  passHash?: string
  settings: UserSettings
}

export interface StartupUpdate {
  id: string
  text: string
  createdAt: string
}

export interface Feedback {
  id: string
  authorId: string
  authorName: string
  rating: number
  text: string
  createdAt: string
}

export interface Startup {
  id: string
  slug: string
  name: string
  tagline: string
  description: string
  category: string
  website: string
  logo: string
  screenshots: string[]
  color: string
  problem: string
  audience: string
  different: string
  stage: Stage
  founderId: string
  createdAt: string
  views: number
  saves: number
  demo: boolean
  updates: StartupUpdate[]
  feedback: Feedback[]
}

export interface LaunchForm {
  name: string
  tagline: string
  description: string
  category: string
  website: string
  logo: string
  screenshots: string[]
  color: string
  problem: string
  audience: string
  different: string
  stage: Stage | ''
}

export interface Comment {
  id: string
  authorId: string
  authorName: string
  text: string
  createdAt: string
}

export interface Post {
  id: string
  title: string
  body: string
  tag: string
  authorId: string
  authorName: string
  createdAt: string
  comments: Comment[]
  demo: boolean
}

export type OpportunityType = 'Co-founder' | 'Hackathon' | 'Collaboration' | 'Challenge'

export interface Opportunity {
  id: string
  type: OpportunityType
  title: string
  detail: string
  authorId: string
  authorName: string
  createdAt: string
  interested: string[]
  demo: boolean
}

export interface Story {
  founderId: string
  startupSlug: string
  quote: string
}

export interface State {
  version: 1
  users: User[]
  currentUserId: string | null
  startups: Startup[]
  /** bookmarks, keyed by user id (or "guest") */
  saved: Record<string, string[]>
  draft: LaunchForm | null
  posts: Post[]
  opportunities: Opportunity[]
}
