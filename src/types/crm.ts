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

  // Deal / pipeline tracking
  price: number | null;
  vatAmount: number | null;
  commissionPercent: number | null;
  closingProbability: number | null;
  closedBy: string | null;

  // Follow-up / call tracking
  nextFollowUpDate: string | null;
  lastContactedAt: string | null;
  contactedBy: string | null;
  callNotes: string | null;
}

/** Slim shape used for the "existing customer" picker — the full profile (notes, event history) has no UI consumer right now. */
export interface CustomerOption {
  id: string;
  fullName: string;
  phone: string;
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

export type FollowUpUrgency = "overdue" | "soon" | "later" | "contacted" | "untouched";

const SOON_THRESHOLD_DAYS = 3;

/** Buckets a lead by how urgently it needs a call, for filtering/sorting the pipeline table. */
export function getFollowUpUrgency(event: Pick<EventRecord, "nextFollowUpDate" | "lastContactedAt">): FollowUpUrgency {
  if (event.nextFollowUpDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(event.nextFollowUpDate);
    const daysUntil = Math.round((due.getTime() - today.getTime()) / 86_400_000);
    if (daysUntil < 0) return "overdue";
    if (daysUntil <= SOON_THRESHOLD_DAYS) return "soon";
    return "later";
  }
  if (event.lastContactedAt) return "contacted";
  return "untouched";
}

export const FOLLOW_UP_LABELS: Record<FollowUpUrgency, string> = {
  overdue: "באיחור",
  soon: "קרוב לשיחה",
  later: "רחוק לשיחה",
  contacted: "כבר דיברנו",
  untouched: "ללא מעקב",
};

export const FOLLOW_UP_COLORS: Record<FollowUpUrgency, string> = {
  overdue: "bg-red-500/20 text-red-400",
  soon: "bg-ember/20 text-ember",
  later: "bg-teal/20 text-teal",
  contacted: "bg-green-500/20 text-green-400",
  untouched: "bg-paper-dim/20 text-paper-dim",
};
