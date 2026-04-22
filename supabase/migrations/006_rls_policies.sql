-- Enable RLS on all tables
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

-- Public read access for content tables (anon + authenticated)
create policy "public_read" on announcements for select using (true);
create policy "public_read" on schedule_events for select using (true);
create policy "public_read" on documents for select using (true);
create policy "public_read" on gallery_images for select using (true);
create policy "public_read" on accommodation for select using (true);
create policy "public_read" on transport_routes for select using (true);
create policy "public_read" on food_zones for select using (true);

-- Volunteer signups: anyone can insert, only service_role can read
create policy "public_insert" on volunteer_signups for insert with check (true);

-- Chat: service_role (admin server) handles all operations via supabaseAdmin
-- No anon access needed; server functions use service_role key which bypasses RLS
