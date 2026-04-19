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
