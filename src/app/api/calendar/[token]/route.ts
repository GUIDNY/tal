import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/db";
import { buildIcsFeed } from "@/lib/ics";

export const dynamic = "force-dynamic";

function isValidToken(candidate: string): boolean {
  const real = process.env.CALENDAR_FEED_TOKEN;
  if (!real) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(real);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function GET(request: Request, ctx: RouteContext<"/api/calendar/[token]">) {
  const { token } = await ctx.params;
  if (!isValidToken(token)) {
    return NextResponse.json({ error: "לא מורשה" }, { status: 401 });
  }

  const events = await prisma.event.findMany({
    where: { eventDate: { not: null }, status: { not: "cancelled" } },
    include: { customer: { select: { fullName: true, phone: true } } },
    orderBy: { eventDate: "asc" },
  });

  const host = new URL(request.url).host;
  const feed = buildIcsFeed(events, "טל ראופמן — יומן אירועים", host);

  return new NextResponse(feed, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="tal-raufman.ics"',
      "Cache-Control": "no-store",
    },
  });
}
