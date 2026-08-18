"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { siteConfig } from "@/lib/site-config";
import { trackEvent } from "@/lib/analytics";

const cards = [
  "/tal/portraits/street-walking-sax-athens.jpg",
  "/tal/portraits/portrait-studio-smile.jpg",
  "/tal/portraits/street-electra-palace-side.jpg",
];

export default function SocialSection() {
  return (
    <section className="relative bg-ink py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="mb-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end"
        >
          <div className="max-w-xl">
            <p className="mb-3 text-sm font-semibold tracking-[0.3em] text-champagne uppercase">Follow</p>
            <h2 className="font-display text-3xl font-bold text-paper sm:text-5xl">
              רוצים לראות מה קורה באמת ברחבה?
            </h2>
          </div>
          <a
            href={siteConfig.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("instagram_clicked", { source: "social-section" })}
            className="shrink-0 rounded-full border border-paper/30 px-6 py-3 text-sm font-semibold text-paper transition hover:border-champagne hover:text-champagne"
          >
            עקבו באינסטגרם ←
          </a>
        </motion.div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {cards.map((src, i) => (
            <motion.a
              key={src}
              href={siteConfig.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("instagram_clicked", { source: "social-grid" })}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative aspect-square overflow-hidden rounded-2xl"
            >
              <Image
                src={src}
                alt="תמונה מאינסטגרם של טל ראופמן"
                fill
                sizes="(min-width: 640px) 33vw, 33vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition group-hover:bg-ink/40 group-hover:opacity-100">
                <span className="text-2xl">📸</span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
