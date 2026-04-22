-- Idempotent full schema — safe to run multiple times in Supabase SQL editor

-- ============================================================
-- 001: Content tables
-- ============================================================
create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  category text,
  pinned boolean default false,
  published_at timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists schedule_events (
  id uuid primary key default gen_random_uuid(),
  day int not null,
  event_time time not null,
  title text not null,
  description text,
  location text,
  created_at timestamptz default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  file_url text not null,
  r2_key text,
  uploaded_at timestamptz default now()
);

create table if not exists gallery_images (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  caption text,
  event_tag text,
  r2_key text,
  uploaded_at timestamptz default now()
);

-- Backfill r2_key columns in case tables existed before migration 005
alter table documents add column if not exists r2_key text;
alter table gallery_images add column if not exists r2_key text;

-- ============================================================
-- 002: Helpdesk tables
-- ============================================================
create table if not exists chat_sessions (
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

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references chat_sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

create table if not exists support_tickets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references chat_sessions(id),
  summary text,
  escalation_channel text check (escalation_channel in ('email', 'whatsapp')),
  escalated_at timestamptz default now(),
  resolved_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================================
-- 003: Operational tables
-- ============================================================
create table if not exists accommodation (
  id uuid primary key default gen_random_uuid(),
  building text not null,
  zone text,
  floor text,
  capacity int,
  contact_person text,
  created_at timestamptz default now()
);

create table if not exists transport_routes (
  id uuid primary key default gen_random_uuid(),
  route_name text not null,
  stops text[],
  timings text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists food_zones (
  id uuid primary key default gen_random_uuid(),
  zone_name text not null,
  location text,
  serving_times text,
  capacity int,
  created_at timestamptz default now()
);

create table if not exists volunteer_signups (
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

-- ============================================================
-- 004: Admin profiles
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'viewer'
);

-- ============================================================
-- 005: RLS — enable (idempotent)
-- ============================================================
alter table announcements enable row level security;
alter table schedule_events enable row level security;
alter table documents enable row level security;
alter table gallery_images enable row level security;
alter table accommodation enable row level security;
alter table transport_routes enable row level security;
alter table food_zones enable row level security;
alter table volunteer_signups enable row level security;
alter table chat_sessions enable row level security;
alter table chat_messages enable row level security;
alter table support_tickets enable row level security;
alter table profiles enable row level security;

-- ============================================================
-- 006: RLS policies (drop-then-create for idempotency)
-- ============================================================

-- Announcements
drop policy if exists "public_read" on announcements;
create policy "public_read" on announcements for select using (true);

drop policy if exists "admin_write" on announcements;
create policy "admin_write" on announcements for all using (auth.role() = 'service_role');

-- Schedule events
drop policy if exists "public_read" on schedule_events;
create policy "public_read" on schedule_events for select using (true);

drop policy if exists "admin_write" on schedule_events;
create policy "admin_write" on schedule_events for all using (auth.role() = 'service_role');

-- Documents
drop policy if exists "public_read" on documents;
create policy "public_read" on documents for select using (true);

drop policy if exists "admin_write" on documents;
create policy "admin_write" on documents for all using (auth.role() = 'service_role');

-- Gallery images
drop policy if exists "public_read" on gallery_images;
create policy "public_read" on gallery_images for select using (true);

drop policy if exists "admin_write" on gallery_images;
create policy "admin_write" on gallery_images for all using (auth.role() = 'service_role');

-- Accommodation
drop policy if exists "public_read" on accommodation;
create policy "public_read" on accommodation for select using (true);

drop policy if exists "admin_write" on accommodation;
create policy "admin_write" on accommodation for all using (auth.role() = 'service_role');

-- Transport routes
drop policy if exists "public_read" on transport_routes;
create policy "public_read" on transport_routes for select using (true);

drop policy if exists "admin_write" on transport_routes;
create policy "admin_write" on transport_routes for all using (auth.role() = 'service_role');

-- Food zones
drop policy if exists "public_read" on food_zones;
create policy "public_read" on food_zones for select using (true);

drop policy if exists "admin_write" on food_zones;
create policy "admin_write" on food_zones for all using (auth.role() = 'service_role');

-- Volunteer signups: public insert, service_role reads
drop policy if exists "public_insert" on volunteer_signups;
create policy "public_insert" on volunteer_signups for insert with check (true);

drop policy if exists "admin_read" on volunteer_signups;
create policy "admin_read" on volunteer_signups for select using (auth.role() = 'service_role');

drop policy if exists "admin_write" on volunteer_signups;
create policy "admin_write" on volunteer_signups for all using (auth.role() = 'service_role');

-- Chat sessions: service_role only
drop policy if exists "service_role_all" on chat_sessions;
create policy "service_role_all" on chat_sessions for all using (auth.role() = 'service_role');

-- Chat messages: service_role only
drop policy if exists "service_role_all" on chat_messages;
create policy "service_role_all" on chat_messages for all using (auth.role() = 'service_role');

-- Support tickets: service_role only
drop policy if exists "service_role_all" on support_tickets;
create policy "service_role_all" on support_tickets for all using (auth.role() = 'service_role');

-- Profiles: users can read their own
drop policy if exists "own_profile" on profiles;
create policy "own_profile" on profiles for select using (auth.uid() = id);

drop policy if exists "service_role_all" on profiles;
create policy "service_role_all" on profiles for all using (auth.role() = 'service_role');

-- ============================================================
-- 007: Realtime (idempotent via DO block)
-- ============================================================
do $$
begin
  alter publication supabase_realtime add table announcements;
exception when duplicate_object then null;
end $$;
