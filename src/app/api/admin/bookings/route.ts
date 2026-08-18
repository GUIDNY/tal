import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { BookingStatus, type Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

const VALID_STATUSES = new Set<string>(Object.values(BookingStatus));

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("q")?.trim();

  const where: Prisma.BookingRequestWhereInput = {};
  if (status && status !== "all" && VALID_STATUSES.has(status)) {
    where.status = status as BookingStatus;
  }
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
      { city: { contains: search, mode: "insensitive" } },
      { venue: { contains: search, mode: "insensitive" } },
    ];
  }

  const bookings = await prisma.bookingRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ bookings });
}
