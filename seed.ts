import type { Opportunity, Post, Startup, State, Story, User } from './types'

const ago = (days: number, hours = 0) => new Date(Date.now() - days * 86400000 - hours * 3600000).toISOString()

const defaultSettings = { notifications: true, productEmails: false, profilePublic: true, showEmail: false }

// Every record below is fictional DEMONSTRATION DATA. None of these people or companies exist.
const founder = (id: string, name: string, location: string, bio: string, skills: string[], days: number): User => ({
  id,
  name,
  email: '',
  bio,
  skills,
  location,
  joined: ago(days),
  demo: true,
  settings: { ...defaultSettings },
})

export const DEMO_USERS: User[] = [
  founder('demo_maya', 'Maya Lindqvist', 'Stockholm, SE', 'Product designer turned founder. Likes calm interfaces and small, useful tools. (Demo profile)', ['Product design', 'UX research', 'Figma', 'React'], 420),
  founder('demo_daniel', 'Daniel Reyes', 'Austin, US', 'Backend engineer who builds developer tooling. Previously on-call far too often. (Demo profile)', ['TypeScript', 'Postgres', 'Go', 'DevOps'], 380),
  founder('demo_aiko', 'Aiko Tanaka', 'Osaka, JP', 'Former teacher exploring better ways to learn languages and skills together. (Demo profile)', ['Education', 'Community', 'Curriculum design', 'Writing'], 300),
  founder('demo_tomas', 'Tomas Novak', 'Prague, CZ', 'Climate data enthusiast building tools that make footprints visible. (Demo profile)', ['Data viz', 'Python', 'Mobile', 'Sustainability'], 260),
  founder('demo_sofia', 'Sofia Marchetti', 'Milan, IT', 'Fintech operator focused on clear money tools for freelancers. (Demo profile)', ['Fintech', 'Operations', 'Growth', 'Compliance'], 210),
]

interface Seed {
  slug: string
  name: string
  tagline: string
  category: string
  color: string
  founderId: string
  stage: Startup['stage']
  views: number
  saves: number
  description: string
  problem: string
  audience: string
  different: string
}

const mk = (days: number, s: Seed, extra: Partial<Startup> = {}): Startup => ({
  id: `demo_${s.slug}`,
  website: '',
  logo: '',
  screenshots: [],
  createdAt: ago(days),
  demo: true,
  updates: [],
  feedback: [],
  ...s,
  ...extra,
})

