"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  poster?: string;
  title: string;
}

export default function VideoModal({ isOpen, onClose, src, poster, title }: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    videoRef.current?.play().catch(() => {});
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <button
            aria-label="סגירת נגן הווידאו"
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-4xl overflow-hidden rounded-2xl border border-charcoal-line bg-ink shadow-2xl"
          >
            <button
              onClick={onClose}
              aria-label="סגור"
              className="absolute left-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-ink/70 text-paper backdrop-blur transition hover:bg-champagne hover:text-ink"
            >
              ✕
            </button>
            <video
              ref={videoRef}
              src={src}
              poster={poster}
              controls
              playsInline
              className="aspect-video w-full bg-black"
            >
              הדפדפן שלכם לא תומך בהצגת וידאו.
            </video>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
