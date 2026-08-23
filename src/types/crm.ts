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

export type DealStage = "all" | "closed" | "in_progress";

/** Groups the finer-grained EventStatus into the two buckets the pipeline table filters by. */
export function getDealStage(status: EventStatus): "closed" | "in_progress" | "other" {
  if (status === "confirmed" || status === "completed") return "closed";
  if (status === "lead" || status === "tentative") return "in_progress";
  return "other"; // cancelled — shown under "הכל" only
}

export const DEAL_STAGE_LABELS: Record<DealStage, string> = {
  all: "הכל",
  closed: "נסגר",
  in_progress: "בתהליך",
};

/** The two people who use this CRM — closedBy/contactedBy are constrained to these rather than free text. */
export const TEAM_MEMBERS = ["גינדי", "טל"] as const;
export type TeamMember = (typeof TEAM_MEMBERS)[number];
