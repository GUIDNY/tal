interface IcsEvent {
  id: string;
  updatedAt: Date;
  eventDate: Date | null;
  status: "lead" | "tentative" | "confirmed" | "completed" | "cancelled";
  title: string | null;
  eventType: string | null;
  venue: string | null;
  city: string | null;
  guestCount: string | null;
  serviceType: string | null;
  message: string | null;
  customer: { fullName: string; phone: string } | null;
}

/** Escapes text per RFC 5545 §3.3.11 (comma, semicolon, backslash, newline). */
function escapeText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");
}

/** Folds a content line at 75 octets per RFC 5545 §3.1, continuation lines start with a space. */
function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const chunks: string[] = [];
  let rest = line;
  while (rest.length > 75) {
    chunks.push(rest.slice(0, 75));
    rest = " " + rest.slice(75);
  }
  chunks.push(rest);
  return chunks.join("\r\n");
}

function dateStamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function allDayStamp(dateStr: string): string {
  return dateStr.replace(/-/g, "");
}

function nextDay(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

const ICS_STATUS: Partial<Record<IcsEvent["status"], string>> = {
  confirmed: "CONFIRMED",
  completed: "CONFIRMED",
  tentative: "TENTATIVE",
  lead: "TENTATIVE",
};

export function buildIcsFeed(events: IcsEvent[], calendarName: string, host: string): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//" + host + "//CRM Calendar//HE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(calendarName)}`,
    "X-WR-TIMEZONE:Asia/Jerusalem",
  ];

  for (const ev of events) {
    if (!ev.eventDate || ev.status === "cancelled") continue;
    const dateKey = ev.eventDate.toISOString().slice(0, 10);

    const title = ev.customer
      ? [ev.customer.fullName, ev.eventType].filter(Boolean).join(" — ")
      : (ev.title ?? "אירוע");

    const descriptionParts = [
      ev.customer ? `לקוח: ${ev.customer.fullName} (${ev.customer.phone})` : null,
      ev.venue ? `מקום: ${ev.venue}` : null,
      ev.city ? `עיר: ${ev.city}` : null,
      ev.guestCount ? `אורחים: ${ev.guestCount}` : null,
      ev.serviceType ? `שירות: ${ev.serviceType}` : null,
      ev.message ? `הערות: ${ev.message}` : null,
    ].filter(Boolean);

    lines.push(
      "BEGIN:VEVENT",
      `UID:${ev.id}@${host}`,
      `DTSTAMP:${dateStamp(ev.updatedAt)}`,
      `DTSTART;VALUE=DATE:${allDayStamp(dateKey)}`,
      `DTEND;VALUE=DATE:${nextDay(dateKey)}`,
      `SUMMARY:${escapeText(title)}`
    );
    if (descriptionParts.length) {
      lines.push(`DESCRIPTION:${escapeText(descriptionParts.join("\n"))}`);
    }
    if (ICS_STATUS[ev.status]) {
      lines.push(`STATUS:${ICS_STATUS[ev.status]}`);
    }
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");

  return lines.map(foldLine).join("\r\n") + "\r\n";
}
