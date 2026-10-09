'use client'

import {
  addHours,
  eachHourOfInterval,
  format,
  isSameDay,
  startOfDay,
} from 'date-fns'

import type { CalendarEvent } from './calendar-types'
import { isMultiDayEvent } from './calendar-utils'
import { EndHour, StartHour } from './constants'
import { EventItem } from './event-item'
import { positionEventsForDay } from './position-events'
import { useCurrentTimeIndicator } from './use-current-time-indicator'

interface DayViewProps {
  currentDate: Date
  events: CalendarEvent[]
  onEventSelect: (event: CalendarEvent) => void
}

export function DayView({ currentDate, events, onEventSelect }: DayViewProps) {
  const dayStart = startOfDay(currentDate)
  const hours = eachHourOfInterval({
    start: addHours(dayStart, StartHour),
    end: addHours(dayStart, EndHour - 1),
  })

  const dayEvents = events
    .filter((event) => {
      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)

      return (
        isSameDay(currentDate, eventStart) ||
        isSameDay(currentDate, eventEnd) ||
        (currentDate > eventStart && currentDate < eventEnd)
      )
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

  const allDayEvents = dayEvents.filter(
    (event) => event.allDay || isMultiDayEvent(event)
  )
  const timeEvents = dayEvents.filter(
    (event) => !event.allDay && !isMultiDayEvent(event)
  )
  const positionedEvents = positionEventsForDay(currentDate, timeEvents)

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation()
    onEventSelect(event)
  }

  const { currentTimePosition, currentTimeVisible } = useCurrentTimeIndicator(
    currentDate,
    'day'
  )

  return (
    <div data-slot="day-view" className="contents">
      {allDayEvents.length > 0 && (
        <div className="border-border/70 bg-muted/50 border-t">
          <div className="grid grid-cols-[3rem_1fr] sm:grid-cols-[4rem_1fr]">
            <div className="relative">
              <span className="text-muted-foreground/70 absolute bottom-0 left-0 h-6 w-16 max-w-full pe-2 text-right text-[10px] sm:pe-4 sm:text-xs">
                Dia inteiro
              </span>
            </div>
            <div className="border-border/70 relative border-r p-1 last:border-r-0">
              {allDayEvents.map((event) => (
                <EventItem
                  key={`spanning-${event.id}`}
                  onClick={(e) => handleEventClick(event, e)}
                  event={event}
                  view="month"
                  isFirstDay={isSameDay(currentDate, new Date(event.start))}
                  isLastDay={isSameDay(currentDate, new Date(event.end))}
                >
                  <div>{event.title}</div>
                </EventItem>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="border-border/70 grid flex-1 grid-cols-[3rem_1fr] overflow-hidden border-t sm:grid-cols-[4rem_1fr]">
        <div>
          {hours.map((hour, index) => (
            <div
              key={hour.toString()}
              className="border-border/70 relative h-(--week-cells-height) border-b last:border-b-0"
            >
              {index > 0 && (
                <span className="bg-background text-muted-foreground/70 absolute -top-3 left-0 flex h-6 w-16 max-w-full items-center justify-end pe-2 text-[10px] sm:pe-4 sm:text-xs">
                  {format(hour, 'HH:mm')}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="relative">
          {positionedEvents.map((positionedEvent) => (
            <div
              key={positionedEvent.event.id}
              className="absolute z-10 px-0.5"
              style={{
                top: `${positionedEvent.top}px`,
                height: `${positionedEvent.height}px`,
                left: `${positionedEvent.left * 100}%`,
                width: `${positionedEvent.width * 100}%`,
                zIndex: positionedEvent.zIndex,
              }}
            >
              <div className="h-full w-full">
                <EventItem
                  event={positionedEvent.event}
                  view="day"
                  onClick={(e) => handleEventClick(positionedEvent.event, e)}
                  showTime
                />
              </div>
            </div>
          ))}

          {currentTimeVisible && (
            <div
              className="pointer-events-none absolute right-0 left-0 z-20"
              style={{ top: `${currentTimePosition}%` }}
            >
              <div className="relative flex items-center">
                <div className="bg-primary absolute -left-1 h-2 w-2 rounded-full"></div>
                <div className="bg-primary h-0.5 w-full"></div>
              </div>
            </div>
          )}

          {hours.map((hour) => (
            <div
              key={hour.toString()}
              className="border-border/70 relative h-(--week-cells-height) border-b last:border-b-0"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
