/**
 * Central site configuration.
 *
 * ⚠️ PLACEHOLDER VALUES — replace before launch.
 * Everything marked TODO below is fake/placeholder data because real
 * contact details weren't available at build time. The rest of the site
 * pulls from this file, so updating it here updates it everywhere.
 */

export const siteConfig = {
  name: "Tal Raufman",
  nameHe: "טל ראופמן",
  tagline: "DJ & Saxophone Artist",
  taglineHe: "DJ ונגן סקסופון שהופך אירועים לחוויות",
  url: "https://talraufman.com", // TODO: replace with the real production domain
  locale: "he_IL",

  // TODO: replace with Tal's real contact details
  contact: {
    whatsappNumber: "972500000000", // international format, no leading +/0 — TODO
    phoneDisplay: "050-000-0000", // TODO
    email: "booking@talraufman.com", // TODO
  },

  social: {
    instagram: "https://instagram.com/talraufman", // TODO verify handle
    tiktok: "", // TODO — leave empty to hide the link
    youtube: "", // TODO — leave empty to hide the link
  },

  nav: [
    { label: "ראשי", href: "/#home" },
    { label: "טל", href: "/#about" },
    { label: "הופעות", href: "/#showreel" },
    { label: "גלריה", href: "/#gallery" },
    { label: "אירועים", href: "/#events" },
    { label: "יצירת קשר", href: "/#contact" },
  ],
} as const;

export const whatsappDefaultMessage =
  "שלום טל, הגעתי דרך האתר ואשמח לבדוק זמינות לאירוע 🎷";
