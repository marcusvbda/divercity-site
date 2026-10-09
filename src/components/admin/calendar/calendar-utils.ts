import { isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { cn } from '@/lib/utils'

import type { CalendarEvent, CalendarEventColor } from './calendar-types'

export const calendarLocale = ptBR

const EVENT_TYPES: CalendarEventColor[] = [
  'etc',
  'family',
  'business',
  'personal',
  'holiday',
]

export function normalizeEventType(color?: string): CalendarEventColor {
  if (color && EVENT_TYPES.includes(color as CalendarEventColor)) {
    return color as CalendarEventColor
  }

  return 'etc'
}

export function getEventColorClasses(color?: string): string {
  switch (normalizeEventType(color)) {
    case 'family':
      return 'bg-amber-200/50 text-amber-950/80 shadow-amber-700/8'
    case 'business':
      return 'bg-violet-200/50 text-violet-950/80 shadow-violet-700/8'
    case 'personal':
      return 'bg-rose-200/50 text-rose-950/80 shadow-rose-700/8'
    case 'holiday':
      return 'bg-emerald-200/50 text-emerald-950/80 shadow-emerald-700/8'
    default:
      return 'bg-sky-200/50 text-sky-950/80 shadow-sky-700/8'
  }
}

export function getBorderRadiusClasses(
  isFirstDay: boolean,
  isLastDay: boolean
): string {
  if (isFirstDay && isLastDay) {
    return 'rounded-sm'
  }

  if (isFirstDay) {
    return 'rounded-l-sm rounded-tr-none rounded-br-none'
  }

  if (isLastDay) {
    return 'rounded-r-sm rounded-tl-none rounded-bl-none'
  }

  return 'rounded-none'
}

export function getMonthViewBleedClasses(spansRight: boolean): string {
  if (!spansRight) {
    return ''
  }

  return cn(
    'overflow-visible',
    'after:absolute after:top-0 after:bottom-0 after:left-full after:z-0 after:w-[calc(0.125rem+1px+0.125rem)] after:rounded-none after:bg-inherit after:content-[""] sm:after:w-[calc(0.25rem+1px+0.25rem)]'
  )
}

export function getMonthViewEventPaddingClasses(
  spansLeft: boolean,
  spansRight: boolean
): string {
  if (!spansLeft && !spansRight) {
    return 'px-1 sm:px-2'
  }

  return cn(
    !spansLeft && 'pl-1 sm:pl-2',
    !spansRight && 'pr-1 sm:pr-2',
    spansLeft && 'pl-0',
    spansRight && 'pr-0'
  )
}

export function isMultiDayEvent(event: CalendarEvent): boolean {
  const eventStart = new Date(event.start)
  const eventEnd = new Date(event.end)

  return event.allDay || eventStart.getDate() !== eventEnd.getDate()
}

export function getEventsForDay(
  events: CalendarEvent[],
  day: Date
): CalendarEvent[] {
  return events
    .filter((event) => isSameDay(day, new Date(event.start)))
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
}

export function sortEvents(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => {
    const aIsMultiDay = isMultiDayEvent(a)
    const bIsMultiDay = isMultiDayEvent(b)

    if (aIsMultiDay && !bIsMultiDay) return -1
    if (!aIsMultiDay && bIsMultiDay) return 1

    return new Date(a.start).getTime() - new Date(b.start).getTime()
  })
}

export function getSpanningEventsForDay(
  events: CalendarEvent[],
  day: Date
): CalendarEvent[] {
  return events.filter((event) => {
    if (!isMultiDayEvent(event)) return false

    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)

    return (
      !isSameDay(day, eventStart) &&
      (isSameDay(day, eventEnd) || (day > eventStart && day < eventEnd))
    )
  })
}

export function getAllEventsForDay(
  events: CalendarEvent[],
  day: Date
): CalendarEvent[] {
  return events.filter((event) => {
    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)

    return (
      isSameDay(day, eventStart) ||
      isSameDay(day, eventEnd) ||
      (day > eventStart && day < eventEnd)
    )
  })
}
