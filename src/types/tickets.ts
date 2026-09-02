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

export type TicketOrderStatus =
  | "pending_payment"
  | "paid"
  | "payment_failed"
  | "cancelled"
  | "checked_in"
  | "checked_out";

export interface TicketOrderSummary {
  id: string;
  shortCode: string;
  status: TicketOrderStatus;
  guardianName: string;
  guardianPhone: string;
  totalAmount: string;
  childrenCount: number;
  createdAt: string;
  checkedInAt: string | null;
  checkedOutAt: string | null;
}
