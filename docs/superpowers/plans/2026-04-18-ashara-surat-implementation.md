# Ashara Surat Info — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack web application for Ashara Mubaraka Surat 1447H — a public information portal with 12 modules, AI-powered helpdesk chat with ticket escalation, and an organiser admin panel.

**Architecture:** Single TanStack Start (SSR) application with Supabase for data/storage/realtime. All pages are public now; a feature flag `ITS_AUTH_ENABLED` gates 4 modules behind ITS OneLogin SSO in a future phase. The AI helpdesk uses an OpenAI-compatible LLM API abstracted via env vars (OpenRouter / Ollama / z.ai).

**Tech Stack:** TanStack Start, React, TypeScript, TailwindCSS, Supabase (Postgres + Realtime + Storage), Vitest, Playwright

**Design:** Warm Ivory (`#fdf6ec`) background, Deep Burgundy (`#7c2d42`) accents, serif headings. Reference spec: `docs/superpowers/specs/2026-04-17-ashara-surat-design.md`

---

## File Map

```
app/
  client.tsx
  router.tsx
  ssr.tsx
  routes/
    __root.tsx                    # Root layout: nav, footer, chat widget
    index.tsx                     # Home: countdown, module cards, pinned announcements
    schedule.tsx
    venue.tsx
    accommodation.tsx
    transport.tsx
    food.tsx
    volunteer.tsx
    announcements.tsx
    gallery.tsx
    documents.tsx
    about-surat.tsx
    helpdesk.tsx
    auth/
      callback.tsx                # ITS OneLogin callback placeholder
    admin/
      __layout.tsx                # Admin auth guard
      login.tsx
      index.tsx
      announcements.tsx
      schedule.tsx
      tickets.tsx
  components/
    layout/
      Nav.tsx
      Footer.tsx
    ui/
      CountdownTimer.tsx
      ModuleCard.tsx
    helpdesk/
      ChatWidget.tsx
      ChatMessage.tsx
      ContactForm.tsx
      EscalationModal.tsx
  lib/
    supabase.ts
    llm.ts
    rateLimit.ts
  server/
    chat.ts
    admin.ts
  styles/
    globals.css
app.config.ts
tailwind.config.ts
supabase/
  migrations/
    001_content_tables.sql
    002_helpdesk_tables.sql
    003_operational_tables.sql
    004_admin_profiles.sql
tests/
  unit/
    countdown.test.ts
    rateLimit.test.ts
    llm.test.ts
    announcements.test.ts
  e2e/
    helpdesk.spec.ts
```

---

## Phase 1: Foundation

### Task 1: Scaffold TanStack Start project

**Files:**
- Create: `app.config.ts`, `package.json`, `tsconfig.json`, `app/router.tsx`, `app/client.tsx`, `app/ssr.tsx`

- [ ] **Step 1: Initialise project**

```bash
cd /Users/hatimnomani/code/asharasuratinfo
pnpm create tanstack-app@latest . --template react-start-basic
```

Expected: Project scaffolded with `app/`, `app.config.ts`, `package.json`.

- [ ] **Step 2: Install additional dependencies**

```bash
pnpm add @supabase/supabase-js @supabase/ssr tailwindcss @tailwindcss/vite
pnpm add -D vitest @vitest/ui @playwright/test
```

- [ ] **Step 3: Verify dev server starts**

```bash
pnpm dev
```

Expected: Server running at `http://localhost:3000`, default TanStack Start page visible.

- [ ] **Step 4: Initialise git and add .gitignore**

```bash
git init
printf '.env\n.env.local\n.superpowers/\nnode_modules/\n.DS_Store\ndist/' > .gitignore
git add .
git commit -m "chore: scaffold TanStack Start project"
```

---

### Task 2: Design system — Tailwind + Ivory/Burgundy theme

**Files:**
- Create: `tailwind.config.ts`
- Create: `app/styles/globals.css`
- Modify: `app.config.ts`
- Create: `tests/unit/theme.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/unit/theme.test.ts
import { describe, it, expect } from 'vitest'
import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '../../tailwind.config'

describe('design tokens', () => {
  it('has ivory background token', () => {
    const config = resolveConfig(tailwindConfig)
    expect((config.theme.colors as Record<string, unknown>).ivory).toBe('#fdf6ec')
  })
  it('has burgundy-700 primary token', () => {
    const config = resolveConfig(tailwindConfig)
    expect((config.theme.colors as Record<string, Record<string, string>>).burgundy['700']).toBe('#7c2d42')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm vitest run tests/unit/theme.test.ts
```

Expected: FAIL — `tailwind.config` not found.

- [ ] **Step 3: Create Tailwind config with design tokens**

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#fdf6ec',
        burgundy: {
          50:  '#fdf2f4',
          100: '#fce7e7',
          200: '#f9d0d6',
          300: '#f4a8b3',
          400: '#ec7589',
          500: '#de4963',
          600: '#c93055',
          700: '#7c2d42',
          800: '#6b1f35',
          900: '#5a1529',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
```

- [ ] **Step 4: Create globals.css**

```css
/* app/styles/globals.css */
@import "tailwindcss";

body {
  background-color: #fdf6ec;
  font-family: Inter, system-ui, sans-serif;
}

h1, h2, h3 {
  font-family: Georgia, serif;
  color: #7c2d42;
}
```

- [ ] **Step 5: Wire Tailwind into app.config.ts**

```typescript
// app.config.ts
import { defineConfig } from '@tanstack/start/config'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
})
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
pnpm vitest run tests/unit/theme.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add tailwind.config.ts app/styles/globals.css app.config.ts tests/unit/theme.test.ts
git commit -m "feat: add Ivory/Burgundy design system tokens"
```

---

### Task 3: Supabase setup + database migrations

**Files:**
- Create: `app/lib/supabase.ts`
- Create: `supabase/migrations/001_content_tables.sql`
- Create: `supabase/migrations/002_helpdesk_tables.sql`
- Create: `supabase/migrations/003_operational_tables.sql`
- Create: `.env.example`

- [ ] **Step 1: Create Supabase project**

Go to supabase.com → New project → name: `ashara-surat`. Note the Project URL and anon key.

- [ ] **Step 2: Create .env.local**

```bash
cat > .env.local << 'EOF'
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
LLM_BASE_URL=https://openrouter.ai/api/v1
LLM_API_KEY=your-llm-key
LLM_MODEL=anthropic/claude-3-haiku
CHAT_RATE_LIMIT=5
ITS_AUTH_ENABLED=false
EOF
```

- [ ] **Step 3: Create Supabase client**

```typescript
// app/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)
```

- [ ] **Step 4: Write content tables migration**

```sql
-- supabase/migrations/001_content_tables.sql
create table announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  category text,
  pinned boolean default false,
  published_at timestamptz default now(),
  created_at timestamptz default now()
);

create table schedule_events (
  id uuid primary key default gen_random_uuid(),
  day int not null,
  event_time time not null,
  title text not null,
  description text,
  location text,
  created_at timestamptz default now()
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  file_url text not null,
  uploaded_at timestamptz default now()
);

create table gallery_images (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  caption text,
  event_tag text,
  uploaded_at timestamptz default now()
);

alter publication supabase_realtime add table announcements;
```

- [ ] **Step 5: Write helpdesk tables migration**

```sql
-- supabase/migrations/002_helpdesk_tables.sql
create table chat_sessions (
  id uuid primary key default gen_random_uuid(),
  contact_name text not null,
  contact_phone text,
  contact_email text,
  contact_whatsapp text,
  status text not null default 'active',
  message_count int not null default 0,
  window_started_at timestamptz default now(),
  created_at timestamptz default now()
);

create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references chat_sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

create table support_tickets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references chat_sessions(id),
  summary text,
  escalation_channel text check (escalation_channel in ('email', 'whatsapp')),
  escalated_at timestamptz default now(),
  resolved_at timestamptz,
  created_at timestamptz default now()
);
```

- [ ] **Step 6: Write operational tables migration**

```sql
-- supabase/migrations/003_operational_tables.sql
create table accommodation (
  id uuid primary key default gen_random_uuid(),
  building text not null,
  zone text,
  floor text,
  capacity int,
  contact_person text,
  created_at timestamptz default now()
);

create table transport_routes (
  id uuid primary key default gen_random_uuid(),
  route_name text not null,
  stops text[],
  timings text,
  notes text,
  created_at timestamptz default now()
);

create table food_zones (
  id uuid primary key default gen_random_uuid(),
  zone_name text not null,
  location text,
  serving_times text,
  capacity int,
  created_at timestamptz default now()
);

