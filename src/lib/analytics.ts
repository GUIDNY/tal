/**
 * Lightweight analytics event hooks. No analytics provider is wired up yet —
 * this just pushes to window.dataLayer (GTM-compatible) when it exists, and
 * no-ops otherwise, so a real provider can be dropped in later without
 * touching call sites.
 */

export type AnalyticsEvent =
  | "booking_started"
  | "booking_step_completed"
  | "booking_completed"
  | "whatsapp_clicked"
  | "phone_clicked"
  | "instagram_clicked"
  | "video_played"
  | "gallery_opened";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function trackEvent(event: AnalyticsEvent, payload: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...payload });
}
