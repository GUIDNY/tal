"use client";

import { useEffect, useState } from "react";
import { useBooking } from "./BookingProvider";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/analytics";

export default function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);
  const { openBooking, isOpen } = useBooking();

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > window.innerHeight * 0.6);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (isOpen) return null;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 flex items-center gap-2 border-t border-charcoal-line bg-ink/95 p-3 backdrop-blur-md transition-transform duration-300 sm:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
    >
      <a
        href={buildWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent("whatsapp_clicked", { source: "sticky-mobile" })}
        aria-label="שיחה בוואטסאפ"
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-charcoal-line text-xl text-paper"
      >
        💬
      </a>
      <button
        onClick={openBooking}
        className="h-12 flex-1 rounded-full bg-champagne text-sm font-semibold text-ink"
      >
        בדיקת זמינות
      </button>
    </div>
  );
}
