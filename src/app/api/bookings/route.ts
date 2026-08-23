import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { normalizePhone } from "@/lib/phone";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "בקשה לא תקינה" }, { status: 400 });
  }

  // Honeypot: real users never fill a hidden field.
  if (isNonEmptyString(body.website)) {
    return NextResponse.json({ ok: true });
  }

  if (!isNonEmptyString(body.fullName) || !isNonEmptyString(body.phone) || !isNonEmptyString(body.city)) {
    return NextResponse.json({ error: "חסרים פרטים חובה" }, { status: 400 });
  }

  if (body.fullName.length > 200 || body.phone.length > 50 || body.city.length > 200) {
    return NextResponse.json({ error: "קלט ארוך מדי" }, { status: 400 });
  }

  const eventDate =
    isNonEmptyString(body.eventDate) && !Number.isNaN(Date.parse(body.eventDate))
      ? new Date(body.eventDate)
      : null;

  const phone = normalizePhone(body.phone);
  if (phone.length < 7) {
    return NextResponse.json({ error: "מספר טלפון לא תקין" }, { status: 400 });
  }

  try {
    const customer = await prisma.customer.upsert({
      where: { phone },
      create: {
        phone,
        fullName: body.fullName.trim(),
        email: isNonEmptyString(body.email) ? body.email.trim() : null,
      },
      update: {}, // an existing customer's name/email are managed from the CRM, not overwritten by a new inquiry
    });

    const event = await prisma.event.create({
      data: {
        customerId: customer.id,
        eventType: isNonEmptyString(body.eventType) ? body.eventType : "לא צוין",
        eventDate,
        venue: isNonEmptyString(body.venue) ? body.venue.trim() : null,
        city: body.city.trim(),
        guestCount: isNonEmptyString(body.guestCount) ? body.guestCount : "לא צוין",
        serviceType: isNonEmptyString(body.serviceType) ? body.serviceType : "לא צוין",
        message: isNonEmptyString(body.message) ? body.message.trim() : null,
        source: "website",
        status: "lead",
      },
    });
    return NextResponse.json({ ok: true, id: event.id });
  } catch (error) {
    console.error("Failed to create booking request", error);
    return NextResponse.json({ error: "שגיאה בשמירת הפנייה" }, { status: 500 });
  }
}
