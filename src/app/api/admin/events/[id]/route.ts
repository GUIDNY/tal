import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { EventStatus } from "@/generated/prisma/client";

const VALID_STATUSES = new Set<string>(Object.values(EventStatus));

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/events/[id]">) {
  const { id } = await ctx.params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "בקשה לא תקינה" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (isNonEmptyString(body.status) && VALID_STATUSES.has(body.status)) data.status = body.status;
  if ("eventDate" in body) {
    data.eventDate =
      isNonEmptyString(body.eventDate) && !Number.isNaN(Date.parse(body.eventDate))
        ? new Date(body.eventDate)
        : null;
  }
  if ("title" in body) data.title = isNonEmptyString(body.title) ? body.title.trim() : null;
  if ("eventType" in body) data.eventType = isNonEmptyString(body.eventType) ? body.eventType : null;
  if ("venue" in body) data.venue = isNonEmptyString(body.venue) ? body.venue.trim() : null;
  if ("city" in body) data.city = isNonEmptyString(body.city) ? body.city.trim() : null;
  if ("guestCount" in body) data.guestCount = isNonEmptyString(body.guestCount) ? body.guestCount : null;
  if ("serviceType" in body) data.serviceType = isNonEmptyString(body.serviceType) ? body.serviceType : null;
  if ("message" in body) data.message = isNonEmptyString(body.message) ? body.message.trim() : null;

  try {
    const event = await prisma.event.update({
      where: { id },
      data,
      include: { customer: { select: { id: true, fullName: true, phone: true } } },
    });
    return NextResponse.json({ event });
  } catch (error) {
    console.error("Failed to update event", error);
    return NextResponse.json({ error: "האירוע לא נמצא" }, { status: 404 });
  }
}

export async function DELETE(_request: Request, ctx: RouteContext<"/api/admin/events/[id]">) {
  const { id } = await ctx.params;
  try {
    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete event", error);
    return NextResponse.json({ error: "האירוע לא נמצא" }, { status: 404 });
  }
}
