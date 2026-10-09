'use client'

import { differenceInMinutes, format, isPast } from 'date-fns'

import { cn } from '@/lib/utils'

import type { CalendarEvent } from './calendar-types'
import {
  calendarLocale,
  getBorderRadiusClasses,
  getEventColorClasses,
  getMonthViewBleedClasses,
  getMonthViewEventPaddingClasses,
} from './calendar-utils'

const formatTime = (date: Date) =>
  format(date, 'HH:mm', { locale: calendarLocale })

interface EventWrapperProps {
  event: CalendarEvent
  isFirstDay?: boolean
  isLastDay?: boolean
  onClick?: (e: React.MouseEvent) => void
  className?: string
  children: React.ReactNode
}

function EventWrapper({
  event,
  isFirstDay = true,
  isLastDay = true,
  onClick,
  className,
  children,
}: EventWrapperProps) {
  const isEventInPast = isPast(new Date(event.end))

  return (
    <button
      type="button"
      className={cn(
        'focus-visible:border-ring focus-visible:ring-ring/50 flex h-full w-full text-left font-medium transition outline-none select-none focus-visible:ring-[3px] data-past-event:line-through',
        getEventColorClasses(event.color),
        getBorderRadiusClasses(isFirstDay, isLastDay),
        event.strikethrough && 'line-through',
        className
      )}
      data-calendar-event
      data-past-event={isEventInPast || undefined}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

interface EventItemProps {
  event: CalendarEvent
  view: 'month' | 'week' | 'day'
  onClick?: (e: React.MouseEvent) => void
  showTime?: boolean
  isFirstDay?: boolean
  isLastDay?: boolean
  spansLeft?: boolean
  spansRight?: boolean
  children?: React.ReactNode
  className?: string
}

export function EventItem({
  event,
  view,
  onClick,
  showTime,
  isFirstDay = true,
  isLastDay = true,
  spansLeft = false,
  spansRight = false,
  children,
  className,
}: EventItemProps) {
  const displayStart = new Date(event.start)
  const displayEnd = new Date(event.end)
  const durationMinutes = differenceInMinutes(displayEnd, displayStart)

  const getEventTime = () => {
    if (event.allDay) return 'Dia inteiro'

    if (durationMinutes < 45) {
      return formatTime(displayStart)
    }

    return `${formatTime(displayStart)} - ${formatTime(displayEnd)}`
  }

  if (view === 'month') {
    const monthContent =
      children ??
      (isFirstDay ? (
        <span className="truncate">
          {!event.allDay && (
            <span className="truncate font-normal opacity-70 sm:text-[11px]">
              {formatTime(displayStart)}{' '}
            </span>
          )}
          {event.title}
        </span>
      ) : null)

    return (
      <div className="relative mt-(--event-gap) w-full">
        <EventWrapper
          event={event}
          isFirstDay={isFirstDay}
          isLastDay={isLastDay}
          onClick={onClick}
          className={cn(
            'relative h-(--event-height) w-full min-w-0 items-center overflow-hidden text-[10px] sm:text-xs',
            getMonthViewBleedClasses(spansRight),
            getMonthViewEventPaddingClasses(spansLeft, spansRight),
            className
          )}
        >
          {monthContent ? (
            <span className="relative z-10 block min-w-0 flex-1 truncate overflow-hidden">
              {monthContent}
            </span>
          ) : (
            <span className="sr-only">{event.title}</span>
          )}
        </EventWrapper>
      </div>
    )
  }

  return (
    <EventWrapper
      event={event}
      isFirstDay={isFirstDay}
      isLastDay={isLastDay}
      onClick={onClick}
      className={cn(
        'px-1 py-1 backdrop-blur-md sm:px-2',
        durationMinutes < 45 ? 'items-center' : 'flex-col',
        view === 'week' ? 'text-[10px] sm:text-xs' : 'text-xs',
        className
      )}
    >
      {durationMinutes < 45 ? (
        <div className="truncate">
          {event.title}{' '}
          {showTime && (
            <span className="opacity-70">{formatTime(displayStart)}</span>
          )}
        </div>
      ) : (
        <>
          <div className="truncate font-medium">{event.title}</div>
          {showTime && (
            <div className="truncate font-normal opacity-70 sm:text-[11px]">
              {getEventTime()}
            </div>
          )}
        </>
      )}
    </EventWrapper>
  )
}
