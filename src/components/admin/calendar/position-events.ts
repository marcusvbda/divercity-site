import {
  addHours,
  areIntervalsOverlapping,
  differenceInMinutes,
  getHours,
  getMinutes,
  isSameDay,
  startOfDay,
} from 'date-fns'

import type { CalendarEvent } from './calendar-types'
import { StartHour, WeekCellsHeight } from './constants'

export interface PositionedEvent {
  event: CalendarEvent
  top: number
  height: number
  left: number
  width: number
  zIndex: number
}

export function positionEventsForDay(
  day: Date,
  dayEvents: CalendarEvent[]
): PositionedEvent[] {
  const dayStart = startOfDay(day)

  const sortedEvents = [...dayEvents].sort((a, b) => {
    const aStart = new Date(a.start)
    const bStart = new Date(b.start)

    if (aStart < bStart) return -1
    if (aStart > bStart) return 1

    return (
      differenceInMinutes(new Date(b.end), bStart) -
      differenceInMinutes(new Date(a.end), aStart)
    )
  })

  const positioned: PositionedEvent[] = []
  const columns: { event: CalendarEvent; end: Date }[][] = []

  sortedEvents.forEach((event) => {
    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)
    const adjustedStart = isSameDay(day, eventStart) ? eventStart : dayStart
    const adjustedEnd = isSameDay(day, eventEnd)
      ? eventEnd
      : addHours(dayStart, 24)
    const startHour = getHours(adjustedStart) + getMinutes(adjustedStart) / 60
    const endHour = getHours(adjustedEnd) + getMinutes(adjustedEnd) / 60
    const top = (startHour - StartHour) * WeekCellsHeight
    const height = (endHour - startHour) * WeekCellsHeight

    let columnIndex = 0

    while (true) {
      const col = columns[columnIndex] || []

      if (col.length === 0) {
        columns[columnIndex] = col
        break
      }

      const overlaps = col.some((c) =>
        areIntervalsOverlapping(
          { start: adjustedStart, end: adjustedEnd },
          { start: new Date(c.event.start), end: new Date(c.event.end) }
        )
      )

      if (!overlaps) break

      columnIndex++
    }

    columns[columnIndex].push({ event, end: adjustedEnd })

    positioned.push({
      event,
      top,
      height,
      left: columnIndex === 0 ? 0 : columnIndex * 0.1,
      width: columnIndex === 0 ? 1 : 1 - columnIndex * 0.1,
      zIndex: 10 + columnIndex,
    })
  })

  return positioned
}
