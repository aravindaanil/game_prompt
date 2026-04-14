# Idle Island MVP

A small browser MVP for testing an idle island/base game with a few friends. Players sign up, collect passive gold, upgrade one island track, trigger occasional async battles, and compare army power on a leaderboard.

## Stack

- React + Vite + TypeScript
- Supabase Auth
- Supabase Postgres with RLS
- Vercel-ready frontend

## Local Setup

1. Install Node.js 20 or newer.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy the environment example:

   ```bash
   cp .env.example .env
   ```

4. Fill in `.env`:

   ```bash
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

5. Start the app:

   ```bash
   npm run dev
   ```

## Supabase Setup

1. Create a new Supabase project.
2. Go to **Authentication > Providers > Email** and enable email/password.
3. For fastest friend testing, turn off email confirmations in **Authentication > Sign In / Providers**. You can turn confirmations back on later, but this MVP creates the player profile immediately after signup while the user has an active session.
4. Open **SQL Editor** and run the migrations in order:

   ```sql
   -- Paste the contents of supabase/migrations/001_idle_island_schema.sql
   -- Then paste the contents of supabase/migrations/002_manual_challenge_battles.sql
   ```

5. Copy your project URL and publishable key from **Project Settings > API** into `.env`.

## Game Rules

- New players start with 500 gold, level 1, 100 army power, stage 1, and 10 gold per minute.
- Passive income is calculated from `last_collected_at` using elapsed time on the database side.
- Upgrade cost is `100 * current_level`.
- Each upgrade adds 1 level, 20 army power, and 5 gold per minute.
- Island stages:
  - Stage 1: levels 1-4
  - Stage 2: levels 5-9
  - Stage 3: levels 10-14
  - Stage 4: levels 15+
- Auto-battle can trigger when opening the dashboard if 30 minutes have passed since the player's last battle.
- Manual challenges can be started from the leaderboard. They resolve instantly in the arena and reward the winner with 75 gold.
- Battles pick a random other player. Score is `army_power + random(0..30)`.
- Winner gains 50 gold. Loser loses nothing.

## Project Structure

```text
src/
  components/      Reusable UI panels and route guards
  hooks/           Session and dashboard data hooks
  lib/             Supabase client and reusable game math
  pages/           Login, signup, dashboard routes
  services/        Auth and game data calls
  types/           Shared game TypeScript types
supabase/
  migrations/      SQL schema, RLS, views, and RPC functions
```

## Vercel Deployment

1. Push this project to a Git repository.
2. Import it in Vercel.
3. Set the environment variables in Vercel:

   ```text
   VITE_SUPABASE_URL
   VITE_SUPABASE_PUBLISHABLE_KEY
   ```

4. Use the default Vite settings:
   - Build command: `npm run build`
   - Output directory: `dist`
5. Deploy.

## Useful Commands

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## MVP Notes

This intentionally avoids chat, clans, live combat, complex strategy, and mobile app packaging. The current shape is built for 5-20 testers and keeps the extension points clear: add more upgrade tracks, richer battle formulas, or timed events later without replacing the core auth/data flow.

## Updating Supabase After Manual Battles

If your database already has `001_idle_island_schema.sql`, also run:

```sql
-- Paste the contents of supabase/migrations/002_manual_challenge_battles.sql
```

Then run:

```sql
notify pgrst, 'reload schema';
```
