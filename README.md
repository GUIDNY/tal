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
  to Postgres via `POST /api/bookings` in the background. Includes a honeypot
  field for basic spam protection.
- `GET /api/availability` — public, returns dates marked `hold`/`booked` so the
  date step can show a soft warning (never a hard block — see original spec).
- Database: Neon Postgres, provisioned via `vercel install neon` and connected to
  the Vercel project. Schema lives in `prisma/schema.prisma`
  (`BookingRequest`, `AvailabilityDate`). Run `npx prisma migrate dev` for schema
  changes.

## Admin dashboard — `/admin`

- Auth: single shared password (`ADMIN_PASSWORD` env var) → HMAC-signed session
  cookie (`ADMIN_SESSION_SECRET` env var), verified in `src/proxy.ts` (Next 16's
  successor to `middleware.ts`) for both `/admin/*` pages and `/api/admin/*` routes.
  Both env vars were generated and pushed to Vercel (Production + Development)
  when this was built — check the Vercel dashboard's Environment Variables page
  for the current values, or generate new ones and update them there.
- **פניות tab**: list of leads with status filter chips, search, expandable detail
  (call / WhatsApp / email actions), and status buttons (new → contacted →
  qualified → booked / lost).
- **זמינות tab**: mark a date as `hold` or `booked` (with an optional note); marking
  it `available` again just removes the entry. This is what powers the public
  availability warning above.

To change the admin password: `vercel env rm ADMIN_PASSWORD production` then
`vercel env add ADMIN_PASSWORD production`.

## Testimonials

`src/components/Testimonials.tsx` renders nothing until real testimonials are
added to its `testimonials` array — no placeholder quotes were fabricated.
