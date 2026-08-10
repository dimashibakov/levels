-- LEVELS · alpha schema (single user). RLS is on for schema hygiene, not
-- because we defend against others yet. Coordinator queue, aggregate rollups
-- and k-anonymity are PRODUCTION concerns — deliberately omitted here.

create extension if not exists pgcrypto;

-- minimal profile: no name, no email required
create table if not exists profiles (
  id            uuid primary key references auth.users on delete cascade,
  locale        text not null default 'en',
  crisis_region text not null default 'US',   -- US → 988; else set by user
  cadence       text not null default 'none',
  created_at    timestamptz not null default now()
);

-- one completed check + its result
create table if not exists check_sessions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users on delete cascade,
  instrument_version  text not null,
  phq_sum             int,
  safety_flag         boolean not null default false,
  tier                text check (tier in ('in_level','off_level','edge')),
  started_at          timestamptz not null default now(),
  completed_at        timestamptz
);

-- item-level answers (most sensitive class)
create table if not exists check_responses (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references check_sessions on delete cascade,
  user_id    uuid not null references auth.users on delete cascade,
  item_code  text not null,
  score      int not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_sessions_user   on check_sessions (user_id, started_at desc);
create index if not exists idx_responses_session on check_responses (session_id);

alter table profiles        enable row level security;
alter table check_sessions  enable row level security;
alter table check_responses enable row level security;

-- every row belongs to auth.uid()
create policy "own profile"   on profiles        for all using (id = auth.uid())      with check (id = auth.uid());
create policy "own sessions"  on check_sessions  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own responses" on check_responses for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- auto-create profile row on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
