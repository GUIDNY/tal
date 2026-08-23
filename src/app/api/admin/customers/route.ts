import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// Used by EventFormModal to populate the "existing customer" dropdown.
export async function GET() {
  const customers = await prisma.customer.findMany({
    select: { id: true, fullName: true, phone: true },
    orderBy: { fullName: "asc" },
  });

  return NextResponse.json({ customers });
}
