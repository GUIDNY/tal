"use client";

import { cloneElement, useEffect, useId, useState } from "react";
import type { CustomerRecord, EventRecord, EventStatus } from "@/types/crm";
import { EVENT_STATUS_LABELS } from "@/types/crm";

interface EventFormModalProps {
  onClose: () => void;
  onSaved: () => void;
  defaultDate?: string;
  defaultCustomerId?: string;
  editingEvent?: EventRecord | null;
}

const inputClass =
  "w-full rounded-xl border border-charcoal-line bg-ink px-3 py-2.5 text-sm text-paper outline-none transition focus:border-champagne";

/**
 * Mount this only while it should be visible (conditional rendering in the parent,
 * with a `key` that changes per edit target) rather than passing an `isOpen` flag —
 * that way every field's initial state can come straight from props instead of a
 * reset-effect that re-syncs a dozen fields whenever the target changes.
 */
export default function EventFormModal({
  onClose,
  onSaved,
  defaultDate,
  defaultCustomerId,
  editingEvent,
}: EventFormModalProps) {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [mode, setMode] = useState<"existing" | "new" | "block">(
    editingEvent && !editingEvent.customerId ? "block" : "existing"
  );
  const [customerId, setCustomerId] = useState(editingEvent?.customerId ?? defaultCustomerId ?? "");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [blockTitle, setBlockTitle] = useState(editingEvent?.title ?? "");
  const [eventDate, setEventDate] = useState(editingEvent?.eventDate?.slice(0, 10) ?? defaultDate ?? "");
  const [eventType, setEventType] = useState(editingEvent?.eventType ?? "");
  const [venue, setVenue] = useState(editingEvent?.venue ?? "");
  const [city, setCity] = useState(editingEvent?.city ?? "");
  const [status, setStatus] = useState<EventStatus>(editingEvent?.status ?? "tentative");
  const [message, setMessage] = useState(editingEvent?.message ?? "");

  const [price, setPrice] = useState(editingEvent?.price?.toString() ?? "");
  const [vatAmount, setVatAmount] = useState(editingEvent?.vatAmount?.toString() ?? "");
  const [commissionPercent, setCommissionPercent] = useState(editingEvent?.commissionPercent?.toString() ?? "");
  const [closingProbability, setClosingProbability] = useState(editingEvent?.closingProbability?.toString() ?? "");
  const [closedBy, setClosedBy] = useState(editingEvent?.closedBy ?? "");

  const [nextFollowUpDate, setNextFollowUpDate] = useState(editingEvent?.nextFollowUpDate?.slice(0, 10) ?? "");
  const [contactedBy, setContactedBy] = useState(editingEvent?.contactedBy ?? "");
  const [callNotes, setCallNotes] = useState(editingEvent?.callNotes ?? "");
  const [lastContactedAt, setLastContactedAt] = useState(editingEvent?.lastContactedAt ?? null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((res) => res.json())
      .then((data) => setCustomers(data.customers ?? []));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "existing" && !customerId) {
      setError("בחרו לקוח קיים");
      return;
    }
    if (mode === "new" && (!newName.trim() || !newPhone.trim())) {
      setError("יש להזין שם וטלפון ללקוח חדש");
      return;
    }
    if (mode === "block" && !blockTitle.trim()) {
      setError("יש להזין כותרת לחסימת התאריך");
      return;
    }

    setSaving(true);
    const payload = {
      customerId: mode === "existing" ? customerId : undefined,
      newCustomer: mode === "new" ? { fullName: newName, phone: newPhone } : undefined,
      title: mode === "block" ? blockTitle : undefined,
      eventDate: eventDate || null,
      eventType: eventType || undefined,
      venue: venue || undefined,
      city: city || undefined,
      status,
      message: message || undefined,
      price: price === "" ? null : Number(price),
      vatAmount: vatAmount === "" ? null : Number(vatAmount),
      commissionPercent: commissionPercent === "" ? null : Number(commissionPercent),
      closingProbability: closingProbability === "" ? null : Number(closingProbability),
      closedBy: closedBy || null,
      nextFollowUpDate: nextFollowUpDate || null,
      contactedBy: contactedBy || null,
      callNotes: callNotes || null,
      lastContactedAt,
    };

    const res = editingEvent
      ? await fetch(`/api/admin/events/${editingEvent.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/admin/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    setSaving(false);
    if (res.ok) {
      onSaved();
      onClose();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "שגיאה בשמירה");
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button aria-label="סגור" className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-charcoal-line bg-ink-soft p-6">
        <h2 className="font-display text-lg font-bold text-paper">
          {editingEvent ? "עריכת אירוע" : "אירוע חדש"}
        </h2>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          {!editingEvent?.customerId && (
            <div className="flex gap-2 rounded-xl border border-charcoal-line p-1 text-xs">
              {(["existing", "new", "block"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`flex-1 rounded-lg py-2 font-medium transition ${
                    mode === m ? "bg-champagne text-ink" : "text-paper-dim"
                  }`}
                >
                  {m === "existing" ? "לקוח קיים" : m === "new" ? "לקוח חדש" : "חסימת תאריך"}
                </button>
              ))}
            </div>
          )}

          {mode === "existing" && (
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className={inputClass}
            >
              <option value="">בחרו לקוח...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} — {c.phone}
                </option>
              ))}
            </select>
          )}

          {mode === "new" && (
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="שם מלא"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className={inputClass}
              />
              <input
                type="tel"
                placeholder="טלפון"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className={inputClass}
              />
            </div>
          )}

          {mode === "block" && (
            <input
              type="text"
              placeholder="לדוגמה: לא זמין — חופשה"
              value={blockTitle}
              onChange={(e) => setBlockTitle(e.target.value)}
              className={inputClass}
            />
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-paper-dim">תאריך</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-paper-dim">סטטוס</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as EventStatus)} className={inputClass}>
                {Object.entries(EVENT_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {mode !== "block" && (
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="סוג אירוע"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className={inputClass}
              />
              <input
                type="text"
                placeholder="עיר"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={inputClass}
              />
            </div>
          )}

          {mode !== "block" && (
            <input
              type="text"
              placeholder="מקום / אולם"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className={inputClass}
            />
          )}

          <textarea
            placeholder="הערות"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className={inputClass}
          />

          {mode !== "block" && (
            <>
              <div className="border-t border-charcoal-line pt-4">
                <p className="mb-3 text-xs font-semibold text-paper-dim">פרטי עסקה</p>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="מחיר (₪)">
                    <input
                      type="number"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="מע״מ (₪)">
                    <input
                      type="number"
                      min="0"
                      value={vatAmount}
                      onChange={(e) => setVatAmount(e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="אחוז עמלה">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={commissionPercent}
                      onChange={(e) => setCommissionPercent(e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="% קרוב לסגירה">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={closingProbability}
                      onChange={(e) => setClosingProbability(e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                </div>
                <div className="mt-3">
                  <Field label="מי סגר">
                    <input
                      type="text"
                      value={closedBy}
                      onChange={(e) => setClosedBy(e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                </div>
              </div>

              <div className="border-t border-charcoal-line pt-4">
                <p className="mb-3 text-xs font-semibold text-paper-dim">מעקב ושיחות</p>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="מעקב הבא">
                    <input
                      type="date"
                      value={nextFollowUpDate}
                      onChange={(e) => setNextFollowUpDate(e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="מי דיבר">
                    <input
                      type="text"
                      value={contactedBy}
                      onChange={(e) => setContactedBy(e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                </div>
                <div className="mt-3">
                  <Field label="סיכום שיחה">
                    <textarea
                      value={callNotes}
                      onChange={(e) => setCallNotes(e.target.value)}
                      rows={2}
                      className={inputClass}
                    />
                  </Field>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setLastContactedAt(new Date().toISOString())}
                    className="rounded-full border border-charcoal-line px-4 py-2 text-xs text-paper transition hover:border-champagne hover:text-champagne"
                  >
                    ✓ סמן שדיברנו עכשיו
                  </button>
                  {lastContactedAt && (
                    <span className="text-xs text-paper-dim">
                      נוצר קשר לאחרונה: {new Date(lastContactedAt).toLocaleDateString("he-IL")}
                    </span>
                  )}
                </div>
              </div>
            </>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-charcoal-line px-5 py-2.5 text-sm text-paper-dim"
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-champagne px-6 py-2.5 text-sm font-semibold text-ink disabled:opacity-50"
            >
              {saving ? "שומר..." : "שמירה"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactElement<{ id?: string }>;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs text-paper-dim">
        {label}
      </label>
      {cloneElement(children, { id })}
    </div>
  );
}
