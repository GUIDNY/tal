export type EventType = "חתונה" | "אירוע עסקי" | "אירוע פרטי" | "פסטיבל / מועדון" | "אחר";

export type GuestCount = "עד 100" | "100-200" | "200-400" | "400+" | "לא סגור עדיין";

export type ServiceType = "DJ" | "DJ + סקסופון לייב" | "סקסופון בלבד" | "לא בטוחים / בואו נדבר";

export interface BookingData {
  eventType: EventType | null;
  eventDate: string; // ISO yyyy-mm-dd, may be empty if not decided
  venue: string;
  city: string;
  guestCount: GuestCount | null;
  serviceType: ServiceType | null;
  fullName: string;
  phone: string;
  email: string;
  message: string;
}

export const emptyBooking: BookingData = {
  eventType: null,
  eventDate: "",
  venue: "",
  city: "",
  guestCount: null,
  serviceType: null,
  fullName: "",
  phone: "",
  email: "",
  message: "",
};
