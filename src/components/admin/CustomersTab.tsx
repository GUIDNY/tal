"use client";

import { useCallback, useEffect, useState } from "react";
import type { CustomerRecord, EventRecord } from "@/types/crm";
import { EVENT_STATUS_COLORS, EVENT_STATUS_LABELS } from "@/types/crm";
import EventFormModal from "./EventFormModal";

const inputClass =
  "w-full rounded-xl border border-charcoal-line bg-ink px-3 py-2.5 text-sm text-paper outline-none transition focus:border-champagne";

function formatDate(value: string | null) {
  if (!value) return "לא צוין";
  return new Date(value).toLocaleDateString("he-IL", { year: "numeric", month: "short", day: "numeric" });
}

export default function CustomersTab() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [showNewEvent, setShowNewEvent] = useState(false);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    const res = await fetch(`/api/admin/customers?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setCustomers(data.customers);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const selected = customers.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[360px_1fr]">
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="חיפוש לקוח..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={inputClass}
          />
          <button
            onClick={() => setShowNewCustomer(true)}
            className="shrink-0 rounded-xl bg-champagne px-4 py-2.5 text-sm font-semibold text-ink"
          >
            + לקוח
          </button>
        </div>

        <div className="flex max-h-[65vh] flex-col gap-2 overflow-y-auto">
          {customers.length === 0 ? (
            <p className="rounded-2xl border border-charcoal-line bg-ink-soft p-6 text-center text-sm text-paper-dim">
              אין לקוחות להצגה.
            </p>
          ) : (
            customers.map((c) => {
              const upcoming = c.events.find((e) => e.eventDate && new Date(e.eventDate) >= new Date());
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`rounded-2xl border p-4 text-right transition ${
                    selectedId === c.id
                      ? "border-champagne bg-champagne/10"
                      : "border-charcoal-line bg-ink-soft hover:border-paper-dim"
                  }`}
                >
                  <p className="font-semibold text-paper">{c.fullName}</p>
                  <p className="text-xs text-paper-dim">{c.phone}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-paper-dim">
                    <span>{c.events.length} אירועים</span>
                    {upcoming && (
                      <span
                        className={`rounded-full px-2 py-0.5 ${EVENT_STATUS_COLORS[upcoming.status]}`}
                      >
                        {EVENT_STATUS_LABELS[upcoming.status]}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div>
        {selected ? (
          <CustomerDetail
            key={selected.id}
            customer={selected}
            onChanged={load}
            onAddEvent={() => setShowNewEvent(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center rounded-2xl border border-charcoal-line bg-ink-soft p-10 text-center text-paper-dim">
            בחרו לקוח מהרשימה כדי לראות פרטים והיסטוריית אירועים.
          </div>
        )}
      </div>

      {showNewCustomer && (
        <NewCustomerModal
          onClose={() => setShowNewCustomer(false)}
          onCreated={(id) => {
            load();
            setSelectedId(id);
          }}
        />
      )}

      {showNewEvent && selected && (
        <EventFormModal
          key={selected.id}
          onClose={() => setShowNewEvent(false)}
          onSaved={load}
          defaultCustomerId={selected.id}
        />
      )}
    </div>
  );
}

function CustomerDetail({
  customer,
  onChanged,
  onAddEvent,
}: {
  customer: CustomerRecord;
  onChanged: () => void;
  onAddEvent: () => void;
}) {
  const [notes, setNotes] = useState(customer.notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventRecord | null>(null);

  async function saveNotes() {
    setSavingNotes(true);
    await fetch(`/api/admin/customers/${customer.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    setSavingNotes(false);
    onChanged();
  }

  const waHref = `https://wa.me/${customer.phone}`;

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl border border-charcoal-line bg-ink-soft p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-bold text-paper">{customer.fullName}</h3>
            <p className="text-sm text-paper-dim">{customer.phone}</p>
            {customer.email && <p className="text-sm text-paper-dim">{customer.email}</p>}
          </div>
          <div className="flex gap-2">
            <a
              href={`tel:${customer.phone}`}
              className="rounded-full border border-charcoal-line px-4 py-2 text-xs text-paper transition hover:border-champagne hover:text-champagne"
            >
              📞 חיוג
            </a>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-charcoal-line px-4 py-2 text-xs text-paper transition hover:border-champagne hover:text-champagne"
            >
              💬 וואטסאפ
            </a>
            <button
              onClick={onAddEvent}
              className="rounded-full bg-champagne px-4 py-2 text-xs font-semibold text-ink"
            >
              + אירוע
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <label className="text-xs text-paper-dim">הערות</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={saveNotes}
            rows={3}
            className={inputClass}
            placeholder="הערות פנימיות על הלקוח..."
          />
          {savingNotes && <span className="text-xs text-paper-dim">שומר...</span>}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-semibold text-paper-dim">היסטוריית אירועים</h4>
        {customer.events.length === 0 ? (
          <p className="rounded-2xl border border-charcoal-line bg-ink-soft p-6 text-center text-sm text-paper-dim">
            אין עדיין אירועים ללקוח זה.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {customer.events.map((ev) => (
              <button
                key={ev.id}
                onClick={() => setEditingEvent(ev)}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-charcoal-line bg-ink-soft px-4 py-3 text-right transition hover:border-paper-dim"
              >
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${EVENT_STATUS_COLORS[ev.status]}`}>
                  {EVENT_STATUS_LABELS[ev.status]}
                </span>
                <span className="text-sm text-paper">{ev.eventType ?? "אירוע"}</span>
                <span className="text-sm text-paper-dim">{formatDate(ev.eventDate)}</span>
                {ev.city && <span className="text-sm text-paper-dim">{ev.city}</span>}
                <span className="ms-auto text-xs text-paper-dim">מקור: {ev.source === "website" ? "אתר" : "ידני"}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {editingEvent && (
        <EventFormModal
          key={editingEvent.id}
          onClose={() => setEditingEvent(null)}
          onSaved={onChanged}
          editingEvent={editingEvent}
        />
      )}
    </div>
  );
}

function NewCustomerModal({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, phone, email }),
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      onCreated(data.customer.id);
      onClose();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "שגיאה ביצירת לקוח");
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button aria-label="סגור" className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-sm rounded-3xl border border-charcoal-line bg-ink-soft p-6"
      >
        <h2 className="font-display text-lg font-bold text-paper">לקוח חדש</h2>
        <div className="mt-5 flex flex-col gap-3">
          <input
            type="text"
            placeholder="שם מלא"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
          />
          <input
            type="tel"
            placeholder="טלפון"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
          />
          <input
            type="email"
            placeholder="אימייל (לא חובה)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-full border border-charcoal-line px-5 py-2.5 text-sm text-paper-dim">
            ביטול
          </button>
          <button type="submit" disabled={saving} className="rounded-full bg-champagne px-6 py-2.5 text-sm font-semibold text-ink disabled:opacity-50">
            {saving ? "שומר..." : "יצירה"}
          </button>
        </div>
      </form>
    </div>
  );
}
