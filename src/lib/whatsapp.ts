import { siteConfig, whatsappDefaultMessage } from "./site-config";
import type { BookingData } from "@/types/booking";

export function buildWhatsAppUrl(message: string = whatsappDefaultMessage) {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${siteConfig.contact.whatsappNumber}?text=${encoded}`;
}

export function buildBookingWhatsAppMessage(data: BookingData) {
  const lines = ["היי טל, מילאתי בדיקת זמינות באתר 🎷", ""];

  if (data.eventType) lines.push(`סוג אירוע: ${data.eventType}`);
  if (data.eventDate) lines.push(`תאריך: ${data.eventDate}`);
  if (data.city || data.venue) {
    lines.push(`מיקום: ${[data.venue, data.city].filter(Boolean).join(", ")}`);
  }
  if (data.guestCount) lines.push(`כמות אורחים: ${data.guestCount}`);
  if (data.serviceType) lines.push(`מה מחפשים: ${data.serviceType}`);
  if (data.fullName) lines.push(`שם: ${data.fullName}`);
  if (data.message) lines.push("", `פרטים נוספים: ${data.message}`);

  return lines.join("\n");
}

export function buildBookingWhatsAppUrl(data: BookingData) {
  return buildWhatsAppUrl(buildBookingWhatsAppMessage(data));
}
