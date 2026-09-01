-- =============================================================
-- DSA Tracker — Supabase Schema
-- =============================================================
-- Run this entire file once in Supabase SQL Editor
-- (Project -> SQL Editor -> New Query -> paste -> Run).
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE / DROP ... IF EXISTS
-- guards wherever practical.
-- =============================================================

-- Required for gen_random_uuid()
create extension if not exists "pgcrypto";

-- =============================================================
-- 1. TABLES
-- =============================================================

-- -------------------------------------------------------------
-- profiles: one row per authenticated user
-- -------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  username text unique,
  avatar_url text,
  timezone text not null default 'Asia/Kolkata',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -------------------------------------------------------------
-- daily_tasks: tasks a user plans/completes for a given date
-- -------------------------------------------------------------
create table if not exists public.daily_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  task_date date not null,
  title text not null,
  description text,
  category text,
  difficulty text check (difficulty in ('Easy', 'Medium', 'Hard') or difficulty is null),
  completed boolean not null default false,
  completed_at timestamptz,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_daily_tasks_user_id on public.daily_tasks (user_id);
create index if not exists idx_daily_tasks_task_date on public.daily_tasks (task_date);
create index if not exists idx_daily_tasks_user_date on public.daily_tasks (user_id, task_date);

-- -------------------------------------------------------------
-- recurring_tasks: templates that auto-generate a daily_tasks
-- occurrence for every day (from start_date onward) the user
-- visits, until the template is stopped (deleted).
-- -------------------------------------------------------------
create table if not exists public.recurring_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  category text,
  difficulty text check (difficulty in ('Easy', 'Medium', 'Hard') or difficulty is null),
  start_date date not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_recurring_tasks_user_id on public.recurring_tasks (user_id);
create index if not exists idx_recurring_tasks_active on public.recurring_tasks (user_id, is_active);

-- Link daily_tasks occurrences back to the template that spawned them.
-- ON DELETE SET NULL: stopping/deleting a recurring template never
-- deletes history — past occurrences just become standalone tasks,
-- preserving completed-day streak history.
alter table public.daily_tasks
  add column if not exists recurring_task_id uuid references public.recurring_tasks (id) on delete set null;

create index if not exists idx_daily_tasks_recurring_task_id on public.daily_tasks (recurring_task_id);

-- One occurrence per template per day.
create unique index if not exists uq_daily_tasks_recurring_occurrence
  on public.daily_tasks (recurring_task_id, task_date)
  where recurring_task_id is not null;

-- -------------------------------------------------------------
-- daily_notes: one freeform note per user per date
-- -------------------------------------------------------------
create table if not exists public.daily_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  note_date date not null,
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, note_date)
);

create index if not exists idx_daily_notes_user_id on public.daily_notes (user_id);
create index if not exists idx_daily_notes_note_date on public.daily_notes (note_date);

-- -------------------------------------------------------------
-- daily_activity: rolled-up per-day stats, powers streak + calendar
-- -------------------------------------------------------------
create table if not exists public.daily_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  activity_date date not null,
  tasks_total integer not null default 0,
  tasks_completed integer not null default 0,
  completion_rate numeric not null default 0,
  had_activity boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, activity_date)
);

create index if not exists idx_daily_activity_user_id on public.daily_activity (user_id);
create index if not exists idx_daily_activity_date on public.daily_activity (activity_date);
create index if not exists idx_daily_activity_user_date on public.daily_activity (user_id, activity_date);

-- =============================================================
-- 2. updated_at TRIGGER FUNCTION (shared)
-- =============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_daily_tasks_updated_at on public.daily_tasks;
create trigger trg_daily_tasks_updated_at
  before update on public.daily_tasks
  for each row execute function public.set_updated_at();

drop trigger if exists trg_daily_notes_updated_at on public.daily_notes;
create trigger trg_daily_notes_updated_at
  before update on public.daily_notes
  for each row execute function public.set_updated_at();

drop trigger if exists trg_daily_activity_updated_at on public.daily_activity;
create trigger trg_daily_activity_updated_at
  before update on public.daily_activity
  for each row execute function public.set_updated_at();

drop trigger if exists trg_recurring_tasks_updated_at on public.recurring_tasks;
create trigger trg_recurring_tasks_updated_at
  before update on public.recurring_tasks
  for each row execute function public.set_updated_at();

