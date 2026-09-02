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

export type ConfirmationChild = {
  name?: string
  passportTypeName?: string
  ageMonths?: number
  isPNE?: boolean
  hasCompanion?: boolean | null
  companionName?: string | null
  unaccompanied?: boolean
  unaccompaniedTermsAccepted?: boolean
  unitPrice?: string
}

export type ConfirmationCompanion = {
  name?: string
  phone?: string
  isFree?: boolean
  passportTypeName?: string | null
  unitPrice?: string
  linkedChildIndex?: number
}

export type ConfirmationPaidResponse = {
  status: 'paid' | 'checked_in' | 'checked_out'
  shortCode: string
  guardianName: string
  guardianPhone?: string
  guardianWhatsapp?: string
  totalAmount: string
  contractedDurationMinutes: number
  qrCodeDataUrl: string
  children?: ConfirmationChild[]
  companions?: ConfirmationCompanion[]
}

export type ConfirmationResponse =
  | ConfirmationPendingResponse
  | ConfirmationPaidResponse
  | ApiErrorResponse

export type { VisitDayType }
