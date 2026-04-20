create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'viewer'
);

-- After creating admin user in Supabase Auth dashboard, run:
-- insert into profiles (id, role) values ('<user-uuid>', 'admin');
