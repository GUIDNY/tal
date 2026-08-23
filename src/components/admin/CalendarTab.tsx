"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { EventRecord } from "@/types/crm";
import { EVENT_STATUS_COLORS, EVENT_STATUS_DOT, EVENT_STATUS_LABELS } from "@/types/crm";
import { getMonthGrid, toDateKey, HEBREW_MONTH_NAMES, HEBREW_WEEKDAY_SHORT } from "@/lib/calendar";
import EventFormModal from "./EventFormModal";

export default function CalendarTab() {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>(toDateKey(new Date()));
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventRecord | null>(null);

  const days = useMemo(() => getMonthGrid(cursor.getFullYear(), cursor.getMonth()), [cursor]);

  const load = useCallback(async () => {
    const from = days[0];
    const to = days[days.length - 1];
    const res = await fetch(`/api/admin/events?from=${toDateKey(from)}&to=${toDateKey(to)}`);
    if (res.ok) {
      const data = await res.json();
      setEvents(data.events);
    }
  }, [days]);

  useEffect(() => {
    // setEvents happens after the awaited fetch resolves, not synchronously during this effect run.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, EventRecord[]>();
    for (const ev of events) {
      if (!ev.eventDate) continue;
      const key = ev.eventDate.slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    }
    return map;
  }, [events]);

  const todayKey = toDateKey(new Date());
  const selectedEvents = eventsByDay.get(selectedDay) ?? [];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-charcoal-line text-paper-dim hover:text-paper"
            aria-label="חודש קודם"
          >
            ›
          </button>
          <h3 className="font-display w-40 text-center text-lg font-bold text-paper">
            {HEBREW_MONTH_NAMES[cursor.getMonth()]} {cursor.getFullYear()}
          </h3>
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-charcoal-line text-paper-dim hover:text-paper"
            aria-label="חודש הבא"
          >
            ‹
          </button>
        </div>
        <button
          onClick={() => {
            const now = new Date();
            setCursor(new Date(now.getFullYear(), now.getMonth(), 1));
            setSelectedDay(toDateKey(now));
          }}
          className="rounded-full border border-charcoal-line px-4 py-1.5 text-xs text-paper-dim hover:text-paper"
        >
          היום
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center text-xs text-paper-dim">
        {HEBREW_WEEKDAY_SHORT.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day) => {
          const key = toDateKey(day);
          const inMonth = day.getMonth() === cursor.getMonth();
          const dayEvents = eventsByDay.get(key) ?? [];
          const isToday = key === todayKey;
          const isSelected = key === selectedDay;
          return (
            <button
              key={key}
              onClick={() => setSelectedDay(key)}
              className={`flex min-h-[64px] flex-col items-center gap-1 rounded-xl border p-1.5 transition sm:min-h-[80px] sm:items-start sm:p-2 ${
                isSelected
                  ? "border-champagne bg-champagne/10"
                  : "border-charcoal-line bg-ink-soft hover:border-paper-dim"
              } ${!inMonth ? "opacity-40" : ""}`}
            >
              <span className={`text-xs ${isToday ? "font-bold text-champagne" : "text-paper-dim"}`}>
                {day.getDate()}
              </span>
              <div className="flex flex-wrap gap-1">
                {dayEvents.slice(0, 3).map((ev) => (
                  <span key={ev.id} className={`h-1.5 w-1.5 rounded-full ${EVENT_STATUS_DOT[ev.status]}`} />
                ))}
                {dayEvents.length > 3 && <span className="text-[10px] text-paper-dim">+{dayEvents.length - 3}</span>}
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-charcoal-line bg-ink-soft p-5">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="font-semibold text-paper">
            {new Date(selectedDay).toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" })}
          </h4>
          <button
            onClick={() => setShowForm(true)}
            className="rounded-full bg-champagne px-4 py-1.5 text-xs font-semibold text-ink"
          >
            + אירוע
          </button>
        </div>

        {selectedEvents.length === 0 ? (
          <p className="text-sm text-paper-dim">אין אירועים בתאריך זה.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {selectedEvents.map((ev) => (
              <button
                key={ev.id}
                onClick={() => setEditingEvent(ev)}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-charcoal-line bg-ink px-4 py-3 text-right transition hover:border-paper-dim"
              >
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${EVENT_STATUS_COLORS[ev.status]}`}>
                  {EVENT_STATUS_LABELS[ev.status]}
                </span>
                <span className="text-sm font-medium text-paper">
                  {ev.customer?.fullName ?? ev.title ?? "אירוע"}
                </span>
                {ev.eventType && <span className="text-sm text-paper-dim">{ev.eventType}</span>}
                {ev.city && <span className="text-sm text-paper-dim">{ev.city}</span>}
                {ev.customer && (
                  <span className="ms-auto text-xs text-paper-dim">{ev.customer.phone}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <EventFormModal
          key={selectedDay}
          onClose={() => setShowForm(false)}
          onSaved={load}
          defaultDate={selectedDay}
        />
      )}

      {editingEvent && (
        <EventFormModal
          key={editingEvent.id}
          onClose={() => setEditingEvent(null)}
          onSaved={load}
          editingEvent={editingEvent}
        />
      )}
    </div>
  );
}
