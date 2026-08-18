"use client";

import { motion } from "motion/react";

export interface Testimonial {
  quote: string;
  name: string;
  role?: string;
}

/**
 * No real testimonials were supplied yet, so this array stays empty and the
 * section renders nothing rather than showing fabricated quotes. Add real
 * entries here — { quote, name, role } — once Tal has them, and the section
 * will appear automatically.
 */
const testimonials: Testimonial[] = [];

export default function Testimonials() {
  if (testimonials.length === 0) return null;

  return (
    <section className="relative bg-charcoal py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="mb-12 max-w-2xl"
        >
          <p className="mb-3 text-sm font-semibold tracking-[0.3em] text-champagne uppercase">
            מהאירוע שלהם
          </p>
          <h2 className="font-display text-3xl font-bold text-paper sm:text-5xl">
            אנשים זוכרים איך גרמת להם להרגיש.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-3xl border border-charcoal-line bg-ink p-8">
              <p className="text-lg leading-relaxed text-paper">&ldquo;{t.quote}&rdquo;</p>
              <p className="mt-6 text-sm font-semibold text-champagne">{t.name}</p>
              {t.role && <p className="text-xs text-paper-dim">{t.role}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
