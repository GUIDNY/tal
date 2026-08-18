# טל ראופמן — DJ & Saxophone

Next.js 16 + Tailwind v4 site for Tal Raufman.

## Run locally

```bash
npm install
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
- `public/tal/video/` — **empty**. The hero and showreel sections reference
  `hero-1080.mp4` / `hero-1080.webm` / `showreel.mp4` here; until those exist the
  site gracefully falls back to a static photo (no broken UI). The only video
  supplied (`~/Desktop/טל/IMG_3566.MOV`, 108MB, vertical phone footage) is too
  large to serve or commit as-is — compress and crop it to a 16:9 (or blurred
  16:9-padded) MP4 + WebM pair under ~15MB and drop them in this folder.

## Booking flow

There's no database connected yet (by design, for now). The multi-step
"בדיקת זמינות" flow collects the lead client-side and opens WhatsApp with a
prefilled message — nothing is stored server-side. To add persistence later:
create a Supabase project, add a `booking_requests` table, and wire a
`POST /api/bookings` route + RLS policies before adding an admin dashboard at
`/admin` (not built yet — would have nothing to show without a database).

## Testimonials

`src/components/Testimonials.tsx` renders nothing until real testimonials are
added to its `testimonials` array — no placeholder quotes were fabricated.
