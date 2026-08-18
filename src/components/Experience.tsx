"use client";

import { motion } from "motion/react";

const pillars = [
  {
    tag: "01",
    title: "DJ",
    text: "מוזיקה שנבנית סביב האנרגיה של הקהל — לא פלייליסט קבוע, אלא קריאה של הרגע.",
  },
  {
    tag: "02",
    title: "LIVE SAX",
    text: "סקסופון חי שנכנס בדיוק ברגעים שבהם הרחבה צריכה עוד שכבה של אנרגיה.",
  },
  {
    tag: "03",
    title: "SHOW",
    text: "נוכחות במה, אינטראקציה וקשר עם הקהל — לא עומדים מאחורי הקונסולה, נמצאים בתוך האירוע.",
  },
  {
    tag: "04",
    title: "ONE EXPERIENCE",
    text: "DJ וסקסופון כחוויה אחת, לא כשתי הופעות נפרדות שמישהו הרכיב יחד.",
  },
];

export default function Experience() {
  return (
    <section className="relative bg-ink py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="mb-14 max-w-2xl"
        >
          <p className="mb-3 text-sm font-semibold tracking-[0.3em] text-champagne uppercase">
            The Experience
          </p>
          <h2 className="font-display text-3xl font-bold text-paper sm:text-5xl">
            לא עוד פלייליסט. הופעה.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-charcoal-line bg-charcoal-line sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="flex flex-col gap-4 bg-charcoal p-8"
            >
              <span className="font-display text-sm text-champagne">{pillar.tag}</span>
              <h3 className="font-display text-2xl font-bold text-paper">{pillar.title}</h3>
              <p className="text-sm leading-relaxed text-paper-dim">{pillar.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
