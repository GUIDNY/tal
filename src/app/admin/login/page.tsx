"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError("סיסמה שגויה");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-5">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-3xl border border-charcoal-line bg-ink-soft p-8"
      >
        <h1 className="font-display text-xl font-bold text-paper">כניסת מנהל</h1>
        <p className="mt-1 text-sm text-paper-dim">לוח הבקרה של טל ראופמן</p>

        <div className="mt-6 flex flex-col gap-2">
          <label htmlFor="password" className="text-sm font-medium text-paper-dim">
            סיסמה
          </label>
          <input
            id="password"
            type="password"
            required
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-charcoal-line bg-ink px-4 py-3 text-paper outline-none transition focus:border-champagne"
          />
        </div>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-champagne px-6 py-3 text-sm font-semibold text-ink transition hover:bg-champagne-soft disabled:opacity-50"
        >
          {loading ? "מתחבר..." : "כניסה"}
        </button>
      </form>
    </div>
  );
}
