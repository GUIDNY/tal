import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { normalizePhone } from "@/lib/phone";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function GET(_request: Request, ctx: RouteContext<"/api/admin/customers/[id]">) {
  const { id } = await ctx.params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { events: { orderBy: { createdAt: "desc" } } },
  });
  if (!customer) return NextResponse.json({ error: "לקוח לא נמצא" }, { status: 404 });
  return NextResponse.json({ customer });
}

export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/customers/[id]">) {
  const { id } = await ctx.params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "בקשה לא תקינה" }, { status: 400 });
  }

  const data: { fullName?: string; phone?: string; email?: string | null; notes?: string | null } = {};
  if (isNonEmptyString(body.fullName)) data.fullName = body.fullName.trim();
  if (isNonEmptyString(body.phone)) {
    const phone = normalizePhone(body.phone);
    if (phone.length < 7) return NextResponse.json({ error: "מספר טלפון לא תקין" }, { status: 400 });
    data.phone = phone;
  }
  if ("email" in body) data.email = isNonEmptyString(body.email) ? body.email.trim() : null;
  if ("notes" in body) data.notes = isNonEmptyString(body.notes) ? body.notes.trim() : null;

  try {
    const customer = await prisma.customer.update({ where: { id }, data });
    return NextResponse.json({ customer });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "כבר קיים לקוח עם מספר הטלפון הזה" }, { status: 409 });
    }
    console.error("Failed to update customer", error);
    return NextResponse.json({ error: "לקוח לא נמצא" }, { status: 404 });
  }
}
