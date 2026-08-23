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
- **CRM tab** (default landing tab): the sales pipeline — every lead/event with a
  customer, as a sortable table, not just a per-customer history. Each row carries
  deal fields (`price`, `vatAmount`, `commissionPercent`, `closingProbability`,
  `closedBy`) and follow-up fields (`nextFollowUpDate`, `contactedBy`, `callNotes`,
  `lastContactedAt`, stamped by a "✓ סמן שדיברנו עכשיו" button). Filter chips bucket
  rows by `getFollowUpUrgency()` in `src/types/crm.ts` — overdue / קרוב לשיחה (due
  within 3 days) / רחוק לשיחה / כבר דיברנו / ללא מעקב — computed client-side from
  the two date fields, not stored as a separate status.
- **יומן (Calendar) tab**: month grid, click a day to see/add events. Adding an
  event lets you pick an existing customer, quick-create a new one, or just block
  the date with a title (no customer) — e.g. a personal day off. Event status
  (`lead` / `tentative` / `confirmed` / `completed` / `cancelled`) drives both the
  colored dot on the calendar and the public availability warning.
- **לקוחות (Customers) tab**: searchable customer directory; click one to see
  contact info, editable notes, and their full event history. Customers are also
  created automatically from website inquiries (deduped by phone number).

To change the admin password: `vercel env rm ADMIN_PASSWORD production` then
`vercel env add ADMIN_PASSWORD production`.

### iPhone ↔ CRM calendar sync

Both directions exist and are both live against Tal's real iCloud account:

- **CRM → iPhone**: the "📅 חיבור היומן לאייפון" panel at the top of the Calendar
  tab shows a personal `webcal://` link (backed by `GET /api/calendar/[token]`,
  token-authenticated since a real calendar-subscription client can't send a
  login cookie). Subscribing mirrors CRM events into the iPhone Calendar app,
  read-only, refreshed automatically by iOS. **Deliberately excludes
  `source: "icloud"` events** — those were pulled *from* the phone in the first
  place, so re-exporting them would show every one of them twice on Tal's
  calendar. Only CRM-native events (website leads, manually added ones) go out.
- **iPhone → CRM**: see the "iPhone → CRM sync" section below.

The feed token lives in `CALENDAR_FEED_TOKEN`; rotate it the same way as
`ADMIN_PASSWORD` above if it ever leaks (anyone with the link can read the
calendar, so don't post it anywhere public).

### iPhone → CRM sync (the other direction)

Live — connected to Tal's real iCloud account and tested end-to-end (113 events
imported across 4 calendars on the first run). The "📱 סנכרון מהאייפון עכשיו"
button in the Calendar tab calls `POST /api/admin/icloud-sync`, which connects
to `caldav.icloud.com` (via `tsdav`) using `ICLOUD_APPLE_ID` + `ICLOUD_APP_PASSWORD`
— the latter is an [app-specific password](https://appleid.apple.com)
(Sign-In and Security → App-Specific Passwords), never the real Apple ID
password. `ICLOUD_INCLUDED_CALENDARS` (comma-separated calendar display names,
currently just `"Work"`) restricts which of the account's calendars actually
get pulled in — Tal's other three calendars ("לוח שנה", "Home", "Reminders")
are personal and were explicitly excluded on request; unset the env var
entirely to sync every calendar again. Within the included calendars it pulls
every event for the next 18 months (expanding recurring events via
`node-ical`), and imports each one as a customer-less `Event` with
`source: "icloud"` — one row per calendar day for multi-day events, deduped
by an `externalId` of `icloud:<uid>:<date>` so re-running the sync updates
existing rows and removes ones deleted on the phone (or, as just happened,
ones dropped by narrowing `ICLOUD_INCLUDED_CALENDARS`), instead of piling up
duplicates. Each event stores the hex `color` of its source iCloud calendar
(Apple returns this per-calendar via CalDAV's `calendar-color` property,
already requested by `tsdav`'s default `fetchCalendars` props) — the calendar
dot and the "📱 מהאייפון" badge use that real color instead of a flat
placeholder.

This is manual ("sync now" button), not automatic — add a Vercel Cron Job
hitting the same endpoint on a schedule if you want it to run itself. A full
sync currently takes ~20-30s (sequential CalDAV round-trips per calendar),
hence `export const maxDuration = 60` on that route.

**Timezone bug found and fixed while testing this**: `@neondatabase/serverless`
converts Postgres `DATE` columns to JS `Date` objects using the process's local
timezone, not UTC — invisible on Vercel (which runs UTC), but every date would
have silently shifted by a day on any non-UTC host (including local dev on this
machine, which is why it surfaced immediately during testing). Fixed by forcing
`process.env.TZ = "UTC"` at the top of `src/lib/db.ts`, since every date in this
app is a plain calendar date with no meaningful time component anyway.

## Testimonials

`src/components/Testimonials.tsx` renders nothing until real testimonials are
added to its `testimonials` array — no placeholder quotes were fabricated.
