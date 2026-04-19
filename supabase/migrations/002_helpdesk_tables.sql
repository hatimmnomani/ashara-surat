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
