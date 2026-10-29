# LaunchSphere

A startup discovery platform: explore startups, launch your own with a four-step wizard, find collaborators, and manage everything from a dashboard.

**Stack:** React 18 + TypeScript, Vite, Tailwind CSS 3, React Router 6. Optional Supabase for real accounts. Firebase Hosting for deployment.

## What works today (prototype mode, no paid services)

Everything runs in the browser and is stored in `localStorage`. No server, no API keys.

| Area | Status |
| --- | --- |
| Homepage, header, responsive navigation | Working |
| Launch wizard (4 steps, validation, back/continue, save draft, preview, publish, success page) | Working |
| Image uploads (logo + up to 4 screenshots; PNG/JPG/WebP only; 512 KB / 1 MB limits) | Working, stored in the browser |
| Explore: search, category and stage filters, sort by popularity/saves/newest | Working |
| Startup profile: details, screenshots, founder, links, updates, feedback and ratings | Working |
| Community: discussions with comments, collaboration opportunities | Working |
| Founder profile, Saved startups, Dashboard, Settings, Tools, Resources | Working |
| Login / Sign up | Working locally (salted SHA-256 hash in the browser). **Not real security**, and accounts exist only on that browser |
| Supabase auth | Works once you add the two env variables (below) |

Not done yet (needs a backend): startups, posts, feedback and uploaded images stored in Supabase, so data is shared between visitors and devices. The schema and policies are provided below as the starting point. The site does not pretend otherwise: a banner states the current mode.

All sample startups, people, posts and opportunities are fictional and labelled **Demo**. No user counts are shown.

## Project structure

```
launchsphere/
├─ index.html
├─ package.json
├─ vite.config.ts
├─ tsconfig.json
├─ tailwind.config.js
├─ postcss.config.js
├─ firebase.json              (Hosting config with SPA rewrites + security headers)
├─ .firebaserc.example        (copy to .firebaserc, set your project id)
├─ .env.example               (copy to .env.local for Supabase)
├─ public/favicon.svg
└─ src/
   ├─ main.tsx, App.tsx, index.css
   ├─ lib/        types.ts, seed.ts (demo data), store.tsx (localStorage state + auth), util.ts (validation), supabase.ts
   ├─ components/ Layout.tsx, StartupCard.tsx, ProfileView.tsx, Icons.tsx, ui.tsx
   └─ pages/      Home, Launch, Explore, StartupProfile, Community, Founder, Saved, Auth, Dashboard, Settings, Tools, Resources, NotFound
```

## Run it on Windows (Google Chrome)

1. Install **Node.js 18 or newer** (LTS) from https://nodejs.org. Check with `node -v`.
2. Open **PowerShell** or Command Prompt in the project folder:

```powershell
cd path\to\launchsphere
npm install
npm run dev
```

3. Vite opens **http://localhost:5173** automatically. If your default browser is not Chrome, open Chrome and go to that address.

Production build and local preview:

```powershell
npm run build      # type-checks, then writes the site to dist\
npm run preview    # serves dist\ at http://localhost:4173
```

## Connect Supabase (real accounts)

1. Create a project at https://supabase.com.
2. In **Project Settings, API**, copy the **Project URL** and the **anon public** key.
3. Copy `.env.example` to `.env.local` and fill in:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. Restart `npm run dev`. The Login/Sign up pages now use Supabase Auth, and the banner changes accordingly.
5. In **Authentication, Providers, Email**, decide whether email confirmation is required. If it is, new users see "check your email" and then log in.

**Never** put the `service_role` key in this project. Anything starting with `VITE_` is shipped to every visitor's browser. The anon key is safe only because Row Level Security (RLS) restricts what it can do.

### Database schema with permissions (run in the Supabase SQL editor)

