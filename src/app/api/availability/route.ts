import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const oneYearOut = new Date(today);
  oneYearOut.setUTCFullYear(oneYearOut.getUTCFullYear() + 1);

  const events = await prisma.event.findMany({
    where: {
      eventDate: { gte: today, lte: oneYearOut },
      status: { in: ["tentative", "confirmed"] },
    },
    select: { eventDate: true, status: true },
    orderBy: { eventDate: "asc" },
  });

  return NextResponse.json({
    dates: events
      .filter((e) => e.eventDate)
      .map((e) => ({
        date: e.eventDate!.toISOString().slice(0, 10),
        status: e.status === "confirmed" ? "booked" : "hold",
      })),
  });
}
