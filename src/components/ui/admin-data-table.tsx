'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { SearchIcon, ArrowUpIcon, ArrowDownIcon, ArrowUpDownIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export type Column<T> = {
  key: string
  header: string
  sortable?: boolean
  render: (row: T) => React.ReactNode
  className?: string
}

export type FilterConfig = {
  key: string
  placeholder?: string
  type?: 'search' | 'select' | 'date'
  options?: { label: string; value: string }[]
}

type Pagination = {
  page: number
  perPage: number
  total: number
  totalPages: number
}

type ApiResponse<T> = {
  data: T[]
  pagination: Pagination
}

type AdminDataTableProps<T extends { id: number | string }> = {
  queryKey: string[]
  endpoint: string
  columns: Column<T>[]
  filters?: FilterConfig[]
  actions?: (row: T) => React.ReactNode
  defaultPerPage?: number
}

export function AdminDataTable<T extends { id: number | string }>({
  queryKey,
  endpoint,
  columns,
  filters,
  actions,
  defaultPerPage = 15,
}: AdminDataTableProps<T>) {
  const searchParams = useSearchParams()
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(defaultPerPage)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [filterValues, setFilterValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    filters?.forEach(f => {
      const v = searchParams.get(f.key)
      if (v) initial[f.key] = v
    })
    return initial
  })

  function buildUrl() {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('perPage', String(perPage))
    if (sortKey) {
      params.set('sort', sortKey)
      params.set('dir', sortDir)
    }
    for (const [k, v] of Object.entries(filterValues)) {
      if (v) params.set(k, v)
    }
    return `${endpoint}?${params.toString()}`
  }

  const { data, isLoading } = useQuery<ApiResponse<T>>({
    queryKey: [...queryKey, page, perPage, sortKey, sortDir, filterValues],
    queryFn: () => fetch(buildUrl()).then(r => r.json()),
  })

  function handleSort(key: string) {
    if (key === sortKey) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  function handleFilterChange(key: string, value: string) {
    setFilterValues(prev => ({ ...prev, [key]: value }))
    setPage(1)
  }

  function handlePerPageChange(value: string | null) {
    if (!value) return
    setPerPage(Number(value))
    setPage(1)
  }

  const rows = data?.data ?? []
  const pagination = data?.pagination
  const totalPages = pagination?.totalPages ?? 1
  const total = pagination?.total ?? 0
  const start = total === 0 ? 0 : (page - 1) * perPage + 1
  const end = Math.min(page * perPage, total)
  const colSpan = columns.length + (actions ? 1 : 0)

  return (
    <div className="flex flex-col gap-4">
      {filters && filters.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {filters.map(filter => {
            if (filter.type === 'select') {
              const currentValue = filterValues[filter.key] || 'all'
              const currentLabel = (filter.options ?? []).find(
                opt => (opt.value || 'all') === currentValue
              )?.label
              return (
                <Select
                  key={filter.key}
                  value={currentValue}
                  onValueChange={v => handleFilterChange(filter.key, v === 'all' ? '' : (v ?? ''))}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder={filter.placeholder}>{currentLabel}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {(filter.options ?? []).map(opt => (
                      <SelectItem key={opt.value || 'all'} value={opt.value || 'all'}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )
            }

            if (filter.type === 'date') {
              return (
                <Input
                  key={filter.key}
                  type="date"
                  className="w-44"
                  value={filterValues[filter.key] ?? ''}
                  onChange={e => handleFilterChange(filter.key, e.target.value)}
                />
              )
            }

            return (
              <div key={filter.key} className="relative max-w-sm">
                <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  placeholder={filter.placeholder ?? 'Buscar...'}
                  className="pl-9"
                  value={filterValues[filter.key] ?? ''}
                  onChange={e => handleFilterChange(filter.key, e.target.value)}
                />
              </div>
            )
          })}
        </div>
      )}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(col => (
                col.sortable ? (
                  <TableHead
                    key={col.key}
                    className={cn('cursor-pointer select-none', col.className)}
                    onClick={() => handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1">
                      {col.header}
                      {sortKey === col.key ? (
                        sortDir === 'asc' ? (
                          <ArrowUpIcon className="size-3" />
                        ) : (
                          <ArrowDownIcon className="size-3" />
                        )
                      ) : (
                        <ArrowUpDownIcon className="text-muted-foreground/50 size-3" />
                      )}
                    </div>
                  </TableHead>
                ) : (
                  <TableHead key={col.key} className={col.className}>
                    {col.header}
                  </TableHead>
                )
              ))}
              {actions && <TableHead className="w-24" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: colSpan }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="text-muted-foreground py-8 text-center text-sm">
                  Nenhum item encontrado
                </TableCell>
              </TableRow>
            ) : (
              rows.map(row => (
                <TableRow key={row.id}>
                  {columns.map(col => (
                    <TableCell key={col.key} className={col.className}>
                      {col.render(row)}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell>
                      {actions(row)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-muted-foreground text-sm">
            {total === 0 ? 'Nenhum resultado' : `Mostrando ${start}–${end} de ${total}`}
          </p>
          <div className="flex items-center gap-2">
            <Select value={perPage.toString()} onValueChange={handlePerPageChange}>
              <SelectTrigger className="h-8 w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 15, 25, 50].map(n => (
                  <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p - 1)}
              disabled={page <= 1}
            >
              Anterior
            </Button>
            <span className="text-sm">Página {page} de {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
