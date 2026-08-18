"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import VideoModal from "./VideoModal";
import { trackEvent } from "@/lib/analytics";

export default function Showreel() {
  const [open, setOpen] = useState(false);

  return (
    <section id="showreel" className="relative bg-ink py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="mb-10 max-w-2xl"
        >
          <p className="mb-3 text-sm font-semibold tracking-[0.3em] text-champagne uppercase">Showreel</p>
          <h2 className="font-display text-3xl font-bold text-paper sm:text-5xl">
            ככה זה מרגיש כשהאירוע הופך להופעה.
          </h2>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          onClick={() => {
            setOpen(true);
            trackEvent("video_played", { source: "showreel" });
          }}
          className="group relative block aspect-video w-full overflow-hidden rounded-3xl border border-charcoal-line"
        >
          <Image
            src="/tal/portraits/night-birdman-neon-sax.jpg"
            alt="טל ראופמן בלילה עם סקסופון, תאורת ניאון"
            fill
            sizes="100vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-full border border-paper/40 bg-ink/50 backdrop-blur-md transition group-hover:scale-110 group-hover:bg-champagne">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-7 w-7 -translate-x-[-2px] text-paper transition group-hover:text-ink"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </div>
          <span className="absolute bottom-5 right-5 text-sm font-medium text-paper-dim">לצפייה מלאה</span>
        </motion.button>
      </div>

      <VideoModal
        isOpen={open}
        onClose={() => setOpen(false)}
        src="/tal/video/showreel.mp4"
        poster="/tal/portraits/night-birdman-neon-sax.jpg"
        title="Showreel — טל ראופמן"
      />
    </section>
  );
}
