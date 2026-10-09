'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import {
  addDays,
  addMonths,
  addWeeks,
  endOfWeek,
  format,
  isSameMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from 'date-fns'
import {
  CalendarCheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
} from 'lucide-react'

import { Button } from '@/components/admin/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/admin/ui/dropdown-menu'
import { cn } from '@/lib/utils'

import type { CalendarEvent, CalendarView } from './calendar-types'
import { calendarLocale } from './calendar-utils'
import { EventGap, EventHeight, WeekCellsHeight } from './constants'
import { DayView } from './day-view'
import { MonthView } from './month-view'
import { WeekView } from './week-view'

const VIEW_LABELS: Record<CalendarView, string> = {
  month: 'Mês',
  week: 'Semana',
  day: 'Dia',
}

export interface EventCalendarProps {
  events: CalendarEvent[]
  className?: string
  initialView?: CalendarView
  newEventHref: string
  newEventLabel: string
  getEventHref: (event: CalendarEvent) => string
}

export function EventCalendar({
  events,
  className,
  initialView = 'month',
  newEventHref,
  newEventLabel,
  getEventHref,
}: EventCalendarProps) {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [view, setView] = useState<CalendarView>(initialView)

  const goToToday = () => setCurrentDate(new Date())

  const goToPrevious = () => {
    setCurrentDate((current) => {
      if (view === 'month') return subMonths(current, 1)
      if (view === 'week') return subWeeks(current, 1)

      return addDays(current, -1)
    })
  }

  const goToNext = () => {
    setCurrentDate((current) => {
      if (view === 'month') return addMonths(current, 1)
      if (view === 'week') return addWeeks(current, 1)

      return addDays(current, 1)
    })
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return
      }

      switch (e.key.toLowerCase()) {
        case 'm':
          setView('month')
          break
        case 'w':
          setView('week')
          break
        case 'd':
          setView('day')
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleEventSelect = (event: CalendarEvent) =>
    router.push(getEventHref(event))

  const getViewTitle = () => {
    if (view === 'month') {
      return format(currentDate, 'MMMM yyyy', { locale: calendarLocale })
    }

    if (view === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 })
      const end = endOfWeek(currentDate, { weekStartsOn: 0 })

      if (isSameMonth(start, end)) {
        return format(start, 'MMMM yyyy', { locale: calendarLocale })
      }

      return `${format(start, 'MMM', { locale: calendarLocale })} - ${format(end, 'MMM yyyy', { locale: calendarLocale })}`
    }

    return (
      <>
        <span className="min-[480px]:hidden" aria-hidden="true">
          {format(currentDate, 'd MMM yyyy', { locale: calendarLocale })}
        </span>
        <span className="max-[479px]:hidden md:hidden" aria-hidden="true">
          {format(currentDate, "d 'de' MMMM yyyy", { locale: calendarLocale })}
        </span>
        <span className="max-md:hidden">
          {format(currentDate, "EEE, d 'de' MMMM yyyy", {
            locale: calendarLocale,
          })}
        </span>
      </>
    )
  }

  return (
    <div className="bg-card flex flex-col rounded-lg border">
      <div
        className="flex flex-col has-data-[slot=month-view]:flex-1"
        style={
          {
            '--event-height': `${EventHeight}px`,
            '--event-gap': `${EventGap}px`,
            '--week-cells-height': `${WeekCellsHeight}px`,
          } as React.CSSProperties
        }
      >
        <div
          className={cn(
            'flex items-center justify-between gap-1 p-2 sm:p-4',
            className
          )}
        >
          <div className="flex items-center gap-1 max-sm:justify-between sm:gap-4">
            <div className="flex items-center gap-1">
              <Button
                nativeButton={false}
                render={<Link href={newEventHref} />}
                className="max-sm:hidden md:max-lg:h-8"
              >
                <PlusIcon size={16} aria-hidden="true" />
                <span>{newEventLabel}</span>
              </Button>
              <Button
                nativeButton={false}
                render={<Link href={newEventHref} aria-label={newEventLabel} />}
                size="icon-sm"
                className="sm:hidden"
              >
                <PlusIcon size={16} aria-hidden="true" />
              </Button>
              <Button
                variant="outline"
                className="max-sm:hidden md:max-lg:h-8"
                onClick={goToToday}
              >
                <CalendarCheckIcon size={16} aria-hidden="true" />
                <span>Hoje</span>
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                className="sm:hidden"
                onClick={goToToday}
                aria-label="Hoje"
              >
                <CalendarCheckIcon size={16} aria-hidden="true" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={goToPrevious}
              aria-label="Anterior"
            >
              <ChevronLeftIcon size={16} aria-hidden="true" />
            </Button>
            <h2 className="text-sm font-semibold capitalize sm:text-lg md:text-xl">
              {getViewTitle()}
            </h2>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={goToNext}
              aria-label="Próximo"
            >
              <ChevronRightIcon size={16} aria-hidden="true" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="outline" className="max-sm:h-8!" />}
              >
                <span>
                  <span className="sm:hidden" aria-hidden="true">
                    {VIEW_LABELS[view].charAt(0)}
                  </span>
                  <span className="max-sm:sr-only">{VIEW_LABELS[view]}</span>
                </span>
                <ChevronDownIcon
                  className="-me-1 opacity-60"
                  size={16}
                  aria-hidden="true"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-32">
                <DropdownMenuItem onClick={() => setView('month')}>
                  Mês <DropdownMenuShortcut>M</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setView('week')}>
                  Semana <DropdownMenuShortcut>W</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setView('day')}>
                  Dia <DropdownMenuShortcut>D</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex flex-1 flex-col">
          {view === 'month' && (
            <MonthView
              currentDate={currentDate}
              events={events}
              onEventSelect={handleEventSelect}
            />
          )}
          {view === 'week' && (
            <WeekView
              currentDate={currentDate}
              events={events}
              onEventSelect={handleEventSelect}
            />
          )}
          {view === 'day' && (
            <DayView
              currentDate={currentDate}
              events={events}
              onEventSelect={handleEventSelect}
            />
          )}
        </div>
      </div>
    </div>
  )
}
