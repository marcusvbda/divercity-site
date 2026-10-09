export type CalendarView = 'month' | 'week' | 'day'

export type CalendarEventColor =
  | 'family'
  | 'business'
  | 'personal'
  | 'holiday'
  | 'etc'

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: Date
  end: Date
  allDay?: boolean
  color?: CalendarEventColor
  strikethrough?: boolean
}
