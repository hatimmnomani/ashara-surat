# Ashara Surat Info — Design Spec
**Date:** 2026-04-17
**Status:** Approved

---

## Context

Every year the Dawoodi Bohra community gathers for Ashara Mubaraka at a location chosen by His Holiness Dr Syedna Mufaddal Saifuddin. This year the gathering is hosted in Surat. Thousands of mumineen travel from across the world, and the organising team needs a clear, easy-to-navigate website that centralises all Surat-specific information — schedules, accommodation, transport, food, and support — in one place.

The site must be accessible to international visitors (English only), mobile-friendly, and fast to deploy. ITS OneLogin SSO will be integrated in a future phase once credentials are received from the ITS team.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | TanStack Start (SSR + API routes) |
| Database & Auth | Supabase (Postgres, Realtime, Storage) |
| AI / Chatbot | Provider-agnostic via `LLM_BASE_URL` env var (OpenRouter / Ollama / z.ai) |
| Language | TypeScript |
| Deployment | Vercel or Netlify |
| Styling | TailwindCSS |

---

## Visual Style

**Warm Ivory & Burgundy** — heritage feel, warm and inviting.

- Background: cream/ivory (`#fdf6ec`)
- Primary accent: deep burgundy (`#7c2d42`)
- Secondary: muted rose (`#9a3952`)
- Typography: elegant serif headings, clean sans-serif body
- Homepage features an event countdown timer

---

## Site Structure

```
/ (Home)              — countdown timer, quick-access module cards, pinned announcements
/schedule             — Waaz timings, daily Majlis schedule
/venue                — Masjid/Imambara locations, interactive Surat map, zone layouts
/accommodation        — Building listings, zones, check-in/out info
/transport            — Bus routes, shuttle timings, airport pickup, parking
/food                 — FMB info, meal zones, serving times
/volunteer            — Volunteer signup form, duty info
/announcements        — Real-time notices (Supabase Realtime)
/gallery              — Event and city photos
/documents            — Downloadable guides, maps, forms
/about-surat          — City guide: hospitals, pharmacies, landmarks, emergency contacts (static content, no CMS needed)
/helpdesk             — AI chat widget + ticket escalation
/admin                — Protected route group (organiser CMS)
  /admin/announcements
  /admin/schedule
  /admin/tickets
/auth/callback        — ITS OneLogin callback placeholder (inactive until flag enabled)
```

**Auth gating:** All routes are public. A feature flag `ITS_AUTH_ENABLED=true` will activate login walls on `/accommodation`, `/transport`, `/food`, and `/volunteer` in the future phase.

---

## Supabase Data Model

### Content (managed via Admin CMS)
```sql
announcements    (id, title, body, category, pinned, published_at)
schedule_events  (id, day, time, title, description, location)
documents        (id, name, category, file_url, uploaded_at)
gallery_images   (id, url, caption, event_tag, uploaded_at)
```

### Operational (managed via Supabase Studio)
```sql
accommodation    (id, building, zone, floor, capacity, contact_person)
transport_routes (id, route_name, stops, timings, notes)
food_zones       (id, zone_name, location, serving_times, capacity)
volunteer_signups(id, name, its_id, phone, email, role, zone, status)
```

### AI Helpdesk
```sql
chat_sessions    (id, contact_name, contact_phone, contact_email, contact_whatsapp, status, created_at)
chat_messages    (id, session_id, role, content, created_at)
support_tickets  (id, session_id, summary, escalation_channel, escalated_at, resolved_at)
```

**Supabase Realtime** enabled on `announcements` for live push to all visitors.
**Storage buckets:** `gallery`, `documents`.

---

## AI Helpdesk Chat

### Flow
1. Guest opens floating chat widget (available on all pages)
2. Bot collects **Name + Phone/WhatsApp + Email** before Q&A begins
3. LLM answers questions using a system prompt loaded with site content (schedule, zones, FAQs)
4. A persistent **"Still need help? Contact Helpdesk"** button is always visible — no per-message satisfaction prompts
5. **Rate limit: 5 messages per hour per session** (configurable via `CHAT_RATE_LIMIT` env var). Tracked via session cookie ID — `chat_sessions` stores `message_count` and `window_started_at`; count resets after 1 hour. On limit, input is disabled and helpdesk button is highlighted
6. If guest taps "Contact Helpdesk": they pick Email or WhatsApp → ticket created with full transcript
7. Volunteer team follows up on chosen channel → admin marks ticket resolved

### LLM Abstraction (`lib/llm.ts`)
```typescript
// Configured via env vars — swap provider without code changes
LLM_BASE_URL=https://openrouter.ai/api/v1   // or Ollama endpoint or z.ai
LLM_API_KEY=...
LLM_MODEL=...
```
Uses OpenAI-compatible chat completions API (all three providers support this).

---

## Admin Panel (`/admin`)

Protected by Supabase email/password auth. Admin users have a `role = 'admin'` column on their Supabase profile. No dependency on ITS auth — organisers are provisioned manually in Supabase.

| Section | What organisers can do |
|---|---|
| Announcements | Create, edit, pin, unpublish notices |
| Schedule | Add/edit Waaz timings and daily events |
| Tickets | View open helpdesk tickets, mark resolved |

All other data (accommodation, transport, food, volunteers) managed directly via Supabase Studio.

---

## ITS OneLogin — Future Integration

Reference: `OneLogin_Guide.pdf`

- **Callback URL:** `https://asharasurat.com/auth/callback`
- **Decryption:** `OneLogin_Decrypt(PassKey, DataString)` — server-side only, PassKey from ITS team
- **User data returned:** ITSID, Name, Gender, Age, Jamaat, Jamiaat, JamiaatID
- **Session storage:** Decrypted user stored in Supabase session after validation
- **Activation:** Set `ITS_AUTH_ENABLED=true` in env — route guards activate on the 4 member modules
- **Registration requirement:** Logo (256×256px PNG, transparent, <100KB), description (<200 chars), callback URL, in-charge ITS ID

---

## Verification Plan

1. `pnpm dev` — all 12 public routes render without errors
2. Announcements page shows live updates when a record is inserted in Supabase (Realtime test)
3. Helpdesk: contact info collected → AI responds → rate limit triggers after 5 msgs → ticket created on escalation
4. Admin panel accessible only to authenticated organiser role
5. `ITS_AUTH_ENABLED=false` → all routes public; `=true` → member module routes redirect to ITS login
6. Mobile responsive check across all module pages
