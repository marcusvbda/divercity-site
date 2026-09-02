'use client'

import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PassportTypeDto, VisitDayType } from './types'
import { currency } from './utils'

function formatDuration(minutes: number): string {
  if (minutes % 60 === 0) {
    const hours = minutes / 60
    return `${hours}h`
  }
  return `${minutes}min`
}

export default function PassportTypeSelector({
  passportTypes,
  visitDayType,
  value,
  onChange,
  priceKind,
  name,
}: {
  passportTypes: PassportTypeDto[]
  visitDayType: VisitDayType
  value: string | undefined
  onChange: (id: string) => void
  priceKind: 'child' | 'companion'
  name: string
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="radiogroup" aria-label={name}>
      {passportTypes.map((pt) => {
        const price =
          priceKind === 'child'
            ? visitDayType === 'weekday'
              ? pt.weekdayChildPrice
              : pt.weekendChildPrice
            : visitDayType === 'weekday'
              ? pt.weekdayCompanionPrice
              : pt.weekendCompanionPrice
        const isSelected = value === pt.id
        return (
          <button
            key={pt.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(pt.id)}
            className={cn(
              'font-body flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-xl border px-3 py-2.5 text-center transition-colors',
              isSelected
                ? 'border-brand-pink bg-brand-pink text-white'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            )}
          >
            <span className="flex items-center gap-1 text-xs opacity-90">
              <Clock size={11} />
              {pt.name} · {formatDuration(pt.durationMinutes)}
            </span>
            <span className="text-sm font-bold">{currency(price)}</span>
          </button>
        )
      })}
    </div>
  )
}