create table volunteer_signups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  its_id text,
  phone text not null,
  email text,
  role text,
  zone text,
  status text default 'pending',
  created_at timestamptz default now()
);
```

- [ ] **Step 7: Run migrations**

```bash
npx supabase db push
```

Expected: All 3 migrations applied successfully.

- [ ] **Step 7b: Create Supabase Storage buckets**

In the Supabase dashboard → Storage → New bucket:
- Name: `gallery`, Public: true
- Name: `documents`, Public: true

These buckets store uploaded images and PDF files. URLs returned by uploads go into `gallery_images.url` and `documents.file_url`.

- [ ] **Step 8: Create .env.example and commit**

```bash
cat > .env.example << 'EOF'
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
LLM_BASE_URL=https://openrouter.ai/api/v1
LLM_API_KEY=
LLM_MODEL=anthropic/claude-3-haiku
CHAT_RATE_LIMIT=5
ITS_AUTH_ENABLED=false
EOF

git add app/lib/supabase.ts supabase/ .env.example
git commit -m "feat: add Supabase client and database migrations"
```

---

### Task 4: Root layout — Nav + Footer

**Files:**
- Create: `app/components/layout/Nav.tsx`
- Create: `app/components/layout/Footer.tsx`
- Modify: `app/routes/__root.tsx`

- [ ] **Step 1: Create Nav component**

```tsx
// app/components/layout/Nav.tsx
import { Link } from '@tanstack/react-router'

const links = [
  { to: '/schedule', label: 'Schedule' },
  { to: '/venue', label: 'Venue' },
  { to: '/accommodation', label: 'Stay' },
  { to: '/transport', label: 'Travel' },
  { to: '/food', label: 'Food' },
  { to: '/announcements', label: 'News' },
  { to: '/helpdesk', label: 'Help' },
]

