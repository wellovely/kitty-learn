# Kitty Learn

Interactive learning for children in a game-style journey: lessons, XP, streaks, badges, and an AI kitten companion. Parents track progress and get real-time in-app notifications.

## Overview

| Role | Features |
|------|----------|
| **Child** | Unit roadmap, lessons with exercises, voice, kitten chat |
| **Parent** | Children, dashboard, analytics, in-app notifications (achievements, lessons, streak) |
| **Admin** | Content (`/units`, `/lessons`), users (`/users`) |

**Gamification:** lesson stars, XP, levels, streaks, badges — see [Gamification](#gamification-xp-streak-badges).

**AI:** hints, answer evaluation, TTS, transcription (OpenRouter + Deepgram).

**Notifications:** rows in Supabase on events + Supabase Realtime → parent toast; cron for streak-at-risk and weekly summary.

## Gamification (XP, streak, badges)

All rules run **on the server** when a lesson finishes (`POST /api/progress/submit` → [`submit-progress.ts`](apps/web/lib/services/submit-progress.ts)). Pure helpers live in [`progress.ts`](apps/web/lib/services/progress.ts) and [`gamification.ts`](apps/web/lib/services/gamification.ts).

### Where state lives (Postgres / Supabase)

| Data | Table | Notes |
|------|--------|--------|
| Per-lesson result | `progress` | `stars` (0–3), `xp_earned`, `completed_at`, one row per `(child_id, lesson_id)` |
| Totals & streak | `child_stats` | `total_xp`, `level`, `streak_days`, `last_active_on` (UTC date) |
| Badge catalog | `badges` | Seeded in [`0001_init.sql`](supabase/migrations/0001_init.sql) (`code`, `title`, `icon`) |
| Earned badges | `child_badges` | `(child_id, badge_id)` — written when a badge is newly awarded |

### XP & level

1. **Stars** from lesson score: `calculateStars(correct, total)` — 0–3 stars by accuracy thresholds (50% / 75% / 95%).
2. **XP for this attempt:** `calculateXp(stars, firstTime)` — `stars × 10`, plus **+5** bonus on first completion of that lesson.
3. **Persist:** upsert `progress`, add XP to `child_stats.total_xp`.
4. **Level:** `xpToLevel(total_xp)` → `floor(total_xp / 100) + 1` (min 1), stored in `child_stats.level`.

### Streak (daily mode)

Updated in the same submit flow via `updateStreak(last_active_on, today, streak_days)`:

- First activity ever → streak `1`.
- Already active **today** → streak unchanged (still ≥ 1).
- Last active **yesterday** → `streak_days + 1`.
- Otherwise → reset to `1`.

`last_active_on` and `streak_days` are saved on `child_stats`. A nightly cron ([`streak-risk`](apps/web/app/api/cron/streak-risk/route.ts)) notifies parents if `streak_days ≥ 1` but there was no activity today.

### Badges

After stats update, `computeEarnedBadges()` checks rules (skipping codes already in `child_badges`):

| Code | Condition |
|------|-----------|
| `first_lesson` | First lesson ever completed |
| `perfect_stars` | 3 stars on this lesson |
| `streak_3` / `streak_7` | `streak_days ≥ 3` / `≥ 7` |
| `xp_100` / `xp_500` | `total_xp ≥ 100` / `≥ 500` |

New badges are inserted into `child_badges`; parents get `achievement` notifications via [`notifications.ts`](apps/web/lib/services/notifications.ts).

## Stack

- **Frontend:** Next.js 16, React 19, Tailwind, shadcn/ui (`packages/ui`)
- **Backend:** Supabase (Auth, Postgres, RLS, Realtime)
- **Monorepo:** Turborepo, Bun
- **Deploy:** Vercel (`apps/web`), GitHub Actions (CI)

## Repository structure

```
kitty-learn/
├── apps/web/          # Next.js app
├── packages/ui/       # shared UI components
├── supabase/          # migrations & local Supabase
└── .github/workflows/ # CI
```

## Quick start

**Requirements:** Node ≥ 20, [Bun](https://bun.sh), [Supabase CLI](https://supabase.com/docs/guides/cli).

```bash
# dependencies
bun install

# local database (from repo root)
supabase start
supabase db reset   # applies migrations

# env — .env at repo root
cp .env.example .env

# dev server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

**`.env` at the repo root** (loaded by `apps/web/next.config.mjs`):

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL — Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **anon (public)** key — not the service role |
| `SUPABASE_SERVICE_ROLE_KEY` | server only (notifications, cron, admin ops) |
| `OPENROUTER_API_KEY` | AI |
| `DEEPGRAM_API_KEY` | voice |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` locally |
| `CRON_SECRET` | optional, for `/api/cron/*` on Vercel |

After `supabase start`, URL and keys are in the CLI output or Studio.

### Roles

- Sign-up creates a profile with role **`parent`**.
- **Admin:** set `role = 'admin'` on `profiles`, then open [http://localhost:3000/units](http://localhost:3000/units).

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | dev (web on :3000) |
| `bun run build` | production build |
| `bun run lint` / `typecheck` | monorepo checks |
| `bun --cwd apps/web run test` | unit tests (Vitest) |
| `bun --cwd apps/web run test:e2e` | E2E (Playwright) |

API docs in dev: [http://localhost:3000/api-docs](http://localhost:3000/api-docs).

## Deploy (Vercel)

1. Import the repo in Vercel, **Root Directory:** `apps/web`.
2. Add environment variables (see table above; `CRON_SECRET` for cron).
3. In Supabase → **Authentication → URL configuration** — add production URL and redirect URLs.

Cron (`apps/web/vercel.json`): streak-risk daily, weekly-summary on Sundays.

Remote migrations: `supabase link` → `supabase db push`.

## CI

On `main` / PR: lint, typecheck, tests, build (see `.github/workflows/ci.yml`).

---

*Kitty Learn — a small app for kids to learn and parents to stay in the loop.*
