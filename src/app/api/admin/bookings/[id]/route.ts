import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { BookingStatus } from "@/generated/prisma/client";

const VALID_STATUSES = new Set<string>(Object.values(BookingStatus));

export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/bookings/[id]">) {
  const { id } = await ctx.params;

  let body: { status?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "בקשה לא תקינה" }, { status: 400 });
  }

  if (typeof body.status !== "string" || !VALID_STATUSES.has(body.status)) {
    return NextResponse.json({ error: "סטטוס לא תקין" }, { status: 400 });
  }

  try {
    const booking = await prisma.bookingRequest.update({
      where: { id },
      data: { status: body.status as BookingStatus },
    });
    return NextResponse.json({ booking });
  } catch (error) {
    console.error("Failed to update booking status", error);
    return NextResponse.json({ error: "הפנייה לא נמצאה" }, { status: 404 });
  }
}
