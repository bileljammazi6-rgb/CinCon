-- Run this SQL in Supabase SQL Editor for your project
-- Schema for community chat, rooms, messages, invites, and users

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  username text unique not null,
  full_name text null,
  avatar_url text null,
  created_at timestamptz not null default now()
);

create table if not exists public.rooms (
  id text primary key,
  name text not null,
  type text not null check (type in ('dm','group','game','movie','global')),
  created_at timestamptz not null default now()
);

create table if not exists public.room_members (
  room_id text references public.rooms(id) on delete cascade,
  user_id text not null,
  role text not null default 'member',
  primary key (room_id, user_id)
);

create table if not exists public.messages (
  id bigserial primary key,
  room_id text not null references public.rooms(id) on delete cascade,
  sender text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_room_created_idx on public.messages(room_id, created_at);

create table if not exists public.invites (
  id bigserial primary key,
  type text not null check (type in ('game','movie')),
  from_user text not null,
  to_user text not null,
  room_id text null references public.rooms(id) on delete set null,
  payload jsonb null,
  status text not null default 'pending' check (status in ('pending','accepted','declined','cancelled')),
  created_at timestamptz not null default now()
);

-- Seed a global room if missing
insert into public.rooms(id, name, type)
  values ('global', 'Global Chat', 'global')
  on conflict (id) do nothing;

-- Optional: enable Realtime on messages table (toggle in Supabase: Database > Replication > Realtime)
-- Security: For quick testing you can disable RLS (not recommended for production)
-- alter table public.messages disable row level security;
-- alter table public.invites disable row level security;
-- alter table public.rooms disable row level security;
-- alter table public.room_members disable row level security;