'use client'

import { useState } from 'react'

import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/admin/ui/popover'

import { CalendarCell } from './calendar-cell'
import type { CalendarEvent } from './calendar-types'
import {
  calendarLocale,
  getAllEventsForDay,
  getEventsForDay,
  getSpanningEventsForDay,
  sortEvents,
} from './calendar-utils'
import { EventGap, EventHeight } from './constants'
import { EventItem } from './event-item'
import { useEventVisibility } from './use-event-visibility'

interface MonthViewProps {
  currentDate: Date
  events: CalendarEvent[]
  onEventSelect: (event: CalendarEvent) => void
}

export function MonthView({
  currentDate,
  events,
  onEventSelect,
}: MonthViewProps) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const weekdays = Array.from({ length: 7 }).map((_, i) =>
    format(addDays(startOfWeek(new Date(), { weekStartsOn: 0 }), i), 'EEE', {
      locale: calendarLocale,
    })
  )

  const weeks: Date[][] = []

  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation()
    onEventSelect(event)
  }

  const [openPopoverDay, setOpenPopoverDay] = useState<string | null>(null)

  const { contentRef, getVisibleEventCount } = useEventVisibility({
    eventHeight: EventHeight,
    eventGap: EventGap,
  })

  return (
    <div data-slot="month-view" className="contents">
      <div className="border-border/70 grid grid-cols-7 border-b">
        {weekdays.map((day) => (
          <div
            key={day}
            className="text-muted-foreground/70 py-2 text-center text-sm capitalize"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid flex-1 auto-rows-fr">
        {weeks.map((week, weekIndex) => (
          <div
            key={`week-${weekIndex}`}
            className="grid grid-cols-7 [&:last-child>*]:border-b-0"
          >
            {week.map((day, dayIndex) => {
              const dayEvents = getEventsForDay(events, day)
              const spanningEvents = getSpanningEventsForDay(events, day)
              const isCurrentMonth = isSameMonth(day, currentDate)
              const allDayEvents = [...spanningEvents, ...dayEvents]
              const allEvents = getAllEventsForDay(events, day)
              const isReferenceCell = weekIndex === 0 && dayIndex === 0
              const visibleCount = getVisibleEventCount(allDayEvents.length)
              const hasMore = allDayEvents.length > visibleCount
              const remainingCount = hasMore
                ? allDayEvents.length - visibleCount
                : 0
              const dayKey = format(day, 'yyyy-MM-dd')

              return (
                <div
                  key={day.toString()}
                  className="group border-border/70 data-outside-cell:bg-muted/25 data-outside-cell:text-muted-foreground/70 border-r border-b last:border-r-0"
                  data-today={isToday(day) || undefined}
                  data-outside-cell={!isCurrentMonth || undefined}
                >
                  <CalendarCell className="overflow-visible">
                    <div className="group-data-today:bg-primary group-data-today:text-primary-foreground mt-1 inline-flex size-6 items-center justify-center rounded-full text-sm">
                      {format(day, 'd')}
                    </div>
                    <div
                      ref={isReferenceCell ? contentRef : null}
                      className="min-h-[calc((var(--event-height)+var(--event-gap))*2)] overflow-visible sm:min-h-[calc((var(--event-height)+var(--event-gap))*3)] lg:min-h-[calc((var(--event-height)+var(--event-gap))*4)]"
                    >
                      {sortEvents(allDayEvents).map((event, index) => {
                        const eventStart = new Date(event.start)
                        const eventEnd = new Date(event.end)
                        const isFirstDay = isSameDay(day, eventStart)
                        const isLastDay = isSameDay(day, eventEnd)
                        const spansRight = !isLastDay && dayIndex < 6
                        const spansLeft = !isFirstDay && dayIndex > 0
                        const isHidden = index >= visibleCount

                        return (
                          <div
                            key={`${event.id}-${dayKey}`}
                            className="w-full aria-hidden:hidden"
                            aria-hidden={isHidden ? 'true' : undefined}
                          >
                            <EventItem
                              event={event}
                              view="month"
                              onClick={(e) => handleEventClick(event, e)}
                              isFirstDay={isFirstDay}
                              isLastDay={isLastDay}
                              spansLeft={spansLeft}
                              spansRight={spansRight}
                            />
                          </div>
                        )
                      })}

                      {hasMore && (
                        <Popover
                          modal
                          open={openPopoverDay === dayKey}
                          onOpenChange={(open) =>
                            setOpenPopoverDay(open ? dayKey : null)
                          }
                        >
                          <PopoverTrigger
                            render={
                              <button
                                type="button"
                                className="focus-visible:border-ring focus-visible:ring-ring/50 text-muted-foreground hover:text-foreground hover:bg-muted/50 mt-(--event-gap) flex h-(--event-height) w-full items-center overflow-hidden px-1 text-left text-[10px] backdrop-blur-md transition outline-none select-none focus-visible:ring-[3px] sm:px-2 sm:text-xs"
                                onClick={(e) => e.stopPropagation()}
                              />
                            }
                          >
                            <span>
                              + {remainingCount}{' '}
                              <span className="max-sm:sr-only">mais</span>
                            </span>
                          </PopoverTrigger>
                          <PopoverContent
                            align="center"
                            className="max-w-52 p-3"
                            style={
                              {
                                '--event-height': `${EventHeight}px`,
                              } as React.CSSProperties
                            }
                          >
                            <div className="space-y-2">
                              <div className="text-sm font-medium capitalize">
                                {format(day, 'EEE d', {
                                  locale: calendarLocale,
                                })}
                              </div>
                              <div className="space-y-1">
                                {sortEvents(allEvents).map((event) => (
                                  <EventItem
                                    key={event.id}
                                    onClick={(e) => handleEventClick(event, e)}
                                    event={event}
                                    view="month"
                                    isFirstDay={isSameDay(
                                      day,
                                      new Date(event.start)
                                    )}
                                    isLastDay={isSameDay(
                                      day,
                                      new Date(event.end)
                                    )}
                                  />
                                ))}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  </CalendarCell>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
