"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useBooking } from "./BookingProvider";

const events = [
  {
    title: "חתונות",
    text: "חוויה מוזיקלית שנבנית סביב הזוג והקהל — מהחופה ועד הריקודים.",
    image: "/tal/portraits/street-joy-arms-out-sax.jpg",
  },
  {
    title: "אירועים עסקיים",
    text: "הופעה ברמה בינלאומית למותגים וחברות שרוצות רגע שנשאר בזיכרון.",
    image: "/tal/portraits/street-electra-palace-side.jpg",
  },
  {
    title: "אירועים פרטיים",
    text: "ימי הולדת, חגיגות משפחתיות ואירועים פרטיים ברמה גבוהה.",
    image: "/tal/portraits/portrait-studio-smile.jpg",
  },
  {
    title: "פסטיבלים ומועדונים",
    text: "אנרגיה גבוהה, קהל גדול ובמה שדורשת נוכחות אמיתית.",
    image: "/tal/portraits/night-birdman-neon-sax.jpg",
  },
];

export default function EventTypes() {
  const { openBooking } = useBooking();

  return (
    <section id="events" className="relative bg-charcoal py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="mb-14 max-w-2xl"
        >
          <p className="mb-3 text-sm font-semibold tracking-[0.3em] text-champagne uppercase">
            Where Tal Performs
          </p>
          <h2 className="font-display text-3xl font-bold text-paper sm:text-5xl">הרחבה היא הבמה.</h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {events.map((event, i) => (
            <motion.div
              key={event.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="group relative aspect-[4/3] overflow-hidden rounded-3xl"
            >
              <Image
                src={event.image}
                alt={event.title}
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7">
                <h3 className="font-display text-2xl font-bold text-paper">{event.title}</h3>
                <p className="mt-2 max-w-sm text-sm text-paper-dim">{event.text}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={openBooking}
            className="rounded-full bg-champagne px-8 py-4 text-sm font-semibold text-ink transition hover:bg-champagne-soft"
          >
            בדיקת זמינות לאירוע שלכם
          </button>
        </div>
      </div>
    </section>
  );
}