export const DEMO_STARTUPS: Startup[] = [
  mk(2, {
    slug: 'novalearn', name: 'NovaLearn', tagline: 'A learning platform that adapts to your pace and style.', category: 'Education',
    color: '#3b74ff', founderId: 'demo_aiko', stage: 'Prototype', views: 12400, saves: 1200,
    description: 'NovaLearn turns any subject into short, interactive lessons that adjust to how quickly you move. Learners get progress tracking, spaced review and study groups in one place.',
    problem: 'Most online courses move at one fixed speed, so beginners get lost and experienced learners get bored.',
    audience: 'Adult learners and self-taught professionals who study in short sessions.',
    different: 'Lessons reorder themselves around what you actually struggled with, and every course has a built-in study group.',
  }, {
    updates: [{ id: 'u1', text: 'Study groups are now available for every course in the prototype.', createdAt: ago(1) }],
    feedback: [
      { id: 'f1', authorId: 'demo_maya', authorName: 'Maya Lindqvist', rating: 5, text: 'The pacing idea is great. I would love a calmer review screen.', createdAt: ago(1, 4) },
      { id: 'f2', authorId: 'demo_daniel', authorName: 'Daniel Reyes', rating: 4, text: 'Clear onboarding. Offline mode would help on commutes.', createdAt: ago(1, 9) },
    ],
  }),
  mk(3, {
    slug: 'pixelforge', name: 'PixelForge', tagline: 'Create polished designs, logos and videos in minutes.', category: 'Design',
    color: '#8b5cf6', founderId: 'demo_maya', stage: 'Launched', views: 8700, saves: 892,
    description: 'PixelForge is a browser design studio with templates for logos, social posts and short videos. Teams share brand kits so everything stays consistent.',
    problem: 'Small teams waste hours recreating the same layouts and keeping assets on brand.',
    audience: 'Founders, marketers and freelancers without a dedicated designer.',
    different: 'Brand kits apply automatically to every template, so nothing ships off-brand.',
  }, { feedback: [{ id: 'f3', authorId: 'demo_sofia', authorName: 'Sofia Marchetti', rating: 5, text: 'Brand kits saved me a whole afternoon.', createdAt: ago(2) }] }),
  mk(5, {
    slug: 'ecotrack', name: 'EcoTrack', tagline: 'Track your carbon footprint and build sustainable habits.', category: 'Sustainability',
    color: '#10b981', founderId: 'demo_tomas', stage: 'Launched', views: 6300, saves: 718,
    description: 'EcoTrack estimates the footprint of your commute, food and energy use and suggests one realistic habit change per week.',
    problem: 'People want to reduce their impact but have no idea which choices matter most.',
    audience: 'Households and small teams starting their sustainability journey.',
    different: 'One weekly suggestion ranked by real impact instead of a long list of tips.',
  }),
  mk(7, {
    slug: 'skillswap', name: 'SkillSwap', tagline: 'Learn from others and teach what you know.', category: 'Social & Community',
    color: '#f59e0b', founderId: 'demo_aiko', stage: 'Prototype', views: 4900, saves: 512,
    description: 'SkillSwap matches people who want to trade skills: an hour of guitar for an hour of spreadsheet help. Sessions happen over video with simple scheduling.',
    problem: 'Learning from real people is valuable, but finding someone who needs what you offer is hard.',
    audience: 'Curious people who prefer learning one-to-one over courses.',
    different: 'Two-way matching removes money from the equation and builds community.',
  }),
  mk(9, {
    slug: 'codecrate', name: 'CodeCrate', tagline: 'Reproducible dev environments you can share with a link.', category: 'Developer Tools',
    color: '#06b6d4', founderId: 'demo_daniel', stage: 'Launched', views: 9100, saves: 1010,
    description: 'CodeCrate packages a project, its dependencies and sample data into a single shareable environment so teammates can run it in one click.',
    problem: '"Works on my machine" costs teams days during onboarding and bug reports.',
    audience: 'Engineering teams and open source maintainers.',
    different: 'Environments are described in one small file and boot in seconds.',
  }),
  mk(12, {
    slug: 'ledgerleaf', name: 'LedgerLeaf', tagline: 'Simple invoicing and cash-flow views for freelancers.', category: 'Fintech',
    color: '#ec4899', founderId: 'demo_sofia', stage: 'Prototype', views: 3800, saves: 390,
    description: 'LedgerLeaf lets freelancers send invoices, track payments and see a 90-day cash forecast without learning accounting software.',
    problem: 'Freelancers lose track of who owes them money and when cash will run short.',
    audience: 'Independent consultants, designers and developers.',
    different: 'A single forecast screen that answers "Can I afford this month?"',
  }),
  mk(15, {
    slug: 'pulsefit', name: 'PulseFit', tagline: 'Ten-minute workouts that fit around a busy day.', category: 'Health & Fitness',
    color: '#f43f5e', founderId: 'demo_maya', stage: 'Idea', views: 2100, saves: 240,
    description: 'PulseFit builds short, equipment-free workouts around the gaps in your calendar and adjusts intensity based on how you feel.',
    problem: 'People skip exercise because long workouts feel impossible to schedule.',
    audience: 'Busy professionals and parents.',
    different: 'Workouts are scheduled automatically in the free slots you already have.',
  }),
  mk(18, {
    slug: 'stageloop', name: 'StageLoop', tagline: 'Host small live shows for the fans who matter most.', category: 'Entertainment',
    color: '#8b5cf6', founderId: 'demo_daniel', stage: 'Idea', views: 1700, saves: 180,
    description: 'StageLoop helps musicians and comedians run intimate, ticketed live streams with chat and request features built in.',
    problem: 'Large platforms bury small creators and take a big cut of ticket sales.',
    audience: 'Independent performers with a loyal small audience.',
    different: 'Built for rooms of 20 to 200 people, not millions.',
  }),
  mk(22, {
    slug: 'greengrid', name: 'GreenGrid', tagline: 'Community solar sharing for apartment buildings.', category: 'Sustainability',
    color: '#10b981', founderId: 'demo_tomas', stage: 'Prototype', views: 2900, saves: 330,
    description: 'GreenGrid helps neighbours pool resources for shared rooftop solar and splits savings fairly using transparent usage data.',
    problem: 'Renters rarely get access to solar because they do not own the roof.',
    audience: 'Apartment residents and building managers.',
    different: 'Fair-share accounting that every neighbour can audit.',
  }),
  mk(26, {
    slug: 'focusdeck', name: 'FocusDeck', tagline: 'A weekly planning board that protects deep-work time.', category: 'Productivity',
    color: '#3b74ff', founderId: 'demo_maya', stage: 'Launched', views: 5200, saves: 560,
    description: 'FocusDeck combines tasks, calendar blocks and a weekly review into one calm board so you finish what matters.',
    problem: 'To-do lists grow forever while important work keeps slipping.',
    audience: 'Makers, writers and knowledge workers.',
    different: 'Only five priorities per week are allowed, which forces better decisions.',
  }),
]

