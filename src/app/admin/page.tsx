"use client";

import { useState } from "react";
import CalendarTab from "@/components/admin/CalendarTab";
import LeadsTable from "@/components/admin/LeadsTable";
import SuppliersTab from "@/components/admin/SuppliersTab";

export default function AdminDashboard() {
  const [tab, setTab] = useState<"crm" | "calendar" | "suppliers">("crm");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2 border-b border-charcoal-line">
        <TabButton active={tab === "crm"} onClick={() => setTab("crm")}>
          CRM
        </TabButton>
        <TabButton active={tab === "calendar"} onClick={() => setTab("calendar")}>
          יומן
        </TabButton>
        <TabButton active={tab === "suppliers"} onClick={() => setTab("suppliers")}>
          ספקים
        </TabButton>
      </div>

      {tab === "crm" ? <LeadsTable /> : tab === "calendar" ? <CalendarTab /> : <SuppliersTab />}
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
