# Mridul Gulati: Portfolio and Agent Catalogue

Personal portfolio that doubles as a browsable catalogue of AI agents with video demos,
funnelling to a contact form for freelance and contract work.

## Stack

- **Next.js 15** (App Router, JavaScript) + **Tailwind CSS v4** + **Framer Motion**
- **Supabase**: Postgres, Auth (owner-only magic link), Storage
- **Resend**: contact-form email notifications
- **Vercel**: hosting (free tier) and the daily keep-alive cron

## Local setup

```bash
npm install
cp .env.example .env.local   # fill in the values
npm run dev
```

Apply the SQL files in `supabase/migrations/` in order: paste each into the Supabase SQL Editor
(Dashboard > SQL Editor > New query) and run it.

## Environment variables

See `.env.example`. Anything prefixed `NEXT_PUBLIC_` ships to the browser; everything else is
server-only. `src/lib/supabase/admin.js` (service role) imports `server-only`, so the build fails
if it is ever imported from client code.

## Keep-alive job (do not delete)

Supabase pauses free projects after a period of inactivity. `vercel.json` schedules a daily cron
that calls `/api/keep-alive`, which writes a timestamp to the `heartbeat` table. The route
rejects requests that lack `Authorization: Bearer $CRON_SECRET` (Vercel adds this header itself).

Check it is working: `GET /api/health` returns the last keep-alive time using the public anon key.

## Project layout

```
src/app/            routes (App Router)
src/app/api/        route handlers (keep-alive, health)
src/lib/supabase/   browser, server (cookie-aware) and service-role clients
supabase/migrations SQL schema, applied manually in order
```

## Branches

`main` is what Vercel deploys. Build features on `feat/*` branches and merge via pull request.
