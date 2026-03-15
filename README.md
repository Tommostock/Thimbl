# Thimbl — Level Up Your Craft

A gamified textile crafting companion for sewing, knitting, crochet, and embroidery. Track projects, earn achievements, and level up your skills.

## Features

- **Project Catalogue** — Browse 30+ craft projects with step-by-step instructions
- **Progress Tracking** — Check off steps, log hours, and see your progress
- **Shopping List** — Auto-populated materials list with checkable items
- **Photo Gallery** — Upload before/during/after photos of your projects
- **XP & Achievements** — Earn experience points and unlock badges as you craft
- **Dashboard** — View your stats, streaks, and recent activity
- **PWA** — Install as a native-feeling app on iPhone, Android, and desktop
- **Dark Mode** — Warm charcoal dark theme for evening crafting sessions

## Tech Stack

- **Framework:** Next.js 15 (App Router, TypeScript, Turbopack)
- **Styling:** Tailwind CSS 4
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Fonts:** Playfair Display + Source Sans 3
- **Hosting:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A Supabase project (free tier works)

### 1. Clone the repository

```bash
git clone https://github.com/Tommostock/Thimbl.git
cd Thimbl
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example file and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase project URL and anon key.
You can find these in your [Supabase Dashboard](https://supabase.com/dashboard) under **Settings > API**.

### 4. Set up the database

1. Open the **SQL Editor** in your Supabase dashboard
2. Run the schema file: `supabase/migrations/001_schema.sql`
3. Run the seed file: `supabase/seed.sql`

### 5. Set up Storage (for photo uploads)

1. Go to **Storage** in your Supabase dashboard
2. Create a new bucket called `project-photos`
3. Set it to **public** (so photos can be viewed without auth)
4. Add a storage policy to allow authenticated users to upload

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Deploying to Vercel

1. Push your code to GitHub
2. Import the repository on [Vercel](https://vercel.com)
3. Add the environment variables (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
4. Deploy!

The app will be available at `https://your-project.vercel.app`.

## Project Structure

```
app/                    # Next.js App Router pages
  (auth)/               # Auth pages (login, signup, onboarding)
  (app)/                # Authenticated app pages
    dashboard/          # Home screen with stats
    explore/            # Project catalogue
    my-projects/        # User's projects with progress
    shopping-list/      # Materials shopping list
    achievements/       # Achievement badges grid
    profile/            # User profile & settings
components/             # React components
  layout/               # BottomNav, ServiceWorker
  catalogue/            # ProjectCard, CategoryFilter, DifficultyBadge
  projects/             # StepChecklist, ProgressBar, etc.
  achievements/         # XPBar, AchievementCard, etc.
contexts/               # ThemeContext, AuthContext
hooks/                  # useProjects, useAuth, etc.
lib/                    # Utilities
  supabase/             # Supabase client, server, middleware, storage
  types/                # TypeScript database types
  constants.ts          # XP values, levels, categories
  xp.ts                 # XP award logic
supabase/               # Database schema and seed data
  migrations/           # SQL schema
  seed.sql              # 30+ projects + achievements
public/                 # Static assets
  icons/                # PWA icons
  sw.js                 # Service worker
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

## Built With

Built by Tom with Claude Code.
