"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { useBooking } from "./BookingProvider";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { openBooking } = useBooking();

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-ink/90 backdrop-blur-md shadow-[0_1px_0_0_var(--color-charcoal-line)]" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/#home" className="font-display text-lg font-bold tracking-tight text-paper">
          טל ראופמן
        </Link>

        <ul className="hidden items-center gap-8 lg:flex">
          {siteConfig.nav.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="text-sm text-paper-dim transition hover:text-champagne"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <button
            onClick={openBooking}
            className="hidden rounded-full bg-champagne px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-champagne-soft sm:block"
          >
            בדיקת זמינות
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full text-paper lg:hidden"
            aria-label={menuOpen ? "סגירת תפריט" : "פתיחת תפריט"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="sr-only">תפריט</span>
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="border-t border-charcoal-line bg-ink px-5 py-4 lg:hidden">
          <ul className="flex flex-col gap-4">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block text-base text-paper"
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  openBooking();
                }}
                className="mt-1 w-full rounded-full bg-champagne px-5 py-3 text-sm font-semibold text-ink"
              >
                בדיקת זמינות
              </button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
