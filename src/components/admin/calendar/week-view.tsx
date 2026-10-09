'use client'

import {
  addHours,
  eachDayOfInterval,
  eachHourOfInterval,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isToday,
  startOfDay,
  startOfWeek,
} from 'date-fns'

import { cn } from '@/lib/utils'

import type { CalendarEvent } from './calendar-types'
import { calendarLocale, isMultiDayEvent } from './calendar-utils'
import { EndHour, StartHour } from './constants'
import { EventItem } from './event-item'
import { positionEventsForDay } from './position-events'
import { useCurrentTimeIndicator } from './use-current-time-indicator'

interface WeekViewProps {
  currentDate: Date
  events: CalendarEvent[]
  onEventSelect: (event: CalendarEvent) => void
}

export function WeekView({
  currentDate,
  events,
  onEventSelect,
}: WeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const dayStart = startOfDay(currentDate)
  const hours = eachHourOfInterval({
    start: addHours(dayStart, StartHour),
    end: addHours(dayStart, EndHour - 1),
  })

  const allDayEvents = events
    .filter((event) => event.allDay || isMultiDayEvent(event))
    .filter((event) => {
      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)

      return days.some(
        (day) =>
          isSameDay(day, eventStart) ||
          isSameDay(day, eventEnd) ||
          (day > eventStart && day < eventEnd)
      )
    })

  const processedDayEvents = days.map((day) => {
    const dayEvents = events.filter((event) => {
      if (event.allDay || isMultiDayEvent(event)) return false

      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)

      return (
        isSameDay(day, eventStart) ||
        isSameDay(day, eventEnd) ||
        (eventStart < day && eventEnd > day)
      )
    })

    return positionEventsForDay(day, dayEvents)
  })

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation()
    onEventSelect(event)
  }

  const { currentTimePosition, currentTimeVisible } = useCurrentTimeIndicator(
    currentDate,
    'week'
  )

  return (
    <div data-slot="week-view" className="flex h-full flex-col">
      <div className="bg-background/80 border-border/70 sticky top-0 z-30 grid grid-cols-8 border-b backdrop-blur-md">
        <div className="text-muted-foreground/70 py-2 text-center text-sm">
          <span className="max-[479px]:sr-only">{format(new Date(), 'O')}</span>
        </div>
        {days.map((day) => (
          <div
            key={day.toString()}
            className="data-today:text-foreground text-muted-foreground/70 py-2 text-center text-sm capitalize data-today:font-medium"
            data-today={isToday(day) || undefined}
          >
            <span className="sm:hidden" aria-hidden="true">
              {format(day, 'EEE', { locale: calendarLocale })[0]}{' '}
              {format(day, 'd')}
            </span>
            <span className="max-sm:hidden">
              {format(day, 'EEE dd', { locale: calendarLocale })}
            </span>
          </div>
        ))}
      </div>

      {allDayEvents.length > 0 && (
        <div className="border-border/70 bg-muted/50 border-b">
          <div className="grid grid-cols-8">
            <div className="border-border/70 relative border-r">
              <span className="text-muted-foreground/70 absolute bottom-0 left-0 h-6 w-16 max-w-full pe-2 text-right text-[10px] sm:pe-4 sm:text-xs">
                Dia inteiro
              </span>
            </div>
            {days.map((day, dayIndex) => {
              const dayAllDayEvents = allDayEvents.filter((event) => {
                const eventStart = new Date(event.start)
                const eventEnd = new Date(event.end)

                return (
                  isSameDay(day, eventStart) ||
                  (day > eventStart && day < eventEnd) ||
                  isSameDay(day, eventEnd)
                )
              })

              return (
                <div
                  key={day.toString()}
                  className="border-border/70 relative border-r p-1 last:border-r-0"
                  data-today={isToday(day) || undefined}
                >
                  {dayAllDayEvents.map((event) => {
                    const eventStart = new Date(event.start)
                    const eventEnd = new Date(event.end)
                    const isFirstDay = isSameDay(day, eventStart)
                    const isLastDay = isSameDay(day, eventEnd)
                    const isFirstVisibleDay =
                      dayIndex === 0 && isBefore(eventStart, weekStart)
                    const shouldShowTitle = isFirstDay || isFirstVisibleDay

                    return (
                      <EventItem
                        key={`spanning-${event.id}`}
                        onClick={(e) => handleEventClick(event, e)}
                        event={event}
                        view="month"
                        isFirstDay={isFirstDay}
                        isLastDay={isLastDay}
                      >
                        <div
                          className={cn(
                            'truncate',
                            !shouldShowTitle && 'invisible'
                          )}
                          aria-hidden={!shouldShowTitle}
                        >
                          {event.title}
                        </div>
                      </EventItem>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid flex-1 grid-cols-8 overflow-hidden">
        <div className="border-border/70 grid auto-cols-fr border-r">
          {hours.map((hour, index) => (
            <div
              key={hour.toString()}
              className="border-border/70 relative min-h-(--week-cells-height) border-b last:border-b-0"
            >
              {index > 0 && (
                <span className="bg-background text-muted-foreground/70 absolute -top-3 left-0 flex h-6 w-16 max-w-full items-center justify-end pe-2 text-[10px] sm:pe-4 sm:text-xs">
                  {format(hour, 'HH:mm')}
                </span>
              )}
            </div>
          ))}
        </div>

        {days.map((day, dayIndex) => (
          <div
            key={day.toString()}
            className="border-border/70 relative grid auto-cols-fr border-r last:border-r-0"
            data-today={isToday(day) || undefined}
          >
            {processedDayEvents[dayIndex].map((positionedEvent) => (
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
                    view="week"
                    onClick={(e) => handleEventClick(positionedEvent.event, e)}
                    showTime
                  />
                </div>
              </div>
            ))}

            {currentTimeVisible && isToday(day) && (
              <div
                className="pointer-events-none absolute right-0 left-0 z-20"
                style={{ top: `${currentTimePosition}%` }}
              >
                <div className="relative flex items-center">
                  <div className="bg-primary absolute -left-1 h-2 w-2 rounded-full"></div>
                  <div className="bg-primary h-[2px] w-full"></div>
                </div>
              </div>
            )}

            {hours.map((hour) => (
              <div
                key={hour.toString()}
                className="border-border/70 relative min-h-(--week-cells-height) border-b last:border-b-0"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
