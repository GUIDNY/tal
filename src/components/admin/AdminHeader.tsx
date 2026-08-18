"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminHeader() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between border-b border-charcoal-line bg-ink-soft px-6 py-4">
      <p className="font-display text-lg font-bold text-paper">לוח בקרה — טל ראופמן</p>
      <button
        onClick={handleLogout}
        disabled={loggingOut}
        className="rounded-full border border-charcoal-line px-4 py-2 text-sm text-paper-dim transition hover:border-champagne hover:text-champagne disabled:opacity-50"
      >
        התנתקות
      </button>
    </header>
  );
}
