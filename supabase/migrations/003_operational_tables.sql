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
