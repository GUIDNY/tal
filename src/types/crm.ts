export type EventStatus = "lead" | "tentative" | "confirmed" | "completed" | "cancelled";

export interface EventRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  customerId: string | null;
  customer?: { id: string; fullName: string; phone: string } | null;
  title: string | null;
  eventType: string | null;
  eventDate: string | null;
  venue: string | null;
  city: string | null;
  guestCount: string | null;
  serviceType: string | null;
  message: string | null;
  status: EventStatus;
  source: string;
  color: string | null;
}

export interface CustomerRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  fullName: string;
  phone: string;
  email: string | null;
  notes: string | null;
  events: EventRecord[];
}

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  lead: "פנייה חדשה",
  tentative: "בהמתנה",
  confirmed: "מאושר",
  completed: "בוצע",
  cancelled: "בוטל",
};

export const EVENT_STATUS_COLORS: Record<EventStatus, string> = {
  lead: "bg-champagne/20 text-champagne",
  tentative: "bg-ember/20 text-ember",
  confirmed: "bg-teal/20 text-teal",
  completed: "bg-green-500/20 text-green-400",
  cancelled: "bg-paper-dim/20 text-paper-dim",
};

export const EVENT_STATUS_DOT: Record<EventStatus, string> = {
  lead: "bg-champagne",
  tentative: "bg-ember",
  confirmed: "bg-teal",
  completed: "bg-green-500",
  cancelled: "bg-paper-dim",
};
