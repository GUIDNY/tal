"use client";

import { useState } from "react";
import CalendarTab from "@/components/admin/CalendarTab";
import LeadsTable from "@/components/admin/LeadsTable";

export default function AdminDashboard() {
  const [tab, setTab] = useState<"crm" | "calendar">("crm");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2 border-b border-charcoal-line">
        <TabButton active={tab === "crm"} onClick={() => setTab("crm")}>
          CRM
        </TabButton>
        <TabButton active={tab === "calendar"} onClick={() => setTab("calendar")}>
          יומן
        </TabButton>
      </div>

      {tab === "crm" ? <LeadsTable /> : <CalendarTab />}
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
