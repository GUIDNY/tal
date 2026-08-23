import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { SupplierStatus } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

const VALID_STATUSES = new Set<string>(Object.values(SupplierStatus));

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function GET() {
  const suppliers = await prisma.supplier.findMany({ orderBy: { fullName: "asc" } });
  return NextResponse.json({ suppliers });
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "בקשה לא תקינה" }, { status: 400 });
  }

  if (!isNonEmptyString(body.fullName) || !isNonEmptyString(body.phone)) {
    return NextResponse.json({ error: "יש להזין שם וטלפון" }, { status: 400 });
  }

  const status = isNonEmptyString(body.status) && VALID_STATUSES.has(body.status) ? body.status : "active";

  const supplier = await prisma.supplier.create({
    data: {
      fullName: body.fullName.trim(),
      phone: body.phone.trim(),
      role: isNonEmptyString(body.role) ? body.role.trim() : null,
      status: status as SupplierStatus,
    },
  });

  return NextResponse.json({ supplier });
}
