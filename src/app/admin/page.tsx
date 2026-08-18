"use client";

import { useCallback, useEffect, useState } from "react";

type BookingStatus = "new" | "contacted" | "qualified" | "booked" | "lost";
type DateStatus = "hold" | "booked";

interface Booking {
  id: string;
  createdAt: string;
  fullName: string;
  phone: string;
  email: string | null;
  eventType: string;
  eventDate: string | null;
  venue: string | null;
  city: string;
  guestCount: string;
  serviceType: string;
  message: string | null;
  status: BookingStatus;
}

interface AvailabilityEntry {
  id: string;
  date: string;
  status: DateStatus;
  note: string | null;
}

const STATUS_LABELS: Record<BookingStatus, string> = {
  new: "חדש",
  contacted: "נוצר קשר",
  qualified: "מתקדם",
  booked: "סגור",
  lost: "אבד",
};

const STATUS_COLORS: Record<BookingStatus, string> = {
  new: "bg-champagne/20 text-champagne",
  contacted: "bg-teal/20 text-teal",
  qualified: "bg-ember/20 text-ember",
  booked: "bg-green-500/20 text-green-400",
  lost: "bg-paper-dim/20 text-paper-dim",
};

function formatDate(value: string | null) {
  if (!value) return "לא צוין";
  return new Date(value).toLocaleDateString("he-IL", { year: "numeric", month: "short", day: "numeric" });
}

