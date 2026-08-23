import { createDAVClient } from "tsdav";
import { sync as icalSync, expandRecurringEvent } from "node-ical";
import type { CalendarResponse } from "node-ical";
import { prisma } from "./db";
import { toDateKey } from "./calendar";
import type { EventStatus } from "@/generated/prisma/client";

/** Titles starting with this word (as typed on the phone) are a lead, not a booked event. */
const LEAD_PREFIX = "ליד";

/** Classifies a synced event by its title so it lands in the right CRM bucket on first import. */
function classifyIcloudStatus(title: string): EventStatus {
  return title.trim().startsWith(LEAD_PREFIX) ? "lead" : "confirmed";
}

export interface SyncResult {
  imported: number;
  removed: number;
  calendarsScanned: number;
}

/** node-ical wraps some text fields as `{ val, params }` when the property has iCal parameters. */
function textValue(value: string | { val: string } | undefined, fallback: string): string {
  if (!value) return fallback;
  return typeof value === "string" ? value : value.val;
}

/** Apple returns calendar-color as 8-digit hex (#RRGGBBAA) — CSS wants 6-digit. */
function normalizeColor(value: string | undefined): string | null {
  if (!value) return null;
  const hex = value.trim();
  const match = /^#?([0-9a-fA-F]{6})/.exec(hex);
  return match ? `#${match[1]}` : null;
}

/** Every calendar day an event instance touches, as yyyy-mm-dd (all-day DTEND is exclusive per RFC 5545). */
function datesBetween(start: Date, end: Date, isFullDay: boolean): string[] {
  const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  if (isFullDay) last.setDate(last.getDate() - 1);
  if (last < cursor) last.setTime(cursor.getTime());

  const dates: string[] = [];
  while (cursor <= last) {
    dates.push(toDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

export async function syncFromICloud(): Promise<SyncResult> {
  const username = process.env.ICLOUD_APPLE_ID;
  const password = process.env.ICLOUD_APP_PASSWORD;
  if (!username || !password) {
    throw new Error("ICLOUD_APPLE_ID / ICLOUD_APP_PASSWORD אינם מוגדרים");
  }

  const client = await createDAVClient({
    serverUrl: "https://caldav.icloud.com",
    credentials: { username, password },
    authMethod: "Basic",
    defaultAccountType: "caldav",
  });

  const allCalendars = await client.fetchCalendars();

  const includedNames = process.env.ICLOUD_INCLUDED_CALENDARS?.split(",")
    .map((n) => n.trim())
    .filter(Boolean);
  const calendars = includedNames?.length
    ? allCalendars.filter((c) => includedNames.includes(typeof c.displayName === "string" ? c.displayName : ""))
    : allCalendars;

  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setMonth(to.getMonth() + 18);

  const imported = new Map<string, { title: string; eventDate: string; color: string | null }>();

  for (const calendar of calendars) {
    const color = normalizeColor(calendar.calendarColor);
    const objects = await client.fetchCalendarObjects({
      calendar,
      timeRange: { start: from.toISOString(), end: to.toISOString() },
    });

    for (const obj of objects) {
      if (!obj.data) continue;

      let parsed: CalendarResponse;
      try {
        parsed = icalSync.parseICS(obj.data);
      } catch {
        continue; // skip anything malformed rather than aborting the whole sync
      }

      for (const component of Object.values(parsed)) {
        if (!component || component.type !== "VEVENT") continue;
        if (component.status === "CANCELLED") continue;

        const instances = expandRecurringEvent(component, { from, to });
        for (const instance of instances) {
          const title = textValue(instance.summary, "אירוע ביומן");
          for (const dateStr of datesBetween(instance.start, instance.end, instance.isFullDay)) {
            const externalId = `icloud:${component.uid}:${dateStr}`;
            imported.set(externalId, { title, eventDate: dateStr, color });
          }
        }
      }
    }
  }

  const existing = await prisma.event.findMany({
    where: { source: "icloud", eventDate: { gte: from, lte: to } },
    select: { id: true, externalId: true },
  });

  const staleIds = existing.filter((e) => e.externalId && !imported.has(e.externalId)).map((e) => e.id);
  if (staleIds.length) {
    await prisma.event.deleteMany({ where: { id: { in: staleIds } } });
  }

  for (const [externalId, item] of imported) {
    await prisma.event.upsert({
      where: { externalId },
      create: {
        externalId,
        title: item.title,
        eventDate: new Date(item.eventDate),
        // Classified once, on first import, from the title's opening word — later status changes
        // made from the CRM (e.g. marking it completed/cancelled) are left alone on re-sync.
        status: classifyIcloudStatus(item.title),
        source: "icloud",
        color: item.color,
      },
      update: {
        title: item.title,
        eventDate: new Date(item.eventDate),
        color: item.color,
      },
    });
  }

  return { imported: imported.size, removed: staleIds.length, calendarsScanned: calendars.length };
}
