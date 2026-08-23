"use client";

import { useCallback, useEffect, useState } from "react";
import type { SupplierRecord, SupplierStatus } from "@/types/supplier";
import { SUPPLIER_STATUS_COLORS, SUPPLIER_STATUS_LABELS } from "@/types/supplier";

const inputClass =
  "w-full rounded-xl border border-charcoal-line bg-ink px-3 py-2.5 text-sm text-paper outline-none transition focus:border-champagne";

export default function SuppliersTab() {
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SupplierRecord | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/suppliers");
    if (res.ok) {
      const data = await res.json();
      setSuppliers(data.suppliers);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // setSuppliers happens after the awaited fetch resolves, not synchronously during this effect run.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-paper">ספקים</h3>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-xl bg-champagne px-4 py-2 text-sm font-semibold text-ink"
        >
          + ספק
        </button>
      </div>

      {loading ? (
        <p className="text-paper-dim">טוען...</p>
      ) : suppliers.length === 0 ? (
        <p className="rounded-2xl border border-charcoal-line bg-ink-soft p-8 text-center text-paper-dim">
          אין ספקים להצגה.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-charcoal-line">
          <table className="w-full min-w-[600px] text-right text-sm">
            <thead>
              <tr className="border-b border-charcoal-line bg-ink-soft text-xs text-paper-dim">
                <th className="px-4 py-3 font-medium">שם</th>
                <th className="px-4 py-3 font-medium">טלפון</th>
                <th className="px-4 py-3 font-medium">מי זה</th>
                <th className="px-4 py-3 font-medium">מצב</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => setEditing(s)}
                  className="cursor-pointer border-b border-charcoal-line bg-ink-soft transition last:border-0 hover:bg-charcoal"
                >
                  <td className="px-4 py-3 font-medium text-paper">{s.fullName}</td>
                  <td className="px-4 py-3 text-paper-dim" dir="ltr">
                    {s.phone}
                  </td>
                  <td className="px-4 py-3 text-paper-dim">{s.role ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${SUPPLIER_STATUS_COLORS[s.status]}`}>
                      {SUPPLIER_STATUS_LABELS[s.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && <SupplierFormModal onClose={() => setShowForm(false)} onSaved={load} />}
      {editing && (
        <SupplierFormModal key={editing.id} onClose={() => setEditing(null)} onSaved={load} editingSupplier={editing} />
      )}
    </div>
  );
}

function SupplierFormModal({
  onClose,
  onSaved,
  editingSupplier,
}: {
  onClose: () => void;
  onSaved: () => void;
  editingSupplier?: SupplierRecord;
}) {
  const [fullName, setFullName] = useState(editingSupplier?.fullName ?? "");
  const [phone, setPhone] = useState(editingSupplier?.phone ?? "");
  const [role, setRole] = useState(editingSupplier?.role ?? "");
  const [status, setStatus] = useState<SupplierStatus>(editingSupplier?.status ?? "active");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = { fullName, phone, role: role || null, status };
    const res = editingSupplier
      ? await fetch(`/api/admin/suppliers/${editingSupplier.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/admin/suppliers", {
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

  async function handleDelete() {
    if (!editingSupplier) return;
    if (!confirm(`למחוק את ${editingSupplier.fullName}?`)) return;
    setSaving(true);
    await fetch(`/api/admin/suppliers/${editingSupplier.id}`, { method: "DELETE" });
    setSaving(false);
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button aria-label="סגור" className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-sm rounded-3xl border border-charcoal-line bg-ink-soft p-6"
      >
        <h2 className="font-display text-lg font-bold text-paper">{editingSupplier ? "עריכת ספק" : "ספק חדש"}</h2>
        <div className="mt-5 flex flex-col gap-3">
          <input
            type="text"
            placeholder="שם"
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
            type="text"
            placeholder="מי זה (לדוגמה: צלם, טכנאי סאונד)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className={inputClass}
          />
          <select value={status} onChange={(e) => setStatus(e.target.value as SupplierStatus)} className={inputClass}>
            <option value="active">פעיל</option>
            <option value="pending">בבדיקה</option>
            <option value="inactive">לא פעיל</option>
          </select>
        </div>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        <div className="mt-5 flex items-center justify-between gap-3">
          {editingSupplier ? (
            <button
              type="button"
              onClick={handleDelete}
              className="text-sm text-red-400 transition hover:text-red-300"
            >
              מחיקה
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-3">
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
        </div>
      </form>
    </div>
  );
}