export function Nav() {
  return (
    <nav className="bg-burgundy-700 text-ivory px-6 py-3 flex items-center justify-between flex-wrap gap-3">
      <Link to="/" className="font-serif font-bold text-lg text-ivory hover:text-burgundy-100">
        🕌 Ashara Surat 1447H
      </Link>
      <div className="flex flex-wrap gap-4 text-sm">
        {links.map(l => (
          <Link key={l.to} to={l.to} className="text-burgundy-100 hover:text-ivory transition-colors">
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Create Footer component**

```tsx
// app/components/layout/Footer.tsx
export function Footer() {
  return (
    <footer className="bg-burgundy-800 text-burgundy-200 text-center text-sm py-6 mt-auto">
      <p>Ashara Mubaraka Surat 1447H</p>
      <p className="text-burgundy-400 text-xs mt-1">
        Under the leadership of His Holiness Dr Syedna Mufaddal Saifuddin TUS
      </p>
    </footer>
  )
}
```

- [ ] **Step 3: Update root layout**

```tsx
// app/routes/__root.tsx
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Nav } from '../components/layout/Nav'
import { Footer } from '../components/layout/Footer'
import '../styles/globals.css'

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen flex flex-col bg-ivory">
      <Nav />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  ),
})
```

- [ ] **Step 4: Verify in browser**

```bash
pnpm dev
```

Open http://localhost:3000 — burgundy nav bar and ivory footer visible.

- [ ] **Step 5: Commit**

```bash
git add app/components/layout/ app/routes/__root.tsx
git commit -m "feat: add root layout with Nav and Footer"
```

---

### Task 5: Home page — countdown timer + module cards

**Files:**
- Create: `app/components/ui/CountdownTimer.tsx`
- Create: `app/components/ui/ModuleCard.tsx`
- Modify: `app/routes/index.tsx`
- Create: `tests/unit/countdown.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// tests/unit/countdown.test.ts
import { describe, it, expect, vi } from 'vitest'
import { getDaysUntil } from '../../app/components/ui/CountdownTimer'

describe('getDaysUntil', () => {
  it('returns 0 on the event date', () => {
    vi.setSystemTime(new Date('2026-09-01'))
    expect(getDaysUntil(new Date('2026-09-01'))).toBe(0)
    vi.useRealTimers()
  })
  it('returns correct days before event', () => {
    vi.setSystemTime(new Date('2026-08-01'))
    expect(getDaysUntil(new Date('2026-09-01'))).toBe(31)
    vi.useRealTimers()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm vitest run tests/unit/countdown.test.ts
```

Expected: FAIL — `getDaysUntil` not exported.

- [ ] **Step 3: Create CountdownTimer component**

```tsx
// app/components/ui/CountdownTimer.tsx
import { useState, useEffect } from 'react'

// Update to the actual first day of Ashara 1447H once confirmed
const ASHARA_DATE = new Date('2026-09-01T00:00:00')

export function getDaysUntil(target: Date): number {
  const diff = target.getTime() - Date.now()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}

function pad(n: number) { return String(n).padStart(2, '0') }

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 })

  useEffect(() => {
    function update() {
      const diff = ASHARA_DATE.getTime() - Date.now()
      if (diff <= 0) return
      setTimeLeft({
        days:  Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins:  Math.floor((diff % 3600000)  / 60000),
        secs:  Math.floor((diff % 60000)    / 1000),
      })
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex gap-6 justify-center">
      {([['Days', timeLeft.days], ['Hours', timeLeft.hours], ['Mins', timeLeft.mins], ['Secs', timeLeft.secs]] as [string, number][]).map(([lbl, val]) => (
        <div key={lbl} className="text-center">
          <div className="text-4xl font-bold font-serif text-burgundy-700">{pad(val)}</div>
          <div className="text-xs text-burgundy-400 uppercase tracking-widest mt-1">{lbl}</div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Create ModuleCard component**

```tsx
// app/components/ui/ModuleCard.tsx
import { Link } from '@tanstack/react-router'

interface ModuleCardProps {
  icon: string
  title: string
  description: string
  to: string
}

export function ModuleCard({ icon, title, description, to }: ModuleCardProps) {
  return (
    <Link to={to} className="block bg-white border border-burgundy-100 rounded-xl p-5 hover:border-burgundy-300 hover:shadow-md transition-all group">
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="font-serif font-bold text-burgundy-700 group-hover:text-burgundy-800">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </Link>
  )
}
```

- [ ] **Step 5: Build home page route**

```tsx
// app/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { CountdownTimer } from '../components/ui/CountdownTimer'
import { ModuleCard } from '../components/ui/ModuleCard'
import { supabase } from '../lib/supabase'

const MODULES = [
  { icon: '📅', title: 'Schedule',       description: 'Waaz timings & daily Majlis',      to: '/schedule' },
  { icon: '🕌', title: 'Venue & Maps',   description: 'Locations & zone layouts',          to: '/venue' },
  { icon: '🏠', title: 'Accommodation',  description: 'Buildings & zone info',             to: '/accommodation' },
  { icon: '🚌', title: 'Transport',      description: 'Bus routes & shuttles',             to: '/transport' },
  { icon: '🍽️', title: 'Food & Thaal',  description: 'FMB zones & timings',              to: '/food' },
  { icon: '🙋', title: 'Volunteer',      description: 'Sign up to serve',                  to: '/volunteer' },
  { icon: '📢', title: 'Announcements',  description: 'Latest news & notices',             to: '/announcements' },
  { icon: '📸', title: 'Gallery',        description: 'Photos & memories',                 to: '/gallery' },
  { icon: '📄', title: 'Documents',      description: 'Guides & downloadable forms',       to: '/documents' },
  { icon: 'ℹ️', title: 'About Surat',   description: 'City guide for visitors',            to: '/about-surat' },
  { icon: '💬', title: 'Helpdesk',       description: 'AI chat support',                   to: '/helpdesk' },
]

export const Route = createFileRoute('/')({
  loader: async () => {
    const { data } = await supabase
      .from('announcements')
      .select('id, title, body')
      .eq('pinned', true)
      .order('published_at', { ascending: false })
      .limit(3)
    return { pinned: data ?? [] }
  },
  component: function HomePage() {
    const { pinned } = Route.useLoaderData()
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-burgundy-400 to-transparent mx-auto mb-4" />
          <h1 className="text-4xl font-serif font-bold text-burgundy-700">Ashara Mubaraka</h1>
          <p className="text-burgundy-400 uppercase tracking-widest text-sm mt-1">Surat • 1447H</p>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-burgundy-400 to-transparent mx-auto mt-4 mb-8" />
          <CountdownTimer />
        </div>

        {pinned.length > 0 && (
          <div className="mb-8 space-y-2">
            {(pinned as { id: string; title: string; body: string }[]).map(a => (
              <div key={a.id} className="bg-burgundy-50 border-l-4 border-burgundy-400 px-4 py-3 rounded-r-lg">
                <p className="font-semibold text-burgundy-700 text-sm">{a.title}</p>
                <p className="text-sm text-gray-600 mt-0.5">{a.body}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {MODULES.map(m => <ModuleCard key={m.to} {...m} />)}
        </div>
      </div>
    )
  },
})
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
pnpm vitest run tests/unit/countdown.test.ts
```

Expected: PASS.

- [ ] **Step 7: Verify in browser and commit**

```bash
pnpm dev
# Open http://localhost:3000 — countdown timer + module grid visible
git add app/routes/index.tsx app/components/ui/ tests/unit/countdown.test.ts
git commit -m "feat: add home page with countdown timer and module cards"
```

---

## Phase 2: Information Modules

### Task 6: Schedule page

**Files:**
- Create: `app/routes/schedule.tsx`

- [ ] **Step 1: Create route**

```tsx
// app/routes/schedule.tsx
import { createFileRoute } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'

interface ScheduleEvent {
  id: string; day: number; event_time: string; title: string; description?: string; location?: string
}

export const Route = createFileRoute('/schedule')({
  loader: async () => {
    const { data } = await supabase
      .from('schedule_events')
      .select('*')
      .order('day', { ascending: true })
      .order('event_time', { ascending: true })
    return { events: (data ?? []) as ScheduleEvent[] }
  },
  component: function SchedulePage() {
    const { events } = Route.useLoaderData()
    const byDay = events.reduce((acc: Record<number, ScheduleEvent[]>, e) => {
      acc[e.day] = [...(acc[e.day] ?? []), e]
      return acc
    }, {})
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-serif text-burgundy-700 mb-6">Schedule</h1>
        {Object.entries(byDay).map(([day, dayEvents]) => (
          <div key={day} className="mb-8">
            <h2 className="text-lg font-bold text-burgundy-600 mb-3 border-b border-burgundy-100 pb-1">Day {day}</h2>
            <div className="space-y-3">
              {dayEvents.map(e => (
                <div key={e.id} className="flex gap-4 items-start">
                  <span className="text-sm font-mono text-burgundy-400 w-16 shrink-0">{e.event_time.slice(0, 5)}</span>
                  <div>
                    <p className="font-semibold text-gray-800">{e.title}</p>
                    {e.description && <p className="text-sm text-gray-500">{e.description}</p>}
                    {e.location && <p className="text-xs text-burgundy-400 mt-0.5">📍 {e.location}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {events.length === 0 && <p className="text-gray-400">Schedule will be published soon.</p>}
      </div>
    )
  },
})
```

- [ ] **Step 2: Verify and commit**

```bash
pnpm dev
# Navigate to http://localhost:3000/schedule — page renders (empty state if no data yet)
git add app/routes/schedule.tsx
git commit -m "feat: add schedule page"
```

---

### Task 7: Venue page

**Files:**
- Create: `app/routes/venue.tsx`

- [ ] **Step 1: Create route**

```tsx
// app/routes/venue.tsx
import { createFileRoute } from '@tanstack/react-router'

const VENUES = [
  { name: 'Saifee Masjid', zone: 'Central', address: 'Salabatpura, Surat', mapUrl: 'https://maps.google.com/?q=Saifee+Masjid+Surat' },
  { name: 'Burhani Masjid', zone: 'North', address: 'Nanpura, Surat', mapUrl: 'https://maps.google.com/?q=Burhani+Masjid+Surat' },
]

export const Route = createFileRoute('/venue')({
  component: function VenuePage() {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-serif text-burgundy-700 mb-6">Venue & Maps</h1>
        <div className="grid gap-4">
          {VENUES.map(v => (
            <div key={v.name} className="bg-white border border-burgundy-100 rounded-xl p-5">
              <h2 className="font-serif font-bold text-burgundy-700 text-lg">{v.name}</h2>
              <p className="text-sm text-gray-500 mt-1">Zone: {v.zone}</p>
              <p className="text-sm text-gray-500">{v.address}</p>
              <a href={v.mapUrl} target="_blank" rel="noreferrer"
                className="inline-block mt-3 text-sm bg-burgundy-700 text-ivory px-4 py-1.5 rounded-lg hover:bg-burgundy-800 transition-colors">
                Open in Maps →
              </a>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-6">Full interactive zone map will be added closer to the event.</p>
      </div>
    )
  },
})
```

- [ ] **Step 2: Verify and commit**

```bash
git add app/routes/venue.tsx
git commit -m "feat: add venue page"
```

---

### Task 8: Accommodation, Transport, Food pages

**Files:**
- Create: `app/routes/accommodation.tsx`
- Create: `app/routes/transport.tsx`
- Create: `app/routes/food.tsx`

- [ ] **Step 1: Create accommodation.tsx**

```tsx
// app/routes/accommodation.tsx
import { createFileRoute } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'

interface Building { id: string; building: string; zone?: string; floor?: string; capacity?: number; contact_person?: string }

export const Route = createFileRoute('/accommodation')({
  loader: async () => {
    const { data } = await supabase.from('accommodation').select('*').order('zone')
    return { buildings: (data ?? []) as Building[] }
  },
  component: function AccommodationPage() {
    const { buildings } = Route.useLoaderData()
    const byZone = buildings.reduce((acc: Record<string, Building[]>, b) => {
      const zone = b.zone ?? 'General'
      acc[zone] = [...(acc[zone] ?? []), b]
      return acc
    }, {})
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-serif text-burgundy-700 mb-6">Accommodation</h1>
        {Object.entries(byZone).map(([zone, bldgs]) => (
          <div key={zone} className="mb-8">
            <h2 className="font-bold text-burgundy-600 mb-3 border-b border-burgundy-100 pb-1">Zone: {zone}</h2>
            <div className="grid gap-3">
              {bldgs.map(b => (
                <div key={b.id} className="bg-white border border-burgundy-100 rounded-xl p-4">
                  <p className="font-semibold text-gray-800">{b.building}</p>
                  {b.floor && <p className="text-sm text-gray-500">Floor: {b.floor}</p>}
                  {b.capacity && <p className="text-sm text-gray-500">Capacity: {b.capacity}</p>}
                  {b.contact_person && <p className="text-sm text-burgundy-500 mt-1">Contact: {b.contact_person}</p>}
                </div>
              ))}
            </div>
          </div>
        ))}
        {buildings.length === 0 && <p className="text-gray-400">Accommodation details will be published soon.</p>}
      </div>
    )
  },
})
```

- [ ] **Step 2: Create transport.tsx**

```tsx
// app/routes/transport.tsx
import { createFileRoute } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'

interface Route_ { id: string; route_name: string; stops?: string[]; timings?: string; notes?: string }

export const Route = createFileRoute('/transport')({
  loader: async () => {
    const { data } = await supabase.from('transport_routes').select('*').order('route_name')
    return { routes: (data ?? []) as Route_[] }
  },
  component: function TransportPage() {
    const { routes } = Route.useLoaderData()
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-serif text-burgundy-700 mb-6">Transport & Routes</h1>
        <div className="grid gap-4">
          {routes.map(r => (
            <div key={r.id} className="bg-white border border-burgundy-100 rounded-xl p-5">
              <h2 className="font-serif font-bold text-burgundy-700">{r.route_name}</h2>
              {r.stops?.length && (
                <div className="mt-2">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Stops</p>
                  <div className="flex flex-wrap gap-1">
                    {r.stops.map(s => (
                      <span key={s} className="bg-burgundy-50 text-burgundy-600 text-xs px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {r.timings && <p className="text-sm text-gray-600 mt-2">🕐 {r.timings}</p>}
              {r.notes && <p className="text-sm text-gray-400 mt-1 italic">{r.notes}</p>}
            </div>
          ))}
          {routes.length === 0 && <p className="text-gray-400">Transport details will be published soon.</p>}
        </div>
      </div>
    )
  },
})
```

- [ ] **Step 3: Create food.tsx**

```tsx
// app/routes/food.tsx
import { createFileRoute } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'

interface FoodZone { id: string; zone_name: string; location?: string; serving_times?: string; capacity?: number }

export const Route = createFileRoute('/food')({
  loader: async () => {
    const { data } = await supabase.from('food_zones').select('*').order('zone_name')
    return { zones: (data ?? []) as FoodZone[] }
  },
  component: function FoodPage() {
    const { zones } = Route.useLoaderData()
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-serif text-burgundy-700 mb-2">Food & Thaal</h1>
        <p className="text-gray-500 mb-6">Faiz al-Mawaid al-Burhaniyah zones and serving times.</p>
        <div className="grid gap-4">
          {zones.map(z => (
            <div key={z.id} className="bg-white border border-burgundy-100 rounded-xl p-5">
              <h2 className="font-serif font-bold text-burgundy-700">{z.zone_name}</h2>
              {z.location && <p className="text-sm text-gray-500 mt-1">📍 {z.location}</p>}
              {z.serving_times && <p className="text-sm text-gray-600 mt-1">🕐 {z.serving_times}</p>}
              {z.capacity && <p className="text-sm text-gray-400 mt-1">Capacity: {z.capacity}</p>}
            </div>
          ))}
          {zones.length === 0 && <p className="text-gray-400">Food zone details will be published soon.</p>}
        </div>
      </div>
    )
  },
})
```

- [ ] **Step 4: Commit**

```bash
git add app/routes/accommodation.tsx app/routes/transport.tsx app/routes/food.tsx
git commit -m "feat: add accommodation, transport, and food pages"
```

---

### Task 9: Volunteer signup page

**Files:**
- Create: `app/routes/volunteer.tsx`

- [ ] **Step 1: Create route**

```tsx
// app/routes/volunteer.tsx
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/start'
import { supabaseAdmin } from '../lib/supabase'
import { useState } from 'react'

const submitVolunteer = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as { name: string; its_id: string; phone: string; email: string; role: string; zone: string })
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from('volunteer_signups').insert(data)
    if (error) throw new Error(error.message)
    return { success: true }
  })

export const Route = createFileRoute('/volunteer')({
  component: function VolunteerPage() {
    const [form, setForm] = useState({ name: '', its_id: '', phone: '', email: '', role: '', zone: '' })
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(e: React.FormEvent) {
      e.preventDefault()
      try {
        await submitVolunteer({ data: form })
        setSubmitted(true)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Submission failed. Please try again.')
      }
    }

    if (submitted) return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-4xl mb-3">🙏</div>
        <h2 className="font-serif text-2xl text-burgundy-700">Jazakallah Khair</h2>
        <p className="text-gray-500 mt-2">Your volunteer signup has been received.</p>
      </div>
    )

    const fields = [
      { name: 'name',    label: 'Full Name',              required: true },
      { name: 'its_id',  label: 'ITS ID',                 required: false },
      { name: 'phone',   label: 'Phone / WhatsApp',        required: true },
      { name: 'email',   label: 'Email',                   required: false },
      { name: 'role',    label: 'Preferred Role',          required: false },
      { name: 'zone',    label: 'Preferred Zone',          required: false },
    ]

    return (
      <div className="max-w-lg mx-auto px-4 py-10">
        <h1 className="text-3xl font-serif text-burgundy-700 mb-6">Volunteer Signup</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(f => (
            <div key={f.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {f.label}{f.required && ' *'}
              </label>
              <input
                required={f.required}
                value={form[f.name as keyof typeof form]}
                onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-300"
              />
            </div>
          ))}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit"
            className="w-full bg-burgundy-700 text-ivory py-2.5 rounded-lg font-semibold hover:bg-burgundy-800 transition-colors">
            Submit Signup
          </button>
        </form>
      </div>
    )
  },
})
```

- [ ] **Step 2: Verify and commit**

```bash
git add app/routes/volunteer.tsx
git commit -m "feat: add volunteer signup page"
```

---

### Task 10: Gallery, Documents, About Surat pages

**Files:**
- Create: `app/routes/gallery.tsx`
- Create: `app/routes/documents.tsx`
- Create: `app/routes/about-surat.tsx`

- [ ] **Step 1: Create gallery.tsx**

```tsx
// app/routes/gallery.tsx
import { createFileRoute } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'

interface GalleryImage { id: string; url: string; caption?: string }

export const Route = createFileRoute('/gallery')({
  loader: async () => {
    const { data } = await supabase
      .from('gallery_images')
      .select('*')
      .order('uploaded_at', { ascending: false })
    return { images: (data ?? []) as GalleryImage[] }
  },
  component: function GalleryPage() {
    const { images } = Route.useLoaderData()
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-serif text-burgundy-700 mb-6">Gallery</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map(img => (
            <div key={img.id} className="aspect-square overflow-hidden rounded-xl bg-burgundy-50">
              <img src={img.url} alt={img.caption ?? ''} className="w-full h-full object-cover hover:scale-105 transition-transform" />
            </div>
          ))}
        </div>
        {images.length === 0 && <p className="text-gray-400">Photos will be added soon.</p>}
      </div>
    )
  },
})
```

- [ ] **Step 2: Create documents.tsx**

```tsx
// app/routes/documents.tsx
import { createFileRoute } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'

interface Doc { id: string; name: string; category?: string; file_url: string }

export const Route = createFileRoute('/documents')({
  loader: async () => {
    const { data } = await supabase.from('documents').select('*').order('category').order('name')
    return { docs: (data ?? []) as Doc[] }
  },
  component: function DocumentsPage() {
    const { docs } = Route.useLoaderData()
    const byCategory = docs.reduce((acc: Record<string, Doc[]>, d) => {
      const cat = d.category ?? 'General'
      acc[cat] = [...(acc[cat] ?? []), d]
      return acc
    }, {})
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-serif text-burgundy-700 mb-6">Documents & Resources</h1>
        {Object.entries(byCategory).map(([cat, catDocs]) => (
          <div key={cat} className="mb-6">
            <h2 className="font-bold text-burgundy-600 mb-3">{cat}</h2>
            <div className="space-y-2">
              {catDocs.map(d => (
                <a key={d.id} href={d.file_url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 bg-white border border-burgundy-100 rounded-lg px-4 py-3 hover:border-burgundy-300 transition-colors">
                  <span className="text-xl">📄</span>
                  <span className="text-sm font-medium text-gray-700">{d.name}</span>
                  <span className="ml-auto text-xs text-burgundy-400">Download →</span>
                </a>
              ))}
            </div>
          </div>
        ))}
        {docs.length === 0 && <p className="text-gray-400">Documents will be uploaded soon.</p>}
      </div>
    )
  },
})
```

- [ ] **Step 3: Create about-surat.tsx**

```tsx
// app/routes/about-surat.tsx
import { createFileRoute } from '@tanstack/react-router'

const INFO = [
  { category: 'Emergency',   items: ['Police: 100', 'Ambulance: 108', 'Fire: 101'] },
  { category: 'Hospitals',   items: ['New Civil Hospital: +91 261 244 0000', 'Kiran Hospital: +91 261 267 3000', 'SMIMER Hospital: +91 261 231 2891'] },
  { category: 'Pharmacies',  items: ['Apollo Pharmacy (24hr): +91 261 246 0000', 'MedPlus Nanpura: +91 261 326 0000'] },
  { category: 'Transport',   items: ['Surat Airport: +91 261 268 5000', 'Surat Railway: 139', 'GSRTC City Bus: +91 261 425 0000'] },
]

export const Route = createFileRoute('/about-surat')({
  component: function AboutSuratPage() {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-serif text-burgundy-700 mb-2">About Surat</h1>
        <p className="text-gray-500 mb-8">Essential information for visiting mumineen.</p>
        <div className="grid gap-5">
          {INFO.map(c => (
            <div key={c.category} className="bg-white border border-burgundy-100 rounded-xl p-5">
              <h2 className="font-bold text-burgundy-700 mb-3">{c.category}</h2>
              <ul className="space-y-1">
                {c.items.map(item => <li key={item} className="text-sm text-gray-600">• {item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    )
  },
})
```

- [ ] **Step 4: Commit**

```bash
git add app/routes/gallery.tsx app/routes/documents.tsx app/routes/about-surat.tsx
git commit -m "feat: add gallery, documents, and about-surat pages"
```

---

### Task 11: Announcements page with Supabase Realtime

**Files:**
- Create: `app/routes/announcements.tsx`
- Create: `tests/unit/announcements.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// tests/unit/announcements.test.ts
import { describe, it, expect } from 'vitest'
import { formatAnnouncementLabel } from '../../app/routes/announcements'

describe('formatAnnouncementLabel', () => {
  it('marks pinned announcements', () => {
    expect(formatAnnouncementLabel({ pinned: true, category: undefined })).toBe('📌 Pinned')
  })
  it('uses category when not pinned', () => {
    expect(formatAnnouncementLabel({ pinned: false, category: 'Transport' })).toBe('Transport')
  })
  it('falls back to General when no category', () => {
    expect(formatAnnouncementLabel({ pinned: false, category: undefined })).toBe('General')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm vitest run tests/unit/announcements.test.ts
```

Expected: FAIL — `formatAnnouncementLabel` not exported.

- [ ] **Step 3: Create announcements route**

```tsx
// app/routes/announcements.tsx
import { createFileRoute } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'

interface Announcement {
  id: string; title: string; body: string; category?: string; pinned: boolean; published_at: string
}

export function formatAnnouncementLabel(a: Pick<Announcement, 'pinned' | 'category'>): string {
  if (a.pinned) return '📌 Pinned'
  return a.category ?? 'General'
}

export const Route = createFileRoute('/announcements')({
  loader: async () => {
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .order('pinned', { ascending: false })
      .order('published_at', { ascending: false })
    return { initial: (data ?? []) as Announcement[] }
  },
  component: function AnnouncementsPage() {
    const { initial } = Route.useLoaderData()
    const [announcements, setAnnouncements] = useState<Announcement[]>(initial)

    useEffect(() => {
      const channel = supabase
        .channel('announcements-feed')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, payload => {
          setAnnouncements(prev => [payload.new as Announcement, ...prev])
        })
        .subscribe()
      return () => { supabase.removeChannel(channel) }
    }, [])

    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-serif text-burgundy-700 mb-6">Announcements</h1>
        <div className="space-y-4">
          {announcements.map(a => (
            <div key={a.id} className={`bg-white border rounded-xl p-5 ${a.pinned ? 'border-burgundy-300' : 'border-burgundy-100'}`}>
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-serif font-bold text-burgundy-700">{a.title}</h2>
                <span className="text-xs bg-burgundy-50 text-burgundy-600 px-2 py-0.5 rounded-full shrink-0">
                  {formatAnnouncementLabel(a)}
                </span>
              </div>
              <p className="text-gray-600 text-sm mt-2">{a.body}</p>
              <p className="text-xs text-gray-400 mt-2">{new Date(a.published_at).toLocaleDateString()}</p>
            </div>
          ))}
          {announcements.length === 0 && <p className="text-gray-400">No announcements yet.</p>}
        </div>
      </div>
    )
  },
})
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm vitest run tests/unit/announcements.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/routes/announcements.tsx tests/unit/announcements.test.ts
git commit -m "feat: add announcements page with Supabase Realtime"
```

---

## Phase 3: AI Helpdesk

### Task 12: LLM abstraction layer

**Files:**
- Create: `app/lib/llm.ts`
- Create: `tests/unit/llm.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// tests/unit/llm.test.ts
import { describe, it, expect, vi } from 'vitest'

vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ choices: [{ message: { content: 'Test response' } }] }),
}))

import { buildLLMClient } from '../../app/lib/llm'

describe('buildLLMClient', () => {
  it('returns assistant response content', async () => {
    const client = buildLLMClient()
    const result = await client.chat([{ role: 'user', content: 'Hello' }])
    expect(result).toBe('Test response')
  })
  it('throws on non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401 }))
    const client = buildLLMClient()
    await expect(client.chat([{ role: 'user', content: 'Hello' }])).rejects.toThrow('LLM error: 401')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm vitest run tests/unit/llm.test.ts
```

Expected: FAIL — `buildLLMClient` not found.

- [ ] **Step 3: Implement LLM abstraction**

```typescript
// app/lib/llm.ts
interface Message { role: 'user' | 'assistant' | 'system'; content: string }

interface LLMClient {
  chat(messages: Message[], systemPrompt?: string): Promise<string>
}

export function buildLLMClient(): LLMClient {
  const baseUrl = process.env.LLM_BASE_URL ?? 'https://openrouter.ai/api/v1'
  const apiKey  = process.env.LLM_API_KEY ?? ''
  const model   = process.env.LLM_MODEL ?? 'anthropic/claude-3-haiku'

  return {
    async chat(messages, systemPrompt) {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          messages: [
            ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
            ...messages,
          ],
        }),
      })
      if (!res.ok) throw new Error(`LLM error: ${res.status}`)
      const data = await res.json()
      return data.choices[0].message.content as string
    },
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm vitest run tests/unit/llm.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/lib/llm.ts tests/unit/llm.test.ts
git commit -m "feat: add provider-agnostic LLM client"
```

---

### Task 13: Chat rate limiting

**Files:**
- Create: `app/lib/rateLimit.ts`
- Create: `tests/unit/rateLimit.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// tests/unit/rateLimit.test.ts
import { describe, it, expect, vi } from 'vitest'
import { isRateLimited, incrementMessageCount } from '../../app/lib/rateLimit'

describe('isRateLimited', () => {
  it('allows messages under the limit', () => {
    const s = { message_count: 3, window_started_at: new Date().toISOString() }
    expect(isRateLimited(s, 5)).toBe(false)
  })
  it('blocks when limit is reached', () => {
    const s = { message_count: 5, window_started_at: new Date().toISOString() }
    expect(isRateLimited(s, 5)).toBe(true)
  })
  it('resets after the 1-hour window expires', () => {
    const old = new Date(Date.now() - 61 * 60 * 1000).toISOString()
    const s = { message_count: 5, window_started_at: old }
    expect(isRateLimited(s, 5)).toBe(false)
  })
})

describe('incrementMessageCount', () => {
  it('increments count within window', () => {
    const s = { message_count: 2, window_started_at: new Date().toISOString() }
    expect(incrementMessageCount(s).message_count).toBe(3)
  })
  it('resets count when window has expired', () => {
    const old = new Date(Date.now() - 61 * 60 * 1000).toISOString()
    const s = { message_count: 5, window_started_at: old }
    expect(incrementMessageCount(s).message_count).toBe(1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm vitest run tests/unit/rateLimit.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement rate limiting helpers**

```typescript
// app/lib/rateLimit.ts
export interface SessionWindow {
  message_count: number
  window_started_at: string
}

const WINDOW_MS = 60 * 60 * 1000

export function isRateLimited(session: SessionWindow, limit: number): boolean {
  const age = Date.now() - new Date(session.window_started_at).getTime()
  if (age > WINDOW_MS) return false
  return session.message_count >= limit
}

export function incrementMessageCount(session: SessionWindow): SessionWindow {
  const age = Date.now() - new Date(session.window_started_at).getTime()
  if (age > WINDOW_MS) {
    return { message_count: 1, window_started_at: new Date().toISOString() }
  }
  return { ...session, message_count: session.message_count + 1 }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm vitest run tests/unit/rateLimit.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/lib/rateLimit.ts tests/unit/rateLimit.test.ts
git commit -m "feat: add chat rate limiting helpers"
```

---

### Task 14: Chat server functions

**Files:**
- Create: `app/server/chat.ts`

- [ ] **Step 1: Create server functions**

```typescript
// app/server/chat.ts
import { createServerFn } from '@tanstack/start'
import { supabaseAdmin } from '../lib/supabase'
import { buildLLMClient } from '../lib/llm'
import { isRateLimited, incrementMessageCount } from '../lib/rateLimit'

const SYSTEM_PROMPT = `You are a helpful assistant for Ashara Mubaraka Surat 1447H.
Help visiting mumineen with questions about schedules, accommodation, transport, food zones, and general event information.
Be warm, respectful, and concise. If you don't know something, suggest they contact the helpdesk.
Always respond in English.`

const RATE_LIMIT = parseInt(process.env.CHAT_RATE_LIMIT ?? '5', 10)

export const createChatSession = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as { name: string; phone: string; email: string; whatsapp: string })
  .handler(async ({ data }) => {
    const { data: session, error } = await supabaseAdmin
      .from('chat_sessions')
      .insert({
        contact_name: data.name,
        contact_phone: data.phone,
        contact_email: data.email,
        contact_whatsapp: data.whatsapp,
        message_count: 0,
        window_started_at: new Date().toISOString(),
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return { sessionId: session.id as string }
  })

export const sendChatMessage = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as { sessionId: string; content: string })
  .handler(async ({ data }) => {
    const { data: session, error: sessionErr } = await supabaseAdmin
      .from('chat_sessions')
      .select('*')
      .eq('id', data.sessionId)
      .single()
    if (sessionErr) throw new Error('Session not found')

    if (isRateLimited(session, RATE_LIMIT)) {
      return { rateLimited: true, reply: null as null }
    }

    const updated = incrementMessageCount(session)
    await supabaseAdmin.from('chat_sessions').update({
      message_count: updated.message_count,
      window_started_at: updated.window_started_at,
    }).eq('id', data.sessionId)

    const { data: history } = await supabaseAdmin
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', data.sessionId)
      .order('created_at')

    await supabaseAdmin.from('chat_messages').insert({
      session_id: data.sessionId, role: 'user', content: data.content,
    })

    const llm = buildLLMClient()
    const reply = await llm.chat([
      ...(history ?? []).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user', content: data.content },
    ], SYSTEM_PROMPT)

    await supabaseAdmin.from('chat_messages').insert({
      session_id: data.sessionId, role: 'assistant', content: reply,
    })

    return { rateLimited: false, reply }
  })

export const createTicket = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as { sessionId: string; escalationChannel: 'email' | 'whatsapp'; summary: string })
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from('support_tickets').insert({
      session_id: data.sessionId,
      escalation_channel: data.escalationChannel,
      summary: data.summary,
    })
    if (error) throw new Error(error.message)
    await supabaseAdmin.from('chat_sessions').update({ status: 'escalated' }).eq('id', data.sessionId)
    return { success: true }
  })
```

- [ ] **Step 2: Commit**

```bash
git add app/server/chat.ts
git commit -m "feat: add chat server functions with LLM and rate limiting"
```

---

### Task 15: Chat widget UI

**Files:**
- Create: `app/components/helpdesk/ContactForm.tsx`
- Create: `app/components/helpdesk/ChatMessage.tsx`
- Create: `app/components/helpdesk/EscalationModal.tsx`
- Create: `app/components/helpdesk/ChatWidget.tsx`
- Create: `app/routes/helpdesk.tsx`
- Modify: `app/routes/__root.tsx`

- [ ] **Step 1: Create ContactForm.tsx**

```tsx
// app/components/helpdesk/ContactForm.tsx
import { useState } from 'react'

interface Contact { name: string; phone: string; email: string; whatsapp: string }
interface Props { onSubmit: (contact: Contact) => void }

export function ContactForm({ onSubmit }: Props) {
  const [form, setForm] = useState<Contact>({ name: '', phone: '', email: '', whatsapp: '' })
  const fields = [
    { name: 'name',     placeholder: 'Full Name *',              required: true },
    { name: 'phone',    placeholder: 'Phone *',                  required: true },
    { name: 'whatsapp', placeholder: 'WhatsApp (if different)',  required: false },
    { name: 'email',    placeholder: 'Email',                    required: false },
  ]
  return (
    <div className="p-4 space-y-3">
      <p className="text-sm text-gray-600 font-medium">Please share your contact details to begin:</p>
      {fields.map(f => (
        <input key={f.name} placeholder={f.placeholder} required={f.required}
          value={form[f.name as keyof Contact]}
          onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-300"
        />
      ))}
      <button disabled={!form.name || !form.phone} onClick={() => onSubmit(form)}
        className="w-full bg-burgundy-700 text-ivory py-2 rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-burgundy-800 transition-colors">
        Start Chat
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Create ChatMessage.tsx**

```tsx
// app/components/helpdesk/ChatMessage.tsx
interface Props { role: 'user' | 'assistant'; content: string }

export function ChatMessage({ role, content }: Props) {
  const isBot = role === 'assistant'
  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-2`}>
      <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
        isBot ? 'bg-burgundy-50 text-gray-700' : 'bg-burgundy-700 text-ivory'
      }`}>
        {content}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create EscalationModal.tsx**

```tsx
// app/components/helpdesk/EscalationModal.tsx
interface Props { onEscalate: (channel: 'email' | 'whatsapp') => void; onClose: () => void }

export function EscalationModal({ onEscalate, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <h3 className="font-serif font-bold text-burgundy-700 text-lg mb-2">Contact Helpdesk</h3>
        <p className="text-sm text-gray-500 mb-4">How would you like our team to follow up?</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button onClick={() => onEscalate('whatsapp')}
            className="bg-green-500 text-white py-3 rounded-xl font-semibold text-sm hover:bg-green-600 transition-colors">
            💬 WhatsApp
          </button>
          <button onClick={() => onEscalate('email')}
            className="bg-burgundy-700 text-ivory py-3 rounded-xl font-semibold text-sm hover:bg-burgundy-800 transition-colors">
            ✉️ Email
          </button>
        </div>
        <button onClick={onClose} className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create ChatWidget.tsx**

```tsx
// app/components/helpdesk/ChatWidget.tsx
import { useState, useRef, useEffect } from 'react'
import { ContactForm } from './ContactForm'
import { ChatMessage } from './ChatMessage'
import { EscalationModal } from './EscalationModal'
import { createChatSession, sendChatMessage, createTicket } from '../../server/chat'

interface Message { role: 'user' | 'assistant'; content: string }

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [rateLimited, setRateLimited] = useState(false)
  const [showEscalation, setShowEscalation] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function handleContactSubmit(contact: { name: string; phone: string; email: string; whatsapp: string }) {
    const { sessionId: id } = await createChatSession({ data: contact })
    setSessionId(id)
    setMessages([{ role: 'assistant', content: `Wa'alaikum salaam ${contact.name}! How can I help you with Ashara Surat 1447H?` }])
  }

  async function handleSend() {
    if (!input.trim() || !sessionId || loading || rateLimited) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)
    const result = await sendChatMessage({ data: { sessionId, content: userMsg } })
    setLoading(false)
    if (result.rateLimited) { setRateLimited(true); return }
    if (result.reply) setMessages(prev => [...prev, { role: 'assistant', content: result.reply! }])
  }

  async function handleEscalate(channel: 'email' | 'whatsapp') {
    if (!sessionId) return
    const summary = messages.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n')
    await createTicket({ data: { sessionId, escalationChannel: channel, summary } })
    setShowEscalation(false)
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `Thank you! Our team will reach out via ${channel} shortly. Jazakallah Khair.`,
    }])
  }

  return (
    <>
      {showEscalation && <EscalationModal onEscalate={handleEscalate} onClose={() => setShowEscalation(false)} />}

      <button onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 bg-burgundy-700 text-ivory w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-2xl hover:bg-burgundy-800 transition-colors z-40">
        {open ? '✕' : '💬'}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 w-80 bg-white rounded-2xl shadow-2xl border border-burgundy-100 flex flex-col overflow-hidden z-40"
          style={{ height: '460px' }}>
          <div className="bg-burgundy-700 text-ivory px-4 py-3 flex items-center justify-between shrink-0">
            <div>
              <p className="font-semibold text-sm">Ashara Surat Helpdesk</p>
              <p className="text-xs text-burgundy-200">AI assistant • 24/7</p>
            </div>
            <button onClick={() => setShowEscalation(true)}
              className="text-xs bg-burgundy-600 hover:bg-burgundy-500 px-2 py-1 rounded-lg transition-colors">
              📞 Helpdesk
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {!sessionId
              ? <ContactForm onSubmit={handleContactSubmit} />
              : (
                <>
                  {messages.map((m, i) => <ChatMessage key={i} role={m.role} content={m.content} />)}
                  {loading && <ChatMessage role="assistant" content="..." />}
                  {rateLimited && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center mt-2">
                      <p className="text-xs text-red-600 mb-2">You've reached the 5 message limit for this hour.</p>
                      <button onClick={() => setShowEscalation(true)}
                        className="text-xs bg-burgundy-700 text-ivory px-3 py-1.5 rounded-lg hover:bg-burgundy-800">
                        Contact Helpdesk
                      </button>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </>
              )
            }
          </div>

          {sessionId && !rateLimited && (
            <div className="border-t border-gray-100 p-3 flex gap-2 shrink-0">
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Type your question..."
                className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-300"
              />
              <button onClick={handleSend} disabled={loading || !input.trim()}
                className="bg-burgundy-700 text-ivory px-3 py-1.5 rounded-lg text-sm disabled:opacity-50 hover:bg-burgundy-800">
                →
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
```

- [ ] **Step 5: Add ChatWidget to root layout**

```tsx
// app/routes/__root.tsx — add ChatWidget import and usage
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Nav } from '../components/layout/Nav'
import { Footer } from '../components/layout/Footer'
import { ChatWidget } from '../components/helpdesk/ChatWidget'
import '../styles/globals.css'

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen flex flex-col bg-ivory">
      <Nav />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  ),
})
```

- [ ] **Step 6: Create helpdesk route**

```tsx
// app/routes/helpdesk.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/helpdesk')({
  component: function HelpdeskPage() {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center">
        <div className="text-5xl mb-4">💬</div>
        <h1 className="text-3xl font-serif text-burgundy-700 mb-3">Helpdesk</h1>
        <p className="text-gray-500 mb-4">
          Our AI assistant is available 24/7 for questions about Ashara Surat 1447H.
        </p>
        <p className="text-sm text-gray-400">
          Use the chat button in the bottom-right corner to get started.
          If the AI cannot resolve your query, a volunteer will follow up via WhatsApp or Email.
        </p>
      </div>
    )
  },
})
```

- [ ] **Step 7: Test in browser**

```bash
pnpm dev
```

- Open chat widget → fill contact form → send a message → verify AI responds
- Send 5 messages → verify rate limit message appears
- Click "Contact Helpdesk" → verify escalation modal appears → select WhatsApp → verify confirmation message

- [ ] **Step 8: Commit**

```bash
git add app/components/helpdesk/ app/routes/helpdesk.tsx app/routes/__root.tsx
git commit -m "feat: add AI helpdesk chat widget with rate limiting and ticket escalation"
```

---

## Phase 4: Admin Panel

### Task 16: Admin auth + layout

**Files:**
- Create: `supabase/migrations/004_admin_profiles.sql`
- Create: `app/routes/admin/login.tsx`
- Create: `app/routes/admin/__layout.tsx`

- [ ] **Step 1: Write profiles migration**

```sql
-- supabase/migrations/004_admin_profiles.sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'viewer'
);

-- After creating admin user in Supabase Auth dashboard, run:
-- insert into profiles (id, role) values ('<user-uuid>', 'admin');
```

- [ ] **Step 2: Run migration**

```bash
npx supabase db push
```

Expected: `004_admin_profiles` applied.

- [ ] **Step 3: Create admin login page**

```tsx
// app/routes/admin/login.tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { supabase } from '../../lib/supabase'
import { useState } from 'react'

export const Route = createFileRoute('/admin/login')({
  component: function AdminLoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    async function handleLogin(e: React.FormEvent) {
      e.preventDefault()
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) { setError('Invalid credentials'); return }
      navigate({ to: '/admin' })
    }

    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <form onSubmit={handleLogin} className="bg-white border border-burgundy-100 rounded-2xl p-8 w-full max-w-sm space-y-4 shadow-md">
          <h1 className="font-serif text-2xl text-burgundy-700 text-center mb-2">Admin Login</h1>
          <input type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-300" />
          <input type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-300" />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit"
            className="w-full bg-burgundy-700 text-ivory py-2.5 rounded-lg font-semibold hover:bg-burgundy-800 transition-colors">
            Sign In
          </button>
        </form>
      </div>
    )
  },
})
```

- [ ] **Step 4: Create admin layout with auth guard**

```tsx
// app/routes/admin/__layout.tsx
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { supabase } from '../../lib/supabase'

export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw redirect({ to: '/admin/login' })
  },
  component: () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-burgundy-800 text-ivory px-6 py-3 flex items-center gap-6">
        <span className="font-bold font-serif">⚙️ Admin Panel</span>
        <a href="/admin/announcements" className="text-sm text-burgundy-200 hover:text-ivory transition-colors">Announcements</a>
        <a href="/admin/schedule" className="text-sm text-burgundy-200 hover:text-ivory transition-colors">Schedule</a>
        <a href="/admin/tickets" className="text-sm text-burgundy-200 hover:text-ivory transition-colors">Tickets</a>
        <a href="/" className="text-sm text-burgundy-400 hover:text-ivory ml-auto transition-colors">← View Site</a>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Outlet />
      </div>
    </div>
  ),
})
```

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/004_admin_profiles.sql app/routes/admin/
git commit -m "feat: add admin auth guard and login page"
```

---

### Task 16b: Admin — Index route

**Files:**
- Create: `app/routes/admin/index.tsx`

- [ ] **Step 1: Create admin index**

```tsx
// app/routes/admin/index.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/')({
  loader: () => { throw redirect({ to: '/admin/announcements' }) },
})
```

- [ ] **Step 2: Commit**

```bash
git add app/routes/admin/index.tsx
git commit -m "feat: add admin index redirect"
```

---

### Task 17: Admin — Announcements CMS

**Files:**
- Create: `app/routes/admin/announcements.tsx`

- [ ] **Step 1: Create announcements CMS**

```tsx
// app/routes/admin/announcements.tsx
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/start'
import { supabaseAdmin } from '../../lib/supabase'
import { supabase } from '../../lib/supabase'
import { useState } from 'react'

interface Announcement { id: string; title: string; body: string; category?: string; pinned: boolean }

const upsertAnnouncement = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as { id?: string; title: string; body: string; category: string; pinned: boolean })
  .handler(async ({ data }) => {
    const { id, ...fields } = data
    if (id) {
      await supabaseAdmin.from('announcements').update(fields).eq('id', id)
    } else {
      await supabaseAdmin.from('announcements').insert(fields)
    }
    return { success: true }
  })

const deleteAnnouncement = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as { id: string })
  .handler(async ({ data }) => {
    await supabaseAdmin.from('announcements').delete().eq('id', data.id)
    return { success: true }
  })

const EMPTY_FORM = { title: '', body: '', category: '', pinned: false }

export const Route = createFileRoute('/admin/announcements')({
  loader: async () => {
    const { data } = await supabase.from('announcements').select('*').order('published_at', { ascending: false })
    return { announcements: (data ?? []) as Announcement[] }
  },
  component: function AdminAnnouncementsPage() {
    const { announcements: initial } = Route.useLoaderData()
    const [items, setItems] = useState<Announcement[]>(initial)
    const [form, setForm] = useState(EMPTY_FORM)
    const [editId, setEditId] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent) {
      e.preventDefault()
      await upsertAnnouncement({ data: editId ? { ...form, id: editId } : form })
      setForm(EMPTY_FORM)
      setEditId(null)
      window.location.reload()
    }

    function startEdit(a: Announcement) {
      setEditId(a.id)
      setForm({ title: a.title, body: a.body, category: a.category ?? '', pinned: a.pinned })
    }

    return (
      <div>
        <h1 className="text-2xl font-serif text-burgundy-700 mb-6">Announcements</h1>
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-5 mb-8 space-y-3">
          <h2 className="font-semibold text-gray-700">{editId ? 'Edit' : 'New'} Announcement</h2>
          <input placeholder="Title *" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <textarea placeholder="Body *" required rows={3} value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <input placeholder="Category (e.g. Transport, General)" value={form.category}
            onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.pinned} onChange={e => setForm(p => ({ ...p, pinned: e.target.checked }))} />
            Pin to homepage
          </label>
          <div className="flex gap-2">
            <button type="submit" className="bg-burgundy-700 text-ivory px-4 py-2 rounded-lg text-sm font-semibold hover:bg-burgundy-800">
              {editId ? 'Update' : 'Publish'}
            </button>
            {editId && (
              <button type="button" onClick={() => { setEditId(null); setForm(EMPTY_FORM) }}
                className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-200">
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="space-y-3">
          {items.map(a => (
            <div key={a.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-800">{a.title}</p>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{a.body}</p>
                <div className="flex gap-2 mt-1">
                  {a.pinned && <span className="text-xs bg-burgundy-50 text-burgundy-600 px-2 py-0.5 rounded-full">📌 Pinned</span>}
                  {a.category && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{a.category}</span>}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => startEdit(a)} className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200">Edit</button>
                <button onClick={async () => { await deleteAnnouncement({ data: { id: a.id } }); setItems(p => p.filter(i => i.id !== a.id)) }}
                  className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100">Delete</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-gray-400 text-sm">No announcements yet.</p>}
        </div>
      </div>
    )
  },
})
```

- [ ] **Step 2: Commit**

```bash
git add app/routes/admin/announcements.tsx
git commit -m "feat: add admin announcements CMS"
```

---

### Task 18: Admin — Schedule CMS

**Files:**
- Create: `app/routes/admin/schedule.tsx`

- [ ] **Step 1: Create schedule CMS**

```tsx
// app/routes/admin/schedule.tsx
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/start'
import { supabaseAdmin } from '../../lib/supabase'
import { supabase } from '../../lib/supabase'
import { useState } from 'react'

interface ScheduleEvent { id: string; day: number; event_time: string; title: string; description?: string; location?: string }

const upsertEvent = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as { id?: string; day: number; event_time: string; title: string; description?: string; location?: string })
  .handler(async ({ data }) => {
    const { id, ...fields } = data
    if (id) {
      await supabaseAdmin.from('schedule_events').update(fields).eq('id', id)
    } else {
      await supabaseAdmin.from('schedule_events').insert(fields)
    }
    return { success: true }
  })

const deleteEvent = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as { id: string })
  .handler(async ({ data }) => {
    await supabaseAdmin.from('schedule_events').delete().eq('id', data.id)
    return { success: true }
  })

const EMPTY_FORM = { day: 1, event_time: '', title: '', description: '', location: '' }

export const Route = createFileRoute('/admin/schedule')({
  loader: async () => {
    const { data } = await supabase.from('schedule_events').select('*').order('day').order('event_time')
    return { events: (data ?? []) as ScheduleEvent[] }
  },
  component: function AdminSchedulePage() {
    const { events: initial } = Route.useLoaderData()
    const [items, setItems] = useState<ScheduleEvent[]>(initial)
    const [form, setForm] = useState(EMPTY_FORM)
    const [editId, setEditId] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent) {
      e.preventDefault()
      await upsertEvent({ data: editId ? { ...form, id: editId } : form })
      setForm(EMPTY_FORM)
      setEditId(null)
      window.location.reload()
    }

    return (
      <div>
        <h1 className="text-2xl font-serif text-burgundy-700 mb-6">Schedule</h1>
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-5 mb-8 space-y-3">
          <h2 className="font-semibold text-gray-700">{editId ? 'Edit' : 'Add'} Event</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Day *</label>
              <input type="number" min={1} max={10} required value={form.day}
                onChange={e => setForm(p => ({ ...p, day: parseInt(e.target.value) }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Time *</label>
              <input type="time" required value={form.event_time}
                onChange={e => setForm(p => ({ ...p, event_time: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <input placeholder="Title *" required value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <input placeholder="Location" value={form.location}
            onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <textarea placeholder="Description" rows={2} value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <div className="flex gap-2">
            <button type="submit" className="bg-burgundy-700 text-ivory px-4 py-2 rounded-lg text-sm font-semibold hover:bg-burgundy-800">
              {editId ? 'Update' : 'Add Event'}
            </button>
            {editId && (
              <button type="button" onClick={() => { setEditId(null); setForm(EMPTY_FORM) }}
                className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-200">
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="space-y-2">
          {items.map(e => (
            <div key={e.id} className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between">
              <div className="flex gap-3 items-center">
                <span className="text-xs text-gray-400 w-10 shrink-0">Day {e.day}</span>
                <span className="text-xs font-mono text-burgundy-400 w-10 shrink-0">{e.event_time?.slice(0, 5)}</span>
                <span className="text-sm font-medium text-gray-800">{e.title}</span>
                {e.location && <span className="text-xs text-gray-400">📍 {e.location}</span>}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => { setEditId(e.id); setForm({ day: e.day, event_time: e.event_time, title: e.title, description: e.description ?? '', location: e.location ?? '' }) }}
                  className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200">Edit</button>
                <button onClick={async () => { await deleteEvent({ data: { id: e.id } }); setItems(p => p.filter(i => i.id !== e.id)) }}
                  className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100">Delete</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-gray-400 text-sm">No events yet.</p>}
        </div>
      </div>
    )
  },
})
```

- [ ] **Step 2: Commit**

```bash
git add app/routes/admin/schedule.tsx
git commit -m "feat: add admin schedule CMS"
```

---

### Task 19: Admin — Tickets view

**Files:**
- Create: `app/routes/admin/tickets.tsx`

- [ ] **Step 1: Create tickets view**

```tsx
// app/routes/admin/tickets.tsx
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/start'
import { supabaseAdmin } from '../../lib/supabase'
import { supabase } from '../../lib/supabase'
import { useState } from 'react'

interface Ticket {
  id: string
  escalation_channel: 'email' | 'whatsapp'
  summary?: string
  escalated_at: string
  resolved_at: string | null
  chat_sessions: { contact_name: string; contact_phone?: string; contact_whatsapp?: string; contact_email?: string } | null
}

const resolveTicket = createServerFn({ method: 'POST' })
  .validator((d: unknown) => d as { id: string })
  .handler(async ({ data }) => {
    await supabaseAdmin
      .from('support_tickets')
      .update({ resolved_at: new Date().toISOString() })
      .eq('id', data.id)
    return { success: true }
  })

export const Route = createFileRoute('/admin/tickets')({
  loader: async () => {
    const { data } = await supabase
      .from('support_tickets')
      .select('*, chat_sessions(contact_name, contact_phone, contact_whatsapp, contact_email)')
      .order('escalated_at', { ascending: false })
    return { tickets: (data ?? []) as Ticket[] }
  },
  component: function AdminTicketsPage() {
    const { tickets: initial } = Route.useLoaderData()
    const [tickets, setTickets] = useState<Ticket[]>(initial)

    async function handleResolve(id: string) {
      await resolveTicket({ data: { id } })
      setTickets(p => p.map(t => t.id === id ? { ...t, resolved_at: new Date().toISOString() } : t))
    }

    const open     = tickets.filter(t => !t.resolved_at)
    const resolved = tickets.filter(t => t.resolved_at)

    return (
      <div>
        <h1 className="text-2xl font-serif text-burgundy-700 mb-6">Support Tickets</h1>

        <h2 className="font-semibold text-gray-700 mb-3">Open ({open.length})</h2>
        <div className="space-y-3 mb-8">
          {open.map(t => (
            <div key={t.id} className="bg-white border border-orange-200 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-800">{t.chat_sessions?.contact_name}</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {t.escalation_channel === 'whatsapp'
                      ? `💬 ${t.chat_sessions?.contact_whatsapp ?? t.chat_sessions?.contact_phone}`
                      : `✉️ ${t.chat_sessions?.contact_email}`}
                  </p>
                  {t.summary && <p className="text-sm text-gray-400 mt-2 italic line-clamp-2">"{t.summary}"</p>}
                  <p className="text-xs text-gray-300 mt-1">{new Date(t.escalated_at).toLocaleString()}</p>
                </div>
                <button onClick={() => handleResolve(t.id)}
                  className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 shrink-0 transition-colors">
                  Mark Resolved
                </button>
              </div>
            </div>
          ))}
          {open.length === 0 && <p className="text-gray-400 text-sm">No open tickets. 🎉</p>}
        </div>

        <h2 className="font-semibold text-gray-400 mb-3">Recently Resolved ({resolved.length})</h2>
        <div className="space-y-2">
          {resolved.slice(0, 10).map(t => (
            <div key={t.id} className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-2 flex items-center justify-between">
              <span className="text-sm text-gray-500">{t.chat_sessions?.contact_name}</span>
              <span className="text-xs text-gray-300">{t.resolved_at ? new Date(t.resolved_at).toLocaleDateString() : ''}</span>
            </div>
          ))}
        </div>
      </div>
    )
  },
})
```

- [ ] **Step 2: Commit**

```bash
git add app/routes/admin/tickets.tsx
git commit -m "feat: add admin tickets view"
```

---

## Phase 5: ITS Auth Placeholder

### Task 20: ITS OneLogin callback route

**Files:**
- Create: `app/routes/auth/callback.tsx`

- [ ] **Step 1: Create placeholder callback route**

```tsx
// app/routes/auth/callback.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'

// Placeholder for ITS OneLogin SSO — activate when ITS_AUTH_ENABLED=true and PassKey received.
// Implementation steps (future):
//   1. Read encrypted query string params from ITS52.com redirect
//   2. Server-side: call OneLogin_Decrypt(PassKey, encryptedData) — PassKey from ITS team
//   3. Validate token, extract ITSID / Name / Jamaat / JamiaatID
//   4. Store decoded user in Supabase session
//   5. Redirect to originally requested protected route

export const Route = createFileRoute('/auth/callback')({
  loader: async () => {
    const authEnabled = process.env.ITS_AUTH_ENABLED === 'true'
    if (!authEnabled) throw redirect({ to: '/' })
    return {}
  },
  component: function AuthCallbackPage() {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <p className="text-gray-500 font-serif">Completing sign in...</p>
      </div>
    )
  },
})
```

- [ ] **Step 2: Commit**

```bash
git add app/routes/auth/
git commit -m "feat: add ITS OneLogin callback placeholder"
```

---

## Verification

Run these in order to confirm the full application works end-to-end:

```bash
# 1. All unit tests pass
pnpm vitest run
# Expected: countdown, rateLimit, llm, announcements tests all PASS

# 2. TypeScript compiles cleanly
pnpm tsc --noEmit
# Expected: 0 errors

# 3. Start dev server
pnpm dev
```

**Manual checks in browser (http://localhost:3000):**

- [ ] Home: countdown timer ticking, module grid renders, pinned announcements show if any exist
- [ ] All 11 module pages load without errors (check /schedule, /venue, /accommodation, /transport, /food, /volunteer, /gallery, /documents, /about-surat, /announcements, /helpdesk)
- [ ] Announcements: insert a row in Supabase dashboard → verify it appears live without page refresh
- [ ] Chat widget: fill contact form → send message → get AI reply → send 5 total messages → rate limit triggers → "Contact Helpdesk" → escalation modal → pick WhatsApp → confirmation message → check support_tickets table in Supabase
- [ ] Admin: navigate to /admin → redirects to /admin/login → sign in → access announcements CMS → create announcement → verify it appears on /announcements
- [ ] Admin: create schedule event → verify it appears on /schedule
- [ ] Admin: view open tickets created via chat escalation → mark one resolved → verify it moves to resolved list
- [ ] `ITS_AUTH_ENABLED=false` → /auth/callback redirects to /
- [ ] Mobile: toggle DevTools device mode → verify all pages are responsive on 375px width
