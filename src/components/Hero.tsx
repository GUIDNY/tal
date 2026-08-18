"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useBooking } from "./BookingProvider";

export default function Hero() {
  const { openBooking } = useBooking();

  return (
    <section id="home" className="relative flex h-[100svh] min-h-[640px] w-full items-end overflow-hidden bg-ink">
      <div className="absolute inset-0">
        <Image
          src="/tal/portraits/street-joy-arms-out-sax.jpg"
          alt="טל ראופמן עם סקסופון ברחוב, מחייך ומלא אנרגיה"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[65%_20%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/10" />
        <div className="absolute inset-0 bg-gradient-to-l from-ink/70 via-transparent to-transparent" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/70 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-10 pt-28 sm:px-8 sm:pb-32 sm:pt-40">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mb-4 text-sm font-semibold tracking-[0.3em] text-champagne uppercase"
        >
          DJ &middot; Saxophone &middot; Live
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-3xl font-display text-5xl font-extrabold leading-[1.05] text-paper sm:text-6xl md:text-7xl"
        >
          לא רק מוזיקה.
          <br />
          <span className="text-champagne">חוויה שחיה על הבמה.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mt-6 max-w-lg text-lg text-paper-dim"
        >
          DJ וסקסופון לייב לחתונות, אירועים ופסטיבלים בארץ ובעולם.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <button
            onClick={openBooking}
            className="rounded-full bg-champagne px-8 py-4 text-sm font-semibold text-ink transition hover:bg-champagne-soft"
          >
            בדיקת זמינות לאירוע
          </button>
          <a
            href="#showreel"
            className="rounded-full border border-paper/30 px-8 py-4 text-sm font-semibold text-paper transition hover:border-champagne hover:text-champagne"
          >
            צפו בהופעות
          </a>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 sm:flex"
        aria-hidden="true"
      >
        <span className="text-[10px] tracking-[0.3em] text-paper-dim uppercase">Scroll</span>
        <div className="h-10 w-[1.5px] overflow-hidden bg-paper/20">
          <div className="h-full w-full animate-[fade-up_1.6s_ease-in-out_infinite] bg-champagne" />
        </div>
      </motion.div>
    </section>
  );
}
