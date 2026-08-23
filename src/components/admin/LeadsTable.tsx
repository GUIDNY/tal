"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { EventRecord, FollowUpUrgency } from "@/types/crm";
import { EVENT_STATUS_COLORS, EVENT_STATUS_LABELS, FOLLOW_UP_COLORS, FOLLOW_UP_LABELS, getFollowUpUrgency } from "@/types/crm";
import EventFormModal from "./EventFormModal";

const FILTERS: Array<{ value: "all" | FollowUpUrgency; label: string }> = [
  { value: "all", label: "הכל" },
  { value: "overdue", label: FOLLOW_UP_LABELS.overdue },
  { value: "soon", label: FOLLOW_UP_LABELS.soon },
  { value: "later", label: FOLLOW_UP_LABELS.later },
  { value: "contacted", label: FOLLOW_UP_LABELS.contacted },
  { value: "untouched", label: FOLLOW_UP_LABELS.untouched },
];

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("he-IL", { day: "numeric", month: "short" });
}

function formatMoney(value: number | null) {
  if (value === null) return "—";
  return `₪${value.toLocaleString("he-IL")}`;
}

export default function LeadsTable() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | FollowUpUrgency>("all");
  const [search, setSearch] = useState("");
  const [editingEvent, setEditingEvent] = useState<EventRecord | null>(null);
  const [showNew, setShowNew] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/events?pipeline=1");
    if (res.ok) {
      const data = await res.json();
      setEvents(data.events);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // setEvents happens after the awaited fetch resolves, not synchronously during this effect run.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const filtered = useMemo(() => {
    return events
      .filter((ev) => (filter === "all" ? true : getFollowUpUrgency(ev) === filter))
      .filter((ev) => {
        if (!search.trim()) return true;
        const q = search.trim().toLowerCase();
        return (
          ev.customer?.fullName.toLowerCase().includes(q) ||
          ev.customer?.phone.includes(q) ||
          ev.city?.toLowerCase().includes(q) ||
          ev.eventType?.toLowerCase().includes(q)
        );
      });
  }, [events, filter, search]);

  const counts = useMemo(() => {
    const map = new Map<FollowUpUrgency, number>();
    for (const ev of events) {
      const u = getFollowUpUrgency(ev);
      map.set(u, (map.get(u) ?? 0) + 1);
    }
    return map;
  }, [events]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                filter === f.value
                  ? "border-champagne bg-champagne/10 text-champagne"
                  : "border-charcoal-line text-paper-dim hover:text-paper"
              }`}
            >
              {f.label}
              {f.value !== "all" && counts.get(f.value) ? ` (${counts.get(f.value)})` : ""}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="חיפוש לקוח, עיר, סוג אירוע..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-charcoal-line bg-ink-soft px-4 py-2 text-sm text-paper outline-none focus:border-champagne sm:w-64"
          />
          <button
            onClick={() => setShowNew(true)}
            className="shrink-0 rounded-xl bg-champagne px-4 py-2 text-sm font-semibold text-ink"
          >
            + ליד
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-paper-dim">טוען...</p>
      ) : filtered.length === 0 ? (
        <p className="rounded-2xl border border-charcoal-line bg-ink-soft p-8 text-center text-paper-dim">
          אין לידים להצגה.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-charcoal-line">
          <table className="w-full min-w-[900px] text-right text-sm">
            <thead>
              <tr className="border-b border-charcoal-line bg-ink-soft text-xs text-paper-dim">
                <th className="px-4 py-3 font-medium">לקוח</th>
                <th className="px-4 py-3 font-medium">אירוע</th>
                <th className="px-4 py-3 font-medium">תאריך</th>
                <th className="px-4 py-3 font-medium">סטטוס</th>
                <th className="px-4 py-3 font-medium">מחיר</th>
                <th className="px-4 py-3 font-medium">% סגירה</th>
                <th className="px-4 py-3 font-medium">מעקב הבא</th>
                <th className="px-4 py-3 font-medium">מי דיבר</th>
                <th className="px-4 py-3 font-medium">סיכום שיחה</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ev) => {
                const urgency = getFollowUpUrgency(ev);
                return (
                  <tr
                    key={ev.id}
                    onClick={() => setEditingEvent(ev)}
                    className="cursor-pointer border-b border-charcoal-line bg-ink-soft transition last:border-0 hover:bg-charcoal"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-paper">{ev.customer?.fullName ?? "—"}</p>
                      <p className="text-xs text-paper-dim" dir="ltr">
                        {ev.customer?.phone}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-paper-dim">{ev.eventType ?? "—"}</td>
                    <td className="px-4 py-3 text-paper-dim">{formatDate(ev.eventDate)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${EVENT_STATUS_COLORS[ev.status]}`}>
                        {EVENT_STATUS_LABELS[ev.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-paper">{formatMoney(ev.price)}</td>
                    <td className="px-4 py-3 text-paper-dim">
                      {ev.closingProbability !== null ? `${ev.closingProbability}%` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${FOLLOW_UP_COLORS[urgency]}`}>
                        {ev.nextFollowUpDate ? formatDate(ev.nextFollowUpDate) : FOLLOW_UP_LABELS[urgency]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-paper-dim">{ev.contactedBy ?? "—"}</td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-paper-dim">{ev.callNotes ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editingEvent && <EventFormModal key={editingEvent.id} onClose={() => setEditingEvent(null)} onSaved={load} editingEvent={editingEvent} />}
      {showNew && <EventFormModal key="new-lead" onClose={() => setShowNew(false)} onSaved={load} />}
    </div>
  );
}
