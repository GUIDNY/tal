"use client";

import { useState } from "react";

interface ICloudSyncButtonProps {
  onSynced: () => void;
}

export default function ICloudSyncButton({ onSynced }: ICloudSyncButtonProps) {
  const [status, setStatus] = useState<"idle" | "syncing" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSync() {
    setStatus("syncing");
    setMessage(null);
    const res = await fetch("/api/admin/icloud-sync", { method: "POST" });
    const data = await res.json().catch(() => null);

    if (res.ok && data) {
      setStatus("done");
      setMessage(`יובאו ${data.imported} אירועים מ-${data.calendarsScanned} יומנים (${data.removed} הוסרו).`);
      onSynced();
    } else {
      setStatus("error");
      setMessage(data?.error ?? "שגיאה בסנכרון");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleSync}
        disabled={status === "syncing"}
        className="w-fit rounded-full border border-charcoal-line px-4 py-2 text-xs font-medium text-paper transition hover:border-champagne hover:text-champagne disabled:opacity-50"
      >
        {status === "syncing" ? "מסנכרן..." : "📱 סנכרון מהאייפון עכשיו"}
      </button>
      {message && (
        <p className={`text-xs ${status === "error" ? "text-red-400" : "text-paper-dim"}`}>{message}</p>
      )}
    </div>
  );
}
