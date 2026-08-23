import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { SupplierStatus } from "@/generated/prisma/client";

const VALID_STATUSES = new Set<string>(Object.values(SupplierStatus));

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/suppliers/[id]">) {
  const { id } = await ctx.params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "בקשה לא תקינה" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (isNonEmptyString(body.fullName)) data.fullName = body.fullName.trim();
  if (isNonEmptyString(body.phone)) data.phone = body.phone.trim();
  if ("role" in body) data.role = isNonEmptyString(body.role) ? body.role.trim() : null;
  if (isNonEmptyString(body.status) && VALID_STATUSES.has(body.status)) data.status = body.status;

  try {
    const supplier = await prisma.supplier.update({ where: { id }, data });
    return NextResponse.json({ supplier });
  } catch (error) {
    console.error("Failed to update supplier", error);
    return NextResponse.json({ error: "הספק לא נמצא" }, { status: 404 });
  }
}

export async function DELETE(_request: Request, ctx: RouteContext<"/api/admin/suppliers/[id]">) {
  const { id } = await ctx.params;
  try {
    await prisma.supplier.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete supplier", error);
    return NextResponse.json({ error: "הספק לא נמצא" }, { status: 404 });
  }
}
