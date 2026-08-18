"use client";

import { motion } from "motion/react";
import { useBooking } from "./BookingProvider";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/analytics";

export default function CTASection() {
  const { openBooking } = useBooking();

  return (
    <section id="contact" className="relative bg-charcoal py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="font-display text-3xl font-bold text-paper sm:text-5xl"
        >
          האירוע שלכם יכול להיראות ככה.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mx-auto mt-4 max-w-lg text-lg text-paper-dim"
        >
          כמה פרטים על התאריך והמקום, ונחזור אליכם עם כל האפשרויות.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <button
            onClick={openBooking}
            className="rounded-full bg-champagne px-8 py-4 text-sm font-semibold text-ink transition hover:bg-champagne-soft"
          >
            בדיקת זמינות
          </button>
          <a
            href={buildWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("whatsapp_clicked", { source: "cta-section" })}
            className="rounded-full border border-paper/30 px-8 py-4 text-sm font-semibold text-paper transition hover:border-champagne hover:text-champagne"
          >
            שיחה בוואטסאפ
          </a>
        </motion.div>
      </div>
    </section>
  );
}
