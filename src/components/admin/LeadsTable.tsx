"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { DealStage, EventRecord } from "@/types/crm";
import { DEAL_STAGE_LABELS, EVENT_STATUS_COLORS, EVENT_STATUS_LABELS, TEAM_MEMBERS, getDealStage } from "@/types/crm";
import EventFormModal from "./EventFormModal";

const STAGE_FILTERS: DealStage[] = ["all", "closed", "in_progress"];

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
  const [stage, setStage] = useState<DealStage>("all");
  const [owner, setOwner] = useState<"all" | (typeof TEAM_MEMBERS)[number]>("all");
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
      .filter((ev) => (stage === "all" ? true : getDealStage(ev.status) === stage))
      .filter((ev) => (owner === "all" ? true : ev.closedBy === owner || ev.contactedBy === owner))
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
  }, [events, stage, owner, search]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {STAGE_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStage(s)}
              className={`rounded-full border px-3.5 py-2 text-xs font-medium transition sm:py-1.5 ${
                stage === s
                  ? "border-champagne bg-champagne/10 text-champagne"
                  : "border-charcoal-line text-paper-dim hover:text-paper"
              }`}
            >
              {DEAL_STAGE_LABELS[s]}
            </button>
          ))}
          <select
            value={owner}
            onChange={(e) => setOwner(e.target.value as typeof owner)}
            className="rounded-full border border-charcoal-line bg-ink px-3.5 py-2 text-xs font-medium text-paper-dim outline-none focus:border-champagne sm:py-1.5"
          >
            <option value="all">כולם</option>
            {TEAM_MEMBERS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
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
        <>
          {/* Mobile: stacked cards — the 9-column table is unusable on a phone (mostly off-screen,
              one row-scroll at a time). Same data, same tap-to-edit, laid out to read top-to-bottom instead. */}
          <div className="flex flex-col gap-3 sm:hidden">
            {filtered.map((ev) => (
              <LeadCard key={ev.id} event={ev} onClick={() => setEditingEvent(ev)} />
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-2xl border border-charcoal-line sm:block">
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
                {filtered.map((ev) => (
                  <tr
                    key={ev.id}
                    onClick={() => setEditingEvent(ev)}
                    className="cursor-pointer border-b border-charcoal-line bg-ink-soft transition last:border-0 hover:bg-charcoal"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-paper">
                        {ev.customer?.fullName ?? ev.title ?? "—"}
                        {ev.source === "icloud" && <span className="mr-1.5 align-middle text-xs">📱</span>}
                      </p>
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
                    <td className="px-4 py-3 text-paper-dim">{formatDate(ev.nextFollowUpDate)}</td>
                    <td className="px-4 py-3 text-paper-dim">{ev.contactedBy ?? "—"}</td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-paper-dim">{ev.callNotes ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {editingEvent && <EventFormModal key={editingEvent.id} onClose={() => setEditingEvent(null)} onSaved={load} editingEvent={editingEvent} />}
      {showNew && <EventFormModal key="new-lead" onClose={() => setShowNew(false)} onSaved={load} />}
    </div>
  );
}

function LeadCard({ event: ev, onClick }: { event: EventRecord; onClick: () => void }) {
  const subline = [ev.eventType, ev.city].filter(Boolean).join(" · ");

  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl border border-charcoal-line bg-ink-soft p-4 text-right transition active:bg-charcoal"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-paper">
            {ev.customer?.fullName ?? ev.title ?? "—"}
            {ev.source === "icloud" && <span className="mr-1.5 align-middle text-xs">📱</span>}
          </p>
          {ev.customer?.phone && (
            <p className="text-xs text-paper-dim" dir="ltr">
              {ev.customer.phone}
            </p>
          )}
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${EVENT_STATUS_COLORS[ev.status]}`}
        >
          {EVENT_STATUS_LABELS[ev.status]}
        </span>
      </div>

      {(subline || ev.eventDate) && (
        <p className="mt-2 text-xs text-paper-dim">
          {subline}
          {subline && ev.eventDate ? " · " : ""}
          {formatDate(ev.eventDate)}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        {ev.price !== null && <span className="font-medium text-paper">{formatMoney(ev.price)}</span>}
        {ev.closingProbability !== null && (
          <span className="text-paper-dim">{ev.closingProbability}% סגירה</span>
        )}
        {ev.nextFollowUpDate && (
          <span className="rounded-full bg-ember/10 px-2 py-0.5 text-ember">
            📅 מעקב {formatDate(ev.nextFollowUpDate)}
          </span>
        )}
        {ev.contactedBy && <span className="text-paper-dim">מי דיבר: {ev.contactedBy}</span>}
      </div>

      {ev.callNotes && <p className="mt-2 line-clamp-2 text-xs text-paper-dim">{ev.callNotes}</p>}
    </button>
  );
}
