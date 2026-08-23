import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const token = process.env.CALENDAR_FEED_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "CALENDAR_FEED_TOKEN אינו מוגדר" }, { status: 500 });
  }

  const url = new URL(request.url);
  const path = `/api/calendar/${token}`;

  return NextResponse.json({
    httpsUrl: `${url.origin}${path}`,
    webcalUrl: `webcal://${url.host}${path}`,
  });
}
