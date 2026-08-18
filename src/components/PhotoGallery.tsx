"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import ImageLightbox, { type GalleryImage } from "./ImageLightbox";
import { trackEvent } from "@/lib/analytics";

const images: GalleryImage[] = [
  {
    src: "/tal/portraits/street-joy-arms-out-sax.jpg",
    alt: "טל ראופמן צוהל ברחוב עם סקסופון, ידיים פרושות",
    width: 1599,
    height: 2400,
  },
  {
    src: "/tal/portraits/night-birdman-neon-sax.jpg",
    alt: "טל ראופמן בלילה עם סקסופון מול שלטי ניאון",
    width: 1599,
    height: 2400,
  },
  {
    src: "/tal/portraits/portrait-studio-smile.jpg",
    alt: "טל ראופמן מחייך בסטודיו עם תאורה חמה",
    width: 2400,
    height: 1600,
  },
  {
    src: "/tal/portraits/portrait-studio-sax-orange.jpg",
    alt: "טל ראופמן, פורטרט קרוב עם סקסופון",
    width: 1600,
    height: 2400,
  },
  {
    src: "/tal/portraits/street-electra-palace-side.jpg",
    alt: "טל ראופמן הולך ברחוב עם סקסופון, צילום צד",
    width: 2400,
    height: 1599,
  },
  {
    src: "/tal/portraits/street-walking-sax-athens.jpg",
    alt: "טל ראופמן צוחק ברחוב עם סקסופון ביד",
    width: 1599,
    height: 2400,
  },
];

export default function PhotoGallery() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section id="gallery" className="relative bg-ink py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="mb-12 max-w-2xl"
        >
          <p className="mb-3 text-sm font-semibold tracking-[0.3em] text-champagne uppercase">Gallery</p>
          <h2 className="font-display text-3xl font-bold text-paper sm:text-5xl">
            מוזיקה שמרגישים גם אחרי שהאירוע נגמר.
          </h2>
        </motion.div>

        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
          {images.map((image, i) => (
            <motion.button
              key={image.src}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
              onClick={() => {
                setActiveIndex(i);
                trackEvent("gallery_opened", { index: i });
              }}
              className="group relative block w-full overflow-hidden rounded-2xl"
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-ink/0 transition group-hover:bg-ink/10" />
            </motion.button>
          ))}
        </div>
      </div>

      <ImageLightbox
        images={images}
        index={activeIndex}
        onClose={() => setActiveIndex(null)}
        onNavigate={setActiveIndex}
      />
    </section>
  );
}
