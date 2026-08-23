import { NextResponse } from "next/server";
import { syncFromICloud } from "@/lib/icloud-sync";

// A full sync (multiple CalDAV round-trips across every calendar) can take 20-30s+;
// stay under Vercel's serverless cap so the request doesn't get killed mid-sync.
export const maxDuration = 60;

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
