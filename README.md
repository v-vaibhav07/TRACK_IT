# DSA Tracker

A personal DSA (Data Structures & Algorithms) consistency tracker — a real, working SaaS dashboard with Supabase auth, a Postgres database, daily task tracking, streaks, a monthly consistency calendar, and daily notes.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Supabase (Auth + Postgres + Row Level Security)
- React Router
- Lucide icons

## 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** in your project dashboard.
3. Paste the entire contents of [`supabase/schema.sql`](./supabase/schema.sql) and click **Run**.
   This creates all tables (`profiles`, `daily_tasks`, `daily_notes`, `daily_activity`), triggers (auto-profile-on-signup, `updated_at` maintenance), the `recalculate_daily_activity()` helper function, and Row Level Security policies that restrict every table to `auth.uid()`.
4. Go to **Project Settings → API** and copy your **Project URL** and **anon public key**.

## 2. Configure environment variables

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Never put your `service_role` key here or anywhere in frontend code — RLS policies (enforced via `auth.uid()`) are what keep each user's data private, and the anon key is safe to expose in the browser by design.

## 3. Install & run

```bash
npm install
npm run dev
```

Open the printed local URL (typically `http://localhost:5173`).

## 4. Build for production

```bash
npm run build
npm run preview   # optional local preview of the production build
```

## How it works

- **Auth** — Supabase Auth handles signup/login/logout/password reset. On signup, a Postgres trigger (`handle_new_user`) automatically creates a matching row in `profiles`.
- **Tasks** — Each task belongs to a `task_date`. Checking a task off updates `daily_tasks.completed` / `completed_at`, then calls the `recalculate_daily_activity` Postgres function (via RPC) to roll that day's totals into `daily_activity`.
- **Recurring tasks** — Checking "Repeat daily" when adding a task creates a `recurring_tasks` template. Every time the user opens (or navigates to) a day on/after the template's start date, a concrete `daily_tasks` occurrence is lazily created for that day if one doesn't exist yet (`materializeRecurringOccurrences` in `taskService.ts`). Each occurrence is independently completable and deletable. "Stop repeating" deletes the template (`ON DELETE SET NULL` on `daily_tasks.recurring_task_id`), which stops future occurrences from being generated while leaving all past occurrences — and the streak history they represent — untouched.
- **Streaks** — Computed client-side (`src/lib/streakUtils.ts`) from the `daily_activity` roll-up: a day "counts" when every planned task for that day was completed. Today being incomplete never breaks yesterday's streak — the streak is calculated by walking backward and only starting from today if today is already fully complete.
- **Monthly calendar** — Renders a Monday-first grid for the selected month, colored by each day's `daily_activity` status (none / partial / complete), sourced from a single ranged query.
- **Notes** — One `daily_notes` row per user per date, autosaved with an 800ms debounce (no request-per-keystroke).
- **Security** — Every table has RLS enabled; every policy checks `auth.uid() = user_id` (or `= id` for `profiles`). The frontend never trusts a client-supplied `user_id` — Postgres enforces it.

## Project structure

```
src/
  components/{auth,dashboard,ui}/   Reusable UI pieces
  pages/                            Route-level pages (Login, Register, Dashboard, ...)
  layouts/                          AuthLayout, DashboardLayout
  hooks/                            useAuth, useTasks, useNotes, useActivity, useToast
  lib/                              dateUtils, streakUtils, dashboardUtils
  services/                        Thin Supabase query wrappers
  types/                           Database + dashboard TypeScript types
  routes/                          ProtectedRoute / GuestOnlyRoute
supabase/
  schema.sql                       Full DB schema, triggers, RLS, and helper function
  migrations/
    002_recurring_tasks.sql        Additive migration for existing databases (adds recurring tasks)
```

### If you already deployed the database

If you ran `schema.sql` before recurring tasks were added, run `supabase/migrations/002_recurring_tasks.sql` once in the Supabase SQL Editor to add the `recurring_tasks` table and the `recurring_task_id` column on `daily_tasks` — it won't touch any existing data. New projects can just run the (already-updated) `schema.sql` and skip this.

## Notes on the current scope

This build intentionally focuses on one excellent, fully-wired Dashboard page (tasks, notes, streaks, calendar, recent activity) rather than a broader app surface (no Problems bank, Analytics, Leaderboard, or Profile pages yet). The architecture (hooks/services/types split) is set up to make adding those straightforward later.