export const DEMO_STORIES: Story[] = [
  { founderId: 'demo_maya', startupSlug: 'pixelforge', quote: 'Sharing early work and listening to feedback changed what we built next.' },
  { founderId: 'demo_tomas', startupSlug: 'ecotrack', quote: 'Writing a clear problem statement made every product decision easier.' },
  { founderId: 'demo_aiko', startupSlug: 'skillswap', quote: 'I met the people who shaped the idea by simply asking for help in public.' },
]

export const DEMO_POSTS: Post[] = [
  {
    id: 'p1', title: 'Looking for a mobile developer to join an early team', tag: 'Collaboration',
    body: 'We are building a small education app and need someone comfortable with React Native. Part-time to start, with equity discussions once we agree on scope.',
    authorId: 'demo_aiko', authorName: 'Aiko Tanaka', createdAt: ago(0, 3), demo: true,
    comments: [{ id: 'c1', authorId: 'demo_daniel', authorName: 'Daniel Reyes', text: 'Happy to chat. What does the timeline look like?', createdAt: ago(0, 2) }],
  },
  {
    id: 'p2', title: 'Tips for getting your first 100 users?', tag: 'Growth',
    body: 'We have a working prototype and no audience yet. What worked for you: communities, cold outreach, content? Would love honest experiences.',
    authorId: 'demo_sofia', authorName: 'Sofia Marchetti', createdAt: ago(0, 8), demo: true,
    comments: [
      { id: 'c2', authorId: 'demo_maya', authorName: 'Maya Lindqvist', text: 'Talk to ten people individually before launching anything public. The insight is worth more than the traffic.', createdAt: ago(0, 6) },
      { id: 'c3', authorId: 'demo_tomas', authorName: 'Tomas Novak', text: 'Niche forums for your exact audience beat broad social posts for us.', createdAt: ago(0, 5) },
    ],
  },
  {
    id: 'p3', title: 'How do you price a tool for freelancers?', tag: 'Advice',
    body: 'Freelancers are price sensitive but also value saved time. Flat monthly, usage based, or a free tier with paid extras?',
    authorId: 'demo_daniel', authorName: 'Daniel Reyes', createdAt: ago(1, 2), demo: true, comments: [],
  },
  {
    id: 'p4', title: 'Share your launch checklist', tag: 'Discussion',
    body: 'What do you do the week before launch? I am collecting ideas for a shared checklist the community can reuse.',
    authorId: 'demo_maya', authorName: 'Maya Lindqvist', createdAt: ago(2), demo: true, comments: [],
  },
]

export const DEMO_OPPORTUNITIES: Opportunity[] = [
  { id: 'o1', type: 'Co-founder', title: 'Co-founder match: frontend developer', detail: 'Education startup seeking a frontend co-founder who cares about accessibility.', authorId: 'demo_aiko', authorName: 'Aiko Tanaka', createdAt: ago(0, 2), interested: [], demo: true },
  { id: 'o2', type: 'Hackathon', title: 'Build for a sustainable future', detail: 'A weekend hackathon for tools that make everyday sustainability easier. Teams of up to four.', authorId: 'demo_tomas', authorName: 'Tomas Novak', createdAt: ago(0, 5), interested: [], demo: true },
  { id: 'o3', type: 'Challenge', title: 'Startup challenge: money tools for freelancers', detail: 'Pitch a small product that helps freelancers understand cash flow. Feedback from founders included.', authorId: 'demo_sofia', authorName: 'Sofia Marchetti', createdAt: ago(0, 8), interested: [], demo: true },
  { id: 'o4', type: 'Collaboration', title: 'Designers needed for a new open project', detail: 'We need two designers to refresh a developer tool\'s onboarding flow. Volunteer, portfolio credit.', authorId: 'demo_daniel', authorName: 'Daniel Reyes', createdAt: ago(0, 12), interested: [], demo: true },
  { id: 'o5', type: 'Co-founder', title: 'Looking for a growth-minded co-founder', detail: 'Fitness idea stage. Need someone who loves community building and partnerships.', authorId: 'demo_maya', authorName: 'Maya Lindqvist', createdAt: ago(1), interested: [], demo: true },
]

export function seedState(): State {
  return {
    version: 1,
    users: DEMO_USERS.map((u) => ({ ...u })),
    currentUserId: null,
    startups: DEMO_STARTUPS.map((s) => ({ ...s })),
    saved: {},
    draft: null,
    posts: DEMO_POSTS.map((p) => ({ ...p })),
    opportunities: DEMO_OPPORTUNITIES.map((o) => ({ ...o })),
  }
}
