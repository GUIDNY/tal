"use client";

import Image from "next/image";
import { motion } from "motion/react";

const stats = [
  { value: "+20", label: "שנות ניסיון" },
  { value: "ישראל + העולם", label: "אירועים ופסטיבלים" },
  { value: "DJ + Sax", label: "חוויה אחת על הבמה" },
];

export default function About() {
  return (
    <section id="about" className="relative bg-charcoal py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:items-center lg:gap-20">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="relative order-2 aspect-[4/5] w-full overflow-hidden rounded-3xl lg:order-1"
        >
          <Image
            src="/tal/portraits/portrait-studio-sax-orange.jpg"
            alt="טל ראופמן, פורטרט עם סקסופון"
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover"
          />
        </motion.div>

        <div className="order-1 lg:order-2">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-3 text-sm font-semibold tracking-[0.3em] text-champagne uppercase"
          >
            Raufman
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="font-display text-3xl font-bold leading-tight text-paper sm:text-4xl"
          >
            כשהסקסופון נכנס, משהו באירוע משתנה.
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-6 space-y-4 text-lg leading-relaxed text-paper-dim"
          >
            <p>
              טל ראופמן, DJ ונגן סקסופון עם מעל 20 שנות ניסיון על הבמה. במהלך השנים ניגן באינספור
              אירועים — מחתונות ואירועים פרטיים ועד מועדונים ופסטיבלים בארץ וברחבי העולם.
            </p>
            <p>
              משתף פעולה עם שמות מובילים בתעשיית המוזיקה בישראל, יוצר ומפיק מוזיקה, ומשלב בין DJ,
              סקסופון חי ואנרגיה של הופעה אמיתית. מוזיקה היא לא רק מה ששומעים — אלא מה שמרגישים.
            </p>
            <p className="font-medium text-paper">
              כל הופעה בנויה סביב הקהל, הרגע והאנרגיה באירוע — כדי להפוך כל במה לחוויה שאנשים לא שוכחים.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-10 grid grid-cols-3 gap-4 border-t border-charcoal-line pt-8"
          >
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-xl font-extrabold text-champagne sm:text-2xl">{stat.value}</p>
                <p className="mt-1 text-xs text-paper-dim sm:text-sm">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
