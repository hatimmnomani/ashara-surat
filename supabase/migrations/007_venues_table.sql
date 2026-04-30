create table venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  zone text,
  address text,
  map_url text,
  description text,
  sort_order int default 0,
  created_at timestamptz default now()
);

alter table venues enable row level security;
create policy "public_read" on venues for select using (true);
