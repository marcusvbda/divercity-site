'use client'

import { cn } from '@/lib/utils'

interface CalendarCellProps {
  children?: React.ReactNode
  className?: string
}

export function CalendarCell({ children, className }: CalendarCellProps) {
  return (
    <div
      className={cn(
        'flex h-full flex-col overflow-hidden px-0.5 py-1 sm:px-1',
        className
      )}
    >
      {children}
    </div>
  )
}
