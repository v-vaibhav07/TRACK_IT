-- =============================================================
-- DSA Tracker — Migration 002: Recurring Tasks
-- =============================================================
-- Run this in Supabase SQL Editor if you already ran the original
-- schema.sql and just want to add "repeat daily" task support.
-- (If you're setting up a brand-new project, schema.sql already
-- includes everything in this file — just run schema.sql instead.)
-- =============================================================

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

drop trigger if exists trg_recurring_tasks_updated_at on public.recurring_tasks;
create trigger trg_recurring_tasks_updated_at
  before update on public.recurring_tasks
  for each row execute function public.set_updated_at();

alter table public.recurring_tasks enable row level security;

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

-- -------------------------------------------------------------
-- Link daily_tasks occurrences back to the template that spawned
-- them. ON DELETE SET NULL: stopping/deleting a recurring template
-- never deletes history — past occurrences just become standalone
-- tasks, preserving completed-day streak history.
-- -------------------------------------------------------------
alter table public.daily_tasks
  add column if not exists recurring_task_id uuid references public.recurring_tasks (id) on delete set null;

create index if not exists idx_daily_tasks_recurring_task_id on public.daily_tasks (recurring_task_id);

-- One occurrence per template per day.
create unique index if not exists uq_daily_tasks_recurring_occurrence
  on public.daily_tasks (recurring_task_id, task_date)
  where recurring_task_id is not null;

-- =============================================================
-- Done.
-- =============================================================
