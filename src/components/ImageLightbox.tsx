"use client";

import { useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";

export interface GalleryImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

interface ImageLightboxProps {
  images: GalleryImage[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function ImageLightbox({ images, index, onClose, onNavigate }: ImageLightboxProps) {
  const isOpen = index !== null;
  const current = index !== null ? images[index] : null;

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && index !== null) onNavigate((index + 1) % images.length);
      if (e.key === "ArrowRight" && index !== null) onNavigate((index - 1 + images.length) % images.length);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, index, images.length, onClose, onNavigate]);

  return (
    <AnimatePresence>
      {isOpen && current && index !== null && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-label={current.alt}
        >
          <button
            aria-label="סגירת תצוגת תמונה"
            className="absolute inset-0 bg-black/95"
            onClick={onClose}
          />

          <button
            onClick={onClose}
            aria-label="סגור"
            className="absolute left-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-ink/70 text-paper backdrop-blur transition hover:bg-champagne hover:text-ink"
          >
            ✕
          </button>

          <button
            onClick={() => onNavigate((index + 1) % images.length)}
            aria-label="התמונה הקודמת"
            className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-ink/70 text-paper backdrop-blur transition hover:bg-champagne hover:text-ink"
          >
            ›
          </button>
          <button
            onClick={() => onNavigate((index - 1 + images.length) % images.length)}
            aria-label="התמונה הבאה"
            className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-ink/70 text-paper backdrop-blur transition hover:bg-champagne hover:text-ink"
          >
            ‹
          </button>

          <motion.div
            key={current.src}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="relative z-10 max-h-[88vh] max-w-[92vw]"
          >
            <Image
              src={current.src}
              alt={current.alt}
              width={current.width}
              height={current.height}
              sizes="92vw"
              className="max-h-[88vh] w-auto rounded-lg object-contain"
              priority
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
