import type { VisitDayType } from '@/lib/schemas/tickets'

export type PassportTypeDto = {
  id: string
  name: string
  durationMinutes: number
  weekdayChildPrice: string
  weekendChildPrice: string
  weekdayCompanionPrice: string
  weekendCompanionPrice: string
}

export type PassportTypesResponse = {
  data: PassportTypeDto[]
}

export type QuotedChild = {
  name: string
  passportTypeId?: string
  passportTypeName: string
  ageMonths: number
  isPNE: boolean
  hasCompanion: boolean | null
  unitPrice: string
}

export type QuotedCompanion = {
  name: string
  isFree: boolean
  passportTypeName: string | null
  unitPrice: string
}

export type QuoteResponse = {
  children: QuotedChild[]
  companions: QuotedCompanion[]
  total: string
}

export type ApiErrorResponse = {
  error: string | Record<string, unknown>
}

export type CheckoutSuccessResponse = {
  checkoutUrl: string
  shortCode: string
}

export type ConfirmationPendingResponse = {
  status: 'pending_payment' | 'payment_failed'
}

export type TicketPassKind = 'child' | 'group_companion'

export type TicketPassStatus = 'not_used' | 'checked_in' | 'checked_out'

export type ConfirmationTicket = {
  shortCode: string
  kind: TicketPassKind
  holderName: string
  passportTypeName: string
  contractedDurationMinutes: number
  status: TicketPassStatus
  qrCodeDataUrl: string
  companionIncluded: { name: string } | null
  isPNE: boolean
  unitPrice: string
}

export type ConfirmationChild = {
  name: string
  passportTypeName: string
  isPNE: boolean
  unitPrice: string
  hasCompanion: boolean | null
  companionName: string | null
  unaccompanied: boolean
}

export type ConfirmationCompanion = {
  name: string
  isFree: boolean
  unitPrice: string
}

export type ConfirmationPaidResponse = {
  status: 'paid' | 'cancelled'
  shortCode: string
  guardianName: string
  guardianPhone: string
  guardianWhatsapp: string
  totalAmount: string
  tickets: ConfirmationTicket[]
  children: ConfirmationChild[]
  companions: ConfirmationCompanion[]
}

export type ConfirmationResponse =
  | ConfirmationPendingResponse
  | ConfirmationPaidResponse
  | ApiErrorResponse

export type { VisitDayType }
