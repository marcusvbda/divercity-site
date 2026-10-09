export interface PassportType {
  id: string;
  name: string;
  durationMinutes: number;
  weekdayChildPrice: string;
  weekendChildPrice: string;
  weekdayCompanionPrice: string;
  weekendCompanionPrice: string;
  active: boolean;
  sort: number;
  createdAt: string;
  updatedAt: string;
}

export type TicketOrderStatus = "pending_payment" | "paid" | "payment_failed" | "cancelled";

export type TicketPassKind = "child" | "group_companion";
export type TicketPassStatus = "not_used" | "checked_in" | "checked_out";

export interface TicketSummary {
  shortCode: string;
  kind: TicketPassKind;
  holderName: string;
  status: TicketPassStatus;
  contractedDurationMinutes: number;
  checkedInAt: string | null;
  checkedOutAt: string | null;
  plannedEndAt: string | null;
  overtimeMinutes: number | null;
}

export interface TicketOrderSummary {
  id: string;
  shortCode: string;
  status: TicketOrderStatus;
  guardianName: string;
  guardianPhone: string;
  totalAmount: string;
  ticketsCount: number;
  createdAt: string;
  tickets: TicketSummary[];
}
