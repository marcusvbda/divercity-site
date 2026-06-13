'use client'

import { useState } from 'react'
import { ArrowUpIcon, ArrowDownIcon, ArrowUpDownIcon } from 'lucide-react'
import { TableHead } from '@/components/ui/table'
import { cn } from '@/lib/utils'

export type SortDir = 'asc' | 'desc'

export function useSortable<T>(items: T[]) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  function toggle(key: string) {
    if (key === sortKey) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  function sort(accessors: Record<string, (item: T) => string | number>) {
    if (!sortKey || !accessors[sortKey]) return items
    return [...items].sort((a, b) => {
      const av = accessors[sortKey](a)
      const bv = accessors[sortKey](b)
      const cmp =
        typeof av === 'number' && typeof bv === 'number'
          ? av - bv
          : String(av).localeCompare(String(bv), 'pt-BR', { numeric: true })
      return sortDir === 'asc' ? cmp : -cmp
    })
  }

  return { sortKey, sortDir, toggle, sort }
}

interface SortableTableHeadProps {
  children: React.ReactNode
  sortKey: string
  currentKey: string | null
  currentDir: SortDir
  onSort: (key: string) => void
  className?: string
}

export function SortableTableHead({
  children,
  sortKey,
  currentKey,
  currentDir,
  onSort,
  className,
}: SortableTableHeadProps) {
  const isActive = currentKey === sortKey

  return (
    <TableHead
      className={cn('cursor-pointer select-none', className)}
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {children}
        {isActive ? (
          currentDir === 'asc' ? (
            <ArrowUpIcon className="size-3" />
          ) : (
            <ArrowDownIcon className="size-3" />
          )
        ) : (
          <ArrowUpDownIcon className="text-muted-foreground/50 size-3" />
        )}
      </div>
    </TableHead>
  )
}
