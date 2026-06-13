'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Party, PartyStatus } from '@/types/parties'

const STATUS_COLORS: Record<PartyStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-gray-100 text-gray-500 border-gray-200 line-through',
}

type Props = {
  parties: Party[]
  isLoading?: boolean
}

export function PartyCalendar({ parties, isLoading }: Props) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startOffset = firstDay.getDay()

  const cells: (number | null)[] = [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: lastDay.getDate() }, (_, i) => i + 1),
  ]
  while (cells.length < 42) cells.push(null)

  const partiesByDay = parties.reduce<Record<number, Party[]>>((acc, party) => {
    const d = new Date(party.date)
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate()
      if (!acc[day]) acc[day] = []
      acc[day].push(party)
    }
    return acc
  }, {})

  const monthLabel = new Date(year, month).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  function prev() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function next() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  return (
    <div className="rounded-lg border">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <Button variant="ghost" size="icon" onClick={prev}>
          <ChevronLeftIcon className="size-4" />
        </Button>
        <span className="font-medium capitalize">{monthLabel}</span>
        <Button variant="ghost" size="icon" onClick={next}>
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 border-b">
        {weekDays.map(d => (
          <div key={d} className="text-muted-foreground py-2 text-center text-xs font-medium">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          const isToday = day !== null && day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
          const dayParties = day ? (partiesByDay[day] ?? []) : []

          return (
            <div
              key={i}
              className={cn(
                'min-h-20 border-b border-r p-1.5',
                !day && 'bg-muted/30',
                i % 7 === 6 && 'border-r-0',
              )}
            >
              {day && (
                <>
                  <span className={cn(
                    'mb-1 flex size-6 items-center justify-center rounded-full text-xs',
                    isToday && 'bg-primary text-primary-foreground font-bold',
                  )}>
                    {day}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    {isLoading ? null : dayParties.map(party => (
                      <Link
                        key={party.id}
                        href={`/admin/parties/${party.id}`}
                        className={cn(
                          'truncate rounded border px-1 py-0.5 text-xs transition-opacity hover:opacity-80',
                          STATUS_COLORS[party.status],
                        )}
                      >
                        {party.customer?.name?.split(' ')[0]}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
