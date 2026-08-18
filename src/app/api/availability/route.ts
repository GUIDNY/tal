import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const oneYearOut = new Date(today);
  oneYearOut.setUTCFullYear(oneYearOut.getUTCFullYear() + 1);

  const dates = await prisma.availabilityDate.findMany({
    where: { date: { gte: today, lte: oneYearOut }, status: { not: "available" } },
    select: { date: true, status: true },
    orderBy: { date: "asc" },
  });

  return NextResponse.json({
    dates: dates.map((d) => ({
      date: d.date.toISOString().slice(0, 10),
      status: d.status,
    })),
  });
}
