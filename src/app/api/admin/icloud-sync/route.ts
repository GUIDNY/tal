import { NextResponse } from "next/server";
import { syncFromICloud } from "@/lib/icloud-sync";

export async function POST() {
  try {
    const result = await syncFromICloud();
    return NextResponse.json(result);
  } catch (error) {
    console.error("iCloud sync failed", error);
    const message = error instanceof Error ? error.message : "שגיאה בסנכרון מ-iCloud";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
