import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { normalizePhone } from "@/lib/phone";
import { EventStatus } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

const VALID_STATUSES = new Set<string>(Object.values(EventStatus));

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const customerId = searchParams.get("customerId");

  const events = await prisma.event.findMany({
    where: {
      customerId: customerId ?? undefined,
      eventDate:
        from && to
          ? { gte: new Date(from), lte: new Date(to) }
          : from
            ? { gte: new Date(from) }
            : undefined,
    },
    include: { customer: { select: { id: true, fullName: true, phone: true } } },
    orderBy: [{ eventDate: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ events });
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "בקשה לא תקינה" }, { status: 400 });
  }

  const status = isNonEmptyString(body.status) && VALID_STATUSES.has(body.status) ? body.status : "lead";
  const eventDate =
    isNonEmptyString(body.eventDate) && !Number.isNaN(Date.parse(body.eventDate))
      ? new Date(body.eventDate)
      : null;

  let customerId: string | null = isNonEmptyString(body.customerId) ? body.customerId : null;

  // Allow creating (or reusing, by phone) a customer inline from the calendar/event form.
  const newCustomer = body.newCustomer as { fullName?: unknown; phone?: unknown; email?: unknown } | undefined;
  if (!customerId && newCustomer && isNonEmptyString(newCustomer.fullName) && isNonEmptyString(newCustomer.phone)) {
    const phone = normalizePhone(newCustomer.phone);
    if (phone.length < 7) return NextResponse.json({ error: "מספר טלפון לא תקין" }, { status: 400 });
    const customer = await prisma.customer.upsert({
      where: { phone },
      create: {
        phone,
        fullName: newCustomer.fullName.trim(),
        email: isNonEmptyString(newCustomer.email) ? newCustomer.email.trim() : null,
      },
      update: {},
    });
    customerId = customer.id;
  }

  if (!customerId && !isNonEmptyString(body.title)) {
    return NextResponse.json({ error: "יש לבחור לקוח או להזין כותרת (לחסימת תאריך)" }, { status: 400 });
  }

  try {
    const event = await prisma.event.create({
      data: {
        customerId,
        title: isNonEmptyString(body.title) ? body.title.trim() : null,
        eventType: isNonEmptyString(body.eventType) ? body.eventType : null,
        eventDate,
        venue: isNonEmptyString(body.venue) ? body.venue.trim() : null,
        city: isNonEmptyString(body.city) ? body.city.trim() : null,
        guestCount: isNonEmptyString(body.guestCount) ? body.guestCount : null,
        serviceType: isNonEmptyString(body.serviceType) ? body.serviceType : null,
        message: isNonEmptyString(body.message) ? body.message.trim() : null,
        status: status as EventStatus,
        source: "manual",
      },
      include: { customer: { select: { id: true, fullName: true, phone: true } } },
    });
    return NextResponse.json({ event });
  } catch (error) {
    console.error("Failed to create event", error);
    return NextResponse.json({ error: "שגיאה ביצירת האירוע" }, { status: 500 });
  }
}
