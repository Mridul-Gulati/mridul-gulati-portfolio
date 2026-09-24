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

## Updating the resume

`src/data/resume.js` is the single source for `/resume`, the About page and the PDF. After editing it,
run the site locally (`npm run dev`), then `npm run resume:pdf` to regenerate
`public/Mridul_Gulati_Resume.pdf` from the page with headless Chrome. Commit both together.

## Contact pipeline

`/contact` posts to a server action (`src/app/contact/actions.js`) that validates input, drops
honeypot hits, rate-limits by salted IP hash (3 per hour), inserts into `contact_submissions` with
the service role, then emails `OWNER_EMAIL` via Resend. The table has RLS on with no public
policies. Until a domain is verified in Resend, mail is sent from `onboarding@resend.dev` and can
only be delivered to the address the Resend account was created with.

## Agent catalogue

Agents live in the `agents` table. Until the admin console exists, edit them in Supabase's Table
Editor: set `youtube_id` (the 11-character id of an unlisted video) once a demo is recorded, and
`published = true` to show the agent. `/projects` refreshes within a minute, the home page within
five. Badges ("Newly added", "Most liked") and `hearts_count` are derived automatically.

Hearts are one per visitor per agent: the server issues a random httpOnly `vid` cookie and stores
only its salted hash, with a per-IP hourly cap. Opening a demo counts one view per session.
`/projects?agent=<slug>` opens that agent's demo directly.

## Project layout

```
src/app/            routes (App Router)
src/app/api/        route handlers (keep-alive, health)
src/components/     shared UI: layout primitives, header, footer, theme toggle, icons
src/data/           site content: nav, resume, testimonials
src/lib/            Supabase clients, visitor hashing
scripts/            resume PDF generator
supabase/migrations SQL schema, applied manually in order
```

## Branches

`main` is what Vercel deploys. Build features on `feat/*` branches and merge via pull request.
