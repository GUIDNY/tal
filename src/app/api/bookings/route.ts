import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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

  try {
    const booking = await prisma.bookingRequest.create({
      data: {
        fullName: body.fullName.trim(),
        phone: body.phone.trim(),
        email: isNonEmptyString(body.email) ? body.email.trim() : null,
        eventType: isNonEmptyString(body.eventType) ? body.eventType : "לא צוין",
        eventDate,
        venue: isNonEmptyString(body.venue) ? body.venue.trim() : null,
        city: body.city.trim(),
        guestCount: isNonEmptyString(body.guestCount) ? body.guestCount : "לא צוין",
        serviceType: isNonEmptyString(body.serviceType) ? body.serviceType : "לא צוין",
        message: isNonEmptyString(body.message) ? body.message.trim() : null,
        source: "website",
      },
    });
    return NextResponse.json({ ok: true, id: booking.id });
  } catch (error) {
    console.error("Failed to create booking request", error);
    return NextResponse.json({ error: "שגיאה בשמירת הפנייה" }, { status: 500 });
  }
}