This is the foundation for moving startups to the cloud. The app does not read these tables yet.

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 60),
  bio text check (char_length(bio) <= 500),
  location text check (char_length(location) <= 60),
  skills text[] default '{}',
  profile_public boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.startups (
  id uuid primary key default gen_random_uuid(),
  founder_id uuid not null references public.profiles(id) on delete cascade,
  slug text unique not null,
  name text not null check (char_length(name) between 2 and 60),
  tagline text not null check (char_length(tagline) between 5 and 100),
  description text not null check (char_length(description) between 30 and 2000),
  category text not null,
  website text check (website is null or website ~* '^https?://'),
  logo_path text,
  screenshot_paths text[] default '{}',
  color text not null check (color ~ '^#[0-9a-fA-F]{6}$'),
  problem text, audience text, different text,
  stage text not null check (stage in ('Idea','Prototype','Launched')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.startups enable row level security;

create policy "public profiles are readable" on public.profiles
  for select using (profile_public or auth.uid() = id);
create policy "users manage own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "startups are public" on public.startups for select using (true);
create policy "founders insert own startups" on public.startups
  for insert with check (auth.uid() = founder_id);
create policy "founders update own startups" on public.startups
  for update using (auth.uid() = founder_id) with check (auth.uid() = founder_id);
create policy "founders delete own startups" on public.startups
  for delete using (auth.uid() = founder_id);

-- Storage for logos and screenshots: restrict type and size at the bucket level.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('startup-media', 'startup-media', true, 1048576, array['image/png','image/jpeg','image/webp']);

create policy "anyone can view startup media" on storage.objects
  for select using (bucket_id = 'startup-media');
create policy "users upload into their own folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'startup-media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "users delete their own media" on storage.objects
  for delete to authenticated
  using (bucket_id = 'startup-media' and (storage.foldername(name))[1] = auth.uid()::text);
```

## Deploy to Firebase Hosting

1. Install the CLI and log in:

```powershell
npm install -g firebase-tools
firebase login
```

2. Create a project at https://console.firebase.google.com (Hosting is available on the free Spark plan).
3. Copy `.firebaserc.example` to `.firebaserc` and replace `your-firebase-project-id` with your project id. (Or run `firebase use --add`.)
4. Build and deploy:

```powershell
npm run build
firebase deploy --only hosting
```

`firebase.json` is already configured: it serves `dist/`, rewrites every route to `index.html` (so refreshing `/explore` works), and adds basic security headers.

5. If you use Supabase, set the same two `VITE_` variables before `npm run build` (Vite bakes them in at build time), and add your Firebase URL under **Supabase, Authentication, URL Configuration**.

## Security notes

- Inputs are validated on every step, and again before publishing. React escapes all text, and no raw HTML is rendered.
- Uploads are restricted to PNG/JPG/WebP (SVG is intentionally excluded) with size and count limits.
- External links use `rel="noopener noreferrer nofollow"` and only `http(s)` URLs are accepted. Login redirects only follow internal paths.
- Local accounts are for testing. For real users, connect Supabase and apply the RLS policies above.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `'npm' is not recognized` | Install Node.js, then reopen the terminal. |
| `npm install` fails with permission or network errors | Run the terminal normally (not inside a synced/OneDrive folder), check your connection or proxy, then retry. |
| Port 5173 already in use | Stop the other process, or run `npm run dev -- --port 3000`. |
| Blank page after deploy, or 404 on refresh | Make sure `firebase.json` is deployed unchanged (the rewrite to `/index.html` is required). |
| `Browser storage is full` when publishing | Use smaller or fewer images. Prototype mode stores images in `localStorage` (about 5 MB total). |
| Sign-up says secure hashing is unavailable | Open the site via `http://localhost` or HTTPS, not a LAN IP over http. |
| Supabase sign-in does nothing or errors | Confirm both variables are in `.env.local` (not `.env.example`) and restart the dev server. |
| Want a clean slate | Settings, Reset demo data (or clear site data for localhost in Chrome). |
| Font looks different offline | The Inter font loads from Google Fonts. Without internet the system font is used. |
