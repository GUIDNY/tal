import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { DateStatus } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

const VALID_STATUSES = new Set<string>(Object.values(DateStatus));

export async function GET() {
  const dates = await prisma.availabilityDate.findMany({ orderBy: { date: "asc" } });
  return NextResponse.json({ dates });
}

export async function POST(request: Request) {
  let body: { date?: unknown; status?: unknown; note?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "בקשה לא תקינה" }, { status: 400 });
  }

  if (typeof body.date !== "string" || Number.isNaN(Date.parse(body.date))) {
    return NextResponse.json({ error: "תאריך לא תקין" }, { status: 400 });
  }
  if (typeof body.status !== "string" || !VALID_STATUSES.has(body.status)) {
    return NextResponse.json({ error: "סטטוס לא תקין" }, { status: 400 });
  }

  const date = new Date(body.date);
  const status = body.status as DateStatus;
  const note = typeof body.note === "string" && body.note.trim() ? body.note.trim() : null;

  if (status === "available") {
    await prisma.availabilityDate.deleteMany({ where: { date } });
    return NextResponse.json({ ok: true });
  }

  const entry = await prisma.availabilityDate.upsert({
    where: { date },
    create: { date, status, note },
    update: { status, note },
  });

  return NextResponse.json({ entry });
}
