import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { normalizePhone } from "@/lib/phone";

export const dynamic = "force-dynamic";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("q")?.trim();

  const customers = await prisma.customer.findMany({
    where: search
      ? {
          OR: [
            { fullName: { contains: search, mode: "insensitive" } },
            { phone: { contains: normalizePhone(search) } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: {
      events: { select: { id: true, status: true, eventDate: true }, orderBy: { eventDate: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ customers });
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "בקשה לא תקינה" }, { status: 400 });
  }

  if (!isNonEmptyString(body.fullName) || !isNonEmptyString(body.phone)) {
    return NextResponse.json({ error: "חסרים פרטים חובה" }, { status: 400 });
  }

  const phone = normalizePhone(body.phone);
  if (phone.length < 7) {
    return NextResponse.json({ error: "מספר טלפון לא תקין" }, { status: 400 });
  }

  try {
    const customer = await prisma.customer.create({
      data: {
        fullName: body.fullName.trim(),
        phone,
        email: isNonEmptyString(body.email) ? body.email.trim() : null,
        notes: isNonEmptyString(body.notes) ? body.notes.trim() : null,
      },
    });
    return NextResponse.json({ customer });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "כבר קיים לקוח עם מספר הטלפון הזה" }, { status: 409 });
    }
    console.error("Failed to create customer", error);
    return NextResponse.json({ error: "שגיאה ביצירת לקוח" }, { status: 500 });
  }
}
