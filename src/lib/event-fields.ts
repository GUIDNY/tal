import type { Prisma } from "@/generated/prisma/client";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function toInt(value: unknown): number | null {
  if (value === null || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? Math.round(n) : null;
}

function toFloat(value: unknown): number | null {
  if (value === null || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * Parses the deal-value / follow-up-tracking fields shared by event creation and updates.
 * Only fields actually present as keys on `body` are included, so PATCH can update a
 * subset without clobbering the rest.
 */
export function parsePipelineFields(
  body: Record<string, unknown>
): Partial<Prisma.EventUncheckedCreateInput> {
  const data: Partial<Prisma.EventUncheckedCreateInput> = {};

  if ("price" in body) data.price = toInt(body.price);
  if ("vatAmount" in body) data.vatAmount = toInt(body.vatAmount);
  if ("commissionPercent" in body) data.commissionPercent = toFloat(body.commissionPercent);
  if ("closingProbability" in body) {
    const n = toInt(body.closingProbability);
    data.closingProbability = n === null ? null : Math.min(100, Math.max(0, n));
  }
  if ("closedBy" in body) data.closedBy = isNonEmptyString(body.closedBy) ? body.closedBy.trim() : null;
  if ("nextFollowUpDate" in body) {
    data.nextFollowUpDate =
      isNonEmptyString(body.nextFollowUpDate) && !Number.isNaN(Date.parse(body.nextFollowUpDate))
        ? new Date(body.nextFollowUpDate)
        : null;
  }
  if ("contactedBy" in body) data.contactedBy = isNonEmptyString(body.contactedBy) ? body.contactedBy.trim() : null;
  if ("callNotes" in body) data.callNotes = isNonEmptyString(body.callNotes) ? body.callNotes.trim() : null;

  // Marking who spoke stamps "now" as the last-contacted time, unless the caller sends an explicit one.
  if ("markContactedNow" in body && body.markContactedNow === true) {
    data.lastContactedAt = new Date();
  } else if ("lastContactedAt" in body) {
    data.lastContactedAt =
      isNonEmptyString(body.lastContactedAt) && !Number.isNaN(Date.parse(body.lastContactedAt))
        ? new Date(body.lastContactedAt)
        : null;
  }

  return data;
}
