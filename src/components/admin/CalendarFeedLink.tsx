"use client";

import { useEffect, useState } from "react";

export default function CalendarFeedLink() {
  const [open, setOpen] = useState(false);
  const [links, setLinks] = useState<{ httpsUrl: string; webcalUrl: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open || links) return;
    fetch("/api/admin/calendar-link")
      .then((res) => res.json())
      .then((data) => {
        if (data.httpsUrl) setLinks(data);
      });
  }, [open, links]);

  async function copyLink() {
    if (!links) return;
    await navigator.clipboard.writeText(links.httpsUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-2xl border border-charcoal-line bg-ink-soft">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-3 text-sm font-medium text-paper-dim transition hover:text-paper"
      >
        <span>📅 חיבור היומן לאייפון</span>
        <span>{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="border-t border-charcoal-line px-5 py-4 text-sm text-paper-dim">
          {!links ? (
            <p>טוען...</p>
          ) : (
            <div className="flex flex-col gap-3">
              <p>
                באייפון: פתחו את הקישור למטה — הוא ייפתח ישירות באפליקציית היומן ויציע להוסיף מנוי. אחרי
                האישור, כל אירוע ב-CRM יופיע אוטומטית ביומן שלכם (מתעדכן לבד, לא צריך לעשות שום דבר נוסף).
              </p>
              <a
                href={links.webcalUrl}
                className="w-fit rounded-full bg-champagne px-5 py-2.5 text-sm font-semibold text-ink"
              >
                הוספה ליומן באייפון
              </a>
              <p className="text-xs text-paper-dim">
                אם הקישור לא נפתח אוטומטית: הגדרות ← יומן ← חשבונות ← הוספת חשבון ← אחר ← הוספת יומן במנוי,
                והדביקו שם את הקישור הבא:
              </p>
              <div className="flex items-center gap-2 rounded-xl border border-charcoal-line bg-ink px-3 py-2">
                <code dir="ltr" className="flex-1 truncate text-xs text-paper">
                  {links.httpsUrl}
                </code>
                <button
                  onClick={copyLink}
                  className="shrink-0 rounded-full border border-charcoal-line px-3 py-1 text-xs text-paper transition hover:border-champagne hover:text-champagne"
                >
                  {copied ? "הועתק ✓" : "העתקה"}
                </button>
              </div>
              <p className="text-xs text-paper-dim">
                הקישור אישי ופותח גישת קריאה ליומן — אין לשתף אותו במקום ציבורי.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
