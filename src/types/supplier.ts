export type SupplierStatus = "active" | "pending" | "inactive";

export interface SupplierRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  fullName: string;
  phone: string;
  role: string | null;
  status: SupplierStatus;
}

export const SUPPLIER_STATUS_LABELS: Record<SupplierStatus, string> = {
  active: "פעיל",
  pending: "בבדיקה",
  inactive: "לא פעיל",
};

export const SUPPLIER_STATUS_COLORS: Record<SupplierStatus, string> = {
  active: "bg-green-500/20 text-green-400",
  pending: "bg-ember/20 text-ember",
  inactive: "bg-paper-dim/20 text-paper-dim",
};