export default function AdminDashboard() {
  const [tab, setTab] = useState<"bookings" | "availability">("bookings");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availability, setAvailability] = useState<AvailabilityEntry[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | BookingStatus>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadBookings = useCallback(async () => {
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (search) params.set("q", search);
    const res = await fetch(`/api/admin/bookings?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setBookings(data.bookings);
    }
  }, [statusFilter, search]);

  const loadAvailability = useCallback(async () => {
    const res = await fetch("/api/admin/availability");
    if (res.ok) {
      const data = await res.json();
      setAvailability(data.dates);
    }
  }, []);

  useEffect(() => {
    // setState happens inside the .finally callback after the awaited fetches resolve,
    // not synchronously during this effect run — the lint rule can't trace that through useCallback.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    Promise.all([loadBookings(), loadAvailability()]).finally(() => setLoading(false));
  }, [loadBookings, loadAvailability]);

  async function updateStatus(id: string, status: BookingStatus) {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex gap-2 border-b border-charcoal-line">
        <TabButton active={tab === "bookings"} onClick={() => setTab("bookings")}>
          פניות {bookings.length > 0 && `(${bookings.length})`}
        </TabButton>
        <TabButton active={tab === "availability"} onClick={() => setTab("availability")}>
          זמינות
        </TabButton>
      </div>

      {loading ? (
        <p className="text-paper-dim">טוען...</p>
      ) : tab === "bookings" ? (
        <BookingsTab
          bookings={bookings}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          search={search}
          setSearch={setSearch}
          expandedId={expandedId}
          setExpandedId={setExpandedId}
          updateStatus={updateStatus}
        />
      ) : (
        <AvailabilityTab entries={availability} reload={loadAvailability} />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`border-b-2 px-4 py-3 text-sm font-medium transition ${
        active ? "border-champagne text-champagne" : "border-transparent text-paper-dim hover:text-paper"
      }`}
    >
      {children}
    </button>
  );
}

function BookingsTab({
  bookings,
  statusFilter,
  setStatusFilter,
  search,
  setSearch,
  expandedId,
  setExpandedId,
  updateStatus,
}: {
  bookings: Booking[];
  statusFilter: "all" | BookingStatus;
  setStatusFilter: (s: "all" | BookingStatus) => void;
  search: string;
  setSearch: (s: string) => void;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  updateStatus: (id: string, status: BookingStatus) => void;
}) {
  const filters: Array<"all" | BookingStatus> = ["all", "new", "contacted", "qualified", "booked", "lost"];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                statusFilter === f
                  ? "border-champagne bg-champagne/10 text-champagne"
                  : "border-charcoal-line text-paper-dim hover:text-paper"
              }`}
            >
              {f === "all" ? "הכל" : STATUS_LABELS[f]}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="חיפוש לפי שם, טלפון או עיר..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-charcoal-line bg-ink-soft px-4 py-2 text-sm text-paper outline-none focus:border-champagne sm:w-64"
        />
      </div>

      {bookings.length === 0 ? (
        <p className="rounded-2xl border border-charcoal-line bg-ink-soft p-8 text-center text-paper-dim">
          אין פניות להצגה.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {bookings.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              expanded={expandedId === b.id}
              onToggle={() => setExpandedId(expandedId === b.id ? null : b.id)}
              onStatusChange={(status) => updateStatus(b.id, status)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BookingCard({
  booking,
  expanded,
  onToggle,
  onStatusChange,
}: {
  booking: Booking;
  expanded: boolean;
  onToggle: () => void;
  onStatusChange: (status: BookingStatus) => void;
}) {
  const waHref = `https://wa.me/${booking.phone.replace(/\D/g, "")}`;

  return (
    <div className="rounded-2xl border border-charcoal-line bg-ink-soft">
      <button onClick={onToggle} className="flex w-full flex-wrap items-center gap-3 px-5 py-4 text-right">
        <span className="font-semibold text-paper">{booking.fullName}</span>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[booking.status]}`}>
          {STATUS_LABELS[booking.status]}
        </span>
        <span className="text-sm text-paper-dim">{booking.eventType}</span>
        <span className="text-sm text-paper-dim">{formatDate(booking.eventDate)}</span>
        <span className="text-sm text-paper-dim">{booking.city}</span>
        <span className="ms-auto text-xs text-paper-dim">{formatDate(booking.createdAt)}</span>
      </button>

      {expanded && (
        <div className="border-t border-charcoal-line px-5 py-4">
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <Detail label="טלפון" value={booking.phone} />
            <Detail label="אימייל" value={booking.email ?? "לא צוין"} />
            <Detail label="מקום" value={booking.venue ?? "לא צוין"} />
            <Detail label="כמות אורחים" value={booking.guestCount} />
            <Detail label="שירות מבוקש" value={booking.serviceType} />
          </dl>
          {booking.message && (
            <p className="mt-3 rounded-xl bg-ink p-3 text-sm text-paper-dim">{booking.message}</p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={`tel:${booking.phone}`}
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
            {booking.email && (
              <a
                href={`mailto:${booking.email}`}
                className="rounded-full border border-charcoal-line px-4 py-2 text-xs text-paper transition hover:border-champagne hover:text-champagne"
              >
                ✉️ אימייל
              </a>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-charcoal-line pt-4">
            {(Object.keys(STATUS_LABELS) as BookingStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => onStatusChange(s)}
                disabled={booking.status === s}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition disabled:cursor-default ${
                  booking.status === s ? STATUS_COLORS[s] : "border border-charcoal-line text-paper-dim hover:text-paper"
                }`}
              >
                סמן כ{STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-paper-dim">{label}</dt>
      <dd className="text-paper">{value}</dd>
    </div>
  );
}

function AvailabilityTab({ entries, reload }: { entries: AvailabilityEntry[]; reload: () => void }) {
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<DateStatus>("booked");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date) return;
    setSaving(true);
    await fetch("/api/admin/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, status, note }),
    });
    setDate("");
    setNote("");
    setSaving(false);
    reload();
  }

  async function freeDate(entryDate: string) {
    await fetch("/api/admin/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: entryDate, status: "available" }),
    });
    reload();
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap items-end gap-3 rounded-2xl border border-charcoal-line bg-ink-soft p-5"
      >
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-paper-dim">תאריך</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl border border-charcoal-line bg-ink px-3 py-2 text-sm text-paper outline-none focus:border-champagne"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-paper-dim">סטטוס</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as DateStatus)}
            className="rounded-xl border border-charcoal-line bg-ink px-3 py-2 text-sm text-paper outline-none focus:border-champagne"
          >
            <option value="hold">בהמתנה (Hold)</option>
            <option value="booked">תפוס</option>
          </select>
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <label className="text-xs text-paper-dim">הערה (לא חובה)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="לדוגמה: חתונת כהן"
            className="w-full rounded-xl border border-charcoal-line bg-ink px-3 py-2 text-sm text-paper outline-none focus:border-champagne"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-champagne px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-champagne-soft disabled:opacity-50"
        >
          עדכון
        </button>
      </form>

      {entries.length === 0 ? (
        <p className="rounded-2xl border border-charcoal-line bg-ink-soft p-8 text-center text-paper-dim">
          כל התאריכים פנויים.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-charcoal-line bg-ink-soft px-4 py-3"
            >
              <span className="font-medium text-paper">{formatDate(entry.date)}</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  entry.status === "booked" ? "bg-red-500/20 text-red-400" : "bg-ember/20 text-ember"
                }`}
              >
                {entry.status === "booked" ? "תפוס" : "בהמתנה"}
              </span>
              {entry.note && <span className="text-sm text-paper-dim">{entry.note}</span>}
              <button
                onClick={() => freeDate(entry.date)}
                className="ms-auto rounded-full border border-charcoal-line px-3.5 py-1.5 text-xs text-paper-dim transition hover:border-champagne hover:text-champagne"
              >
                פנה תאריך
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