-- =============================================================
-- 3. AUTO-CREATE PROFILE ON SIGNUP
-- =============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'username', null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================
-- 4. DASHBOARD HELPER FUNCTION
-- =============================================================
-- Upserts today's (or any date's) activity roll-up for the current user.
-- Called from the client after any task mutation.
create or replace function public.recalculate_daily_activity(p_date date)
returns public.daily_activity
language plpgsql
security invoker
as $$
declare
  v_total integer;
  v_completed integer;
  v_rate numeric;
  v_row public.daily_activity;
begin
  select count(*), count(*) filter (where completed)
    into v_total, v_completed
    from public.daily_tasks
    where user_id = auth.uid() and task_date = p_date;

  v_rate := case when v_total > 0 then round((v_completed::numeric / v_total::numeric) * 100, 2) else 0 end;

  insert into public.daily_activity (user_id, activity_date, tasks_total, tasks_completed, completion_rate, had_activity)
  values (auth.uid(), p_date, v_total, v_completed, v_rate, v_total > 0)
  on conflict (user_id, activity_date)
  do update set
    tasks_total = excluded.tasks_total,
    tasks_completed = excluded.tasks_completed,
    completion_rate = excluded.completion_rate,
    had_activity = excluded.had_activity,
    updated_at = now()
  returning * into v_row;

  return v_row;
end;
$$;

-- =============================================================
-- 5. ROW LEVEL SECURITY
-- =============================================================

alter table public.profiles enable row level security;
alter table public.daily_tasks enable row level security;
alter table public.daily_notes enable row level security;
alter table public.daily_activity enable row level security;
alter table public.recurring_tasks enable row level security;

-- ---------------- profiles ----------------
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---------------- daily_tasks ----------------
drop policy if exists "daily_tasks_select_own" on public.daily_tasks;
create policy "daily_tasks_select_own"
  on public.daily_tasks for select
  using (auth.uid() = user_id);

drop policy if exists "daily_tasks_insert_own" on public.daily_tasks;
create policy "daily_tasks_insert_own"
  on public.daily_tasks for insert
  with check (auth.uid() = user_id);

drop policy if exists "daily_tasks_update_own" on public.daily_tasks;
create policy "daily_tasks_update_own"
  on public.daily_tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "daily_tasks_delete_own" on public.daily_tasks;
create policy "daily_tasks_delete_own"
  on public.daily_tasks for delete
  using (auth.uid() = user_id);

-- ---------------- daily_notes ----------------
drop policy if exists "daily_notes_select_own" on public.daily_notes;
create policy "daily_notes_select_own"
  on public.daily_notes for select
  using (auth.uid() = user_id);

drop policy if exists "daily_notes_insert_own" on public.daily_notes;
create policy "daily_notes_insert_own"
  on public.daily_notes for insert
  with check (auth.uid() = user_id);

drop policy if exists "daily_notes_update_own" on public.daily_notes;
create policy "daily_notes_update_own"
  on public.daily_notes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "daily_notes_delete_own" on public.daily_notes;
create policy "daily_notes_delete_own"
  on public.daily_notes for delete
  using (auth.uid() = user_id);

-- ---------------- daily_activity ----------------
drop policy if exists "daily_activity_select_own" on public.daily_activity;
create policy "daily_activity_select_own"
  on public.daily_activity for select
  using (auth.uid() = user_id);

drop policy if exists "daily_activity_insert_own" on public.daily_activity;
create policy "daily_activity_insert_own"
  on public.daily_activity for insert
  with check (auth.uid() = user_id);

drop policy if exists "daily_activity_update_own" on public.daily_activity;
create policy "daily_activity_update_own"
  on public.daily_activity for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------- recurring_tasks ----------------
drop policy if exists "recurring_tasks_select_own" on public.recurring_tasks;
create policy "recurring_tasks_select_own"
  on public.recurring_tasks for select
  using (auth.uid() = user_id);

drop policy if exists "recurring_tasks_insert_own" on public.recurring_tasks;
create policy "recurring_tasks_insert_own"
  on public.recurring_tasks for insert
  with check (auth.uid() = user_id);

drop policy if exists "recurring_tasks_update_own" on public.recurring_tasks;
create policy "recurring_tasks_update_own"
  on public.recurring_tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "recurring_tasks_delete_own" on public.recurring_tasks;
create policy "recurring_tasks_delete_own"
  on public.recurring_tasks for delete
  using (auth.uid() = user_id);

-- =============================================================
-- Done. See README.md "Database setup" for how to run this file.
-- =============================================================
