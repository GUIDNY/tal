# טל ראופמן — DJ & Saxophone

Next.js 16 + Tailwind v4 site for Tal Raufman, with a Postgres (Neon, via Vercel)
backed booking system and admin dashboard.

## Run locally

```bash
npm install        # also runs `prisma generate` via postinstall
vercel env pull .env.local   # pulls DATABASE_URL, ADMIN_PASSWORD, etc. from Vercel
npm run dev
```

## Before launch — replace placeholders

Everything below lives in [`src/lib/site-config.ts`](src/lib/site-config.ts) and is
marked `TODO` there:

- Real WhatsApp number, phone, and email
- Real Instagram handle (TikTok/YouTube optional — leave blank to hide the link)
- Production domain (`siteConfig.url`, used for SEO/OG/sitemap)

## Media

- `public/tal/portraits/` — the 6 real photos of Tal, resized and renamed descriptively.
- `public/tal/video/` — real footage from `~/Desktop/טל/IMG_3566.MOV` (Tal playing
  sax inside a crowd at an event), transcoded with `ffmpeg` into a blurred-pillarbox
  16:9 treatment: `hero-720.mp4` (muted, ~9s loop, background) and `showreel.mp4`
  (full ~20s clip with audio, played in the showreel modal), plus `showreel-poster.jpg`.

## Booking system

- Public flow: the 7-step "בדיקת זמינות" form opens WhatsApp with a prefilled
  message (synchronously, so popup blockers don't kill it) **and** saves the lead
  to Postgres via `POST /api/bookings` in the background — this finds-or-creates
  a `Customer` by phone number and attaches a `lead`-status `Event` to it, so
  repeat inquiries land on the same customer record instead of duplicating them.
  Includes a honeypot field for basic spam protection.
- `GET /api/availability` — public, returns dates with a `tentative`/`confirmed`
  Event so the date step can show a soft warning (never a hard block — see
  original spec).
- Database: Neon Postgres, provisioned via `vercel install neon` and connected to
  the Vercel project. Schema lives in `prisma/schema.prisma` (`Customer`, `Event`).
  Run `npx prisma migrate dev` for schema changes.

## CRM / Admin dashboard — `/admin`

- Auth: single shared password (`ADMIN_PASSWORD` env var) → HMAC-signed session
  cookie (`ADMIN_SESSION_SECRET` env var), verified in `src/proxy.ts` (Next 16's
  successor to `middleware.ts`) for both `/admin/*` pages and `/api/admin/*` routes.
  It's one shared login — good enough for two people (Tal + manager) sharing one
  password; say the word if you'd rather have separate accounts. Both env vars
  were generated and pushed to Vercel (Production + Development) when this was
  built — check the Vercel dashboard's Environment Variables page for the
  current values, or generate new ones and update them there.
- **יומן (Calendar) tab**: month grid, click a day to see/add events. Adding an
  event lets you pick an existing customer, quick-create a new one, or just block
  the date with a title (no customer) — e.g. a personal day off. Event status
  (`lead` / `tentative` / `confirmed` / `completed` / `cancelled`) drives both the
  colored dot on the calendar and the public availability warning.
- **לקוחות (Customers) tab**: searchable customer list; click one to see contact
  info, editable notes, and their full event history. Customers are also created
  automatically from website inquiries (deduped by phone number).

To change the admin password: `vercel env rm ADMIN_PASSWORD production` then
`vercel env add ADMIN_PASSWORD production`.

### iPhone calendar subscription

The "📅 חיבור היומן לאייפון" panel at the top of the Calendar tab shows a personal
`webcal://` link (backed by `GET /api/calendar/[token]`, token-authenticated since
a real calendar-subscription client can't send a login cookie). Subscribing to it
mirrors every non-cancelled Event with a date into the iPhone Calendar app,
read-only, refreshed automatically by iOS — one direction only, CRM → iPhone.
Pulling personal iPhone/iCloud events back into the CRM would need iCloud CalDAV
credentials (an Apple app-specific password) and is a separate, heavier feature —
not built, ask if you want it.

The feed token lives in `CALENDAR_FEED_TOKEN`; rotate it the same way as
`ADMIN_PASSWORD` above if it ever leaks (anyone with the link can read the
calendar, so don't post it anywhere public).

## Testimonials

`src/components/Testimonials.tsx` renders nothing until real testimonials are
added to its `testimonials` array — no placeholder quotes were fabricated.
