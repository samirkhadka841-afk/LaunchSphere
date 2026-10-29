import type { ReactNode } from 'react'

const paths = {
  home: <path d="M3 11l9-8 9 8M5 10v10h14V10" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </>
  ),
  rocket: (
    <>
      <path d="M14 4c3-1.5 6-1.5 6-1.5s0 3-1.5 6l-6 6-4.5-4.5 6-6z" />
      <path d="M9 9l-4 1 3 3M15 15l-1 4-3-3M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M16 4.5a3.5 3.5 0 010 7M18 14c2.2.6 3.5 2.6 3.5 6" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
    </>
  ),
  book: <path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2V5zM4 19a2 2 0 012-2h13" />,
  bookmark: <path d="M6 3h12v18l-6-4-6 4V3z" />,
  eye: (
    <>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  star: <path d="M12 3l2.8 6 6.2.7-4.7 4.3 1.5 6.5-5.8-3.3-5.8 3.3 1.5-6.5L3 9.7 9.2 9z" />,
  heart: <path d="M20.8 5.6a5 5 0 00-7.1 0L12 7.3l-1.7-1.7a5 5 0 00-7.1 7.1L12 21l8.8-8.3a5 5 0 000-7.1z" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  check: <path d="M5 13l4 4L19 7" />,
  plus: <path d="M12 5v14M5 12h14" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  trending: <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />,
  code: <path d="M8 8l-5 4 5 4M16 8l5 4-5 4M14 5l-4 14" />,
  wallet: <path d="M3 7a2 2 0 012-2h13v4M3 7v11a2 2 0 002 2h15V9H5a2 2 0 01-2-2zM16 14h2" />,
  cap: <path d="M2 9l10-5 10 5-10 5L2 9zM6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5" />,
  palette: <path d="M12 3a9 9 0 100 18c1.5 0 2-1 1.5-2s0-2 1.5-2h2a3 3 0 003-3c0-5-4-11-8-11zM8 11h.01M12 7.5h.01M16 11h.01" />,
  chat: <path d="M4 5h16v11H9l-5 4V5z" />,
  leaf: <path d="M5 19c0-9 5-15 15-15 0 10-6 15-15 15zM5 19l8-8" />,
  bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />,
  sliders: (
    <>
      <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="8" cy="17" r="2" />
    </>
  ),
  logout: <path d="M9 4H5v16h4M16 8l4 4-4 4M20 12H9" />,
  upload: <path d="M12 16V4M7 9l5-5 5 5M4 20h16" />,
  trash: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />,
  edit: <path d="M4 20h4L19 9l-4-4L4 16v4zM13 7l4 4" />,
  link: <path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" />,
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
    </>
  ),
  chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
} satisfies Record<string, ReactNode>

export type IconName = keyof typeof paths

export function Icon({
  name,
  className = 'h-5 w-5',
  filled = false,
}: {
  name: IconName
  className?: string
  filled?: boolean
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

export function categoryIcon(category: string): IconName {
  switch (category) {
    case 'Developer Tools':
      return 'code'
    case 'Fintech':
      return 'wallet'
    case 'Health & Fitness':
      return 'heart'
    case 'Education':
      return 'cap'
    case 'Design':
      return 'palette'
    case 'Social & Community':
      return 'users'
    case 'Entertainment':
      return 'bolt'
    case 'Sustainability':
      return 'leaf'
    default:
      return 'grid'
  }
}
