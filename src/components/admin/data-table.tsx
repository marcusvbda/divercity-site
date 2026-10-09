'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  SearchIcon,
} from 'lucide-react'
import { Button } from '@/components/admin/ui/button'
import { Card } from '@/components/admin/ui/card'
import { Input } from '@/components/admin/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/admin/ui/input-group'
import { Label } from '@/components/admin/ui/label'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from '@/components/admin/ui/pagination'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/admin/ui/select'
import { Skeleton } from '@/components/admin/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/admin/ui/table'
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

type PaginationInfo = {
  page: number
  perPage: number
  total: number
  totalPages: number
}

type ApiResponse<T> = {
  data: T[]
  pagination: PaginationInfo
}

type DataTableProps<T extends { id: number | string }> = {
  queryKey: string[]
  endpoint: string
  columns: Column<T>[]
  filters?: FilterConfig[]
  actions?: (row: T) => React.ReactNode
  onRowClick?: (row: T) => void
  defaultPerPage?: number
}

const PER_PAGE_OPTIONS = [10, 15, 25, 50]
const PER_PAGE_ITEMS = PER_PAGE_OPTIONS.map((n) => ({
  label: String(n),
  value: String(n),
}))

function getVisiblePages(currentPage: number, totalPages: number) {
  const window = 1
  const first = Math.max(
    1,
    Math.min(currentPage - window, totalPages - window * 2)
  )
  const last = Math.min(totalPages, first + window * 2)
  const pages: number[] = []
  for (let p = first; p <= last; p++) pages.push(p)
  return {
    pages,
    showLeftEllipsis: first > 1,
    showRightEllipsis: last < totalPages,
  }
}

export function DataTable<T extends { id: number | string }>({
  queryKey,
  endpoint,
  columns,
  filters,
  actions,
  onRowClick,
  defaultPerPage = 15,
}: DataTableProps<T>) {
  const searchParams = useSearchParams()
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(defaultPerPage)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [filterValues, setFilterValues] = useState<Record<string, string>>(
    () => {
      const initial: Record<string, string> = {}
      filters?.forEach((f) => {
        const v = searchParams.get(f.key)
        if (v) initial[f.key] = v
      })
      return initial
    }
  )

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
    queryFn: () => fetch(buildUrl()).then((r) => r.json()),
  })

  function handleSort(key: string) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  function handleFilterChange(key: string, value: string) {
    setFilterValues((prev) => ({ ...prev, [key]: value }))
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
  const { pages, showLeftEllipsis, showRightEllipsis } = getVisiblePages(
    page,
    totalPages
  )

  const searchFilters = (filters ?? []).filter(
    (f) => !f.type || f.type === 'search'
  )
  const fieldFilters = (filters ?? []).filter(
    (f) => f.type === 'select' || f.type === 'date'
  )

  return (
    <Card className="py-0 shadow-none">
      <div className="w-full">
        <div className="border-b">
          {fieldFilters.length > 0 && (
            <div className="flex flex-col gap-4 border-b p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                {fieldFilters.map((filter) => {
                  const id = `filter-${filter.key}`
                  if (filter.type === 'select') {
                    const items = (filter.options ?? []).map((opt) => ({
                      label: opt.label,
                      value: opt.value || 'all',
                    }))
                    return (
                      <div
                        key={filter.key}
                        className="flex w-full flex-col gap-2"
                      >
                        <Label htmlFor={id}>
                          {filter.placeholder ?? filter.key}
                        </Label>
                        <Select
                          items={items}
                          value={filterValues[filter.key] || 'all'}
                          onValueChange={(v: string | null) =>
                            handleFilterChange(
                              filter.key,
                              v === 'all' ? '' : (v ?? '')
                            )
                          }
                        >
                          <SelectTrigger id={id} className="w-full">
                            <SelectValue placeholder={filter.placeholder} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {items.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    )
                  }
                  return (
                    <div
                      key={filter.key}
                      className="flex w-full flex-col gap-2"
                    >
                      <Label htmlFor={id}>{filter.placeholder ?? 'Data'}</Label>
                      <Input
                        id={id}
                        type="date"
                        value={filterValues[filter.key] ?? ''}
                        onChange={(e) =>
                          handleFilterChange(filter.key, e.target.value)
                        }
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex gap-4 p-6 max-sm:flex-col sm:items-center sm:justify-between">
            <div className="flex w-full flex-wrap gap-3">
              {searchFilters.map((filter) => {
                const id = `filter-${filter.key}`
                return (
                  <div key={filter.key} className="w-full max-w-xs">
                    <Label htmlFor={id} className="sr-only">
                      {filter.placeholder ?? 'Buscar'}
                    </Label>
                    <InputGroup>
                      <InputGroupAddon>
                        <SearchIcon />
                      </InputGroupAddon>
                      <InputGroupInput
                        id={id}
                        type="text"
                        placeholder={filter.placeholder ?? 'Buscar...'}
                        value={filterValues[filter.key] ?? ''}
                        onChange={(e) =>
                          handleFilterChange(filter.key, e.target.value)
                        }
                      />
                    </InputGroup>
                  </div>
                )
              })}
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="rows-per-page" className="sr-only">
                Linhas por página
              </Label>
              <Select
                items={PER_PAGE_ITEMS}
                value={String(perPage)}
                onValueChange={handlePerPageChange}
              >
                <SelectTrigger
                  id="rows-per-page"
                  className="w-fit whitespace-nowrap"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {PER_PAGE_OPTIONS.map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="h-14 border-t">
                {columns.map((col) => (
                  <TableHead
                    key={col.key}
                    className={cn(
                      'text-muted-foreground first:pl-4',
                      col.className
                    )}
                    aria-sort={
                      col.sortable && sortKey === col.key
                        ? sortDir === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : undefined
                    }
                  >
                    {col.sortable ? (
                      <div
                        className="flex h-full cursor-pointer items-center justify-between gap-2 select-none"
                        onClick={() => handleSort(col.key)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            handleSort(col.key)
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        {col.header}
                        {sortKey === col.key &&
                          (sortDir === 'asc' ? (
                            <ChevronUpIcon
                              className="size-4 shrink-0 opacity-60"
                              aria-hidden="true"
                            />
                          ) : (
                            <ChevronDownIcon
                              className="size-4 shrink-0 opacity-60"
                              aria-hidden="true"
                            />
                          ))}
                      </div>
                    ) : (
                      col.header
                    )}
                  </TableHead>
                ))}
                {actions && <TableHead className="w-24 px-4" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: colSpan }).map((_, j) => (
                      <TableCell key={j} className="h-14 first:pl-4">
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={colSpan}
                    className="text-muted-foreground h-24 text-center"
                  >
                    Nenhum item encontrado
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className={onRowClick ? 'cursor-pointer' : undefined}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {columns.map((col) => (
                      <TableCell
                        key={col.key}
                        className={cn('h-14 first:pl-4', col.className)}
                      >
                        {col.render(row)}
                      </TableCell>
                    ))}
                    {actions && (
                      <TableCell
                        className="h-14 px-4"
                        onClick={
                          onRowClick ? (e) => e.stopPropagation() : undefined
                        }
                      >
                        {actions(row)}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between gap-3 px-6 py-4 max-sm:flex-col md:max-lg:flex-col">
          <p
            className="text-muted-foreground text-sm whitespace-nowrap"
            aria-live="polite"
          >
            {total === 0
              ? 'Nenhum resultado'
              : `Mostrando ${start}–${end} de ${total}`}
          </p>

          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="ghost"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page <= 1}
                  aria-label="Página anterior"
                >
                  <ChevronLeftIcon aria-hidden="true" />
                  <span className="max-sm:hidden">Anterior</span>
                </Button>
              </PaginationItem>

              {showLeftEllipsis && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {pages.map((p) => {
                const isActive = p === page
                return (
                  <PaginationItem key={p}>
                    <Button
                      size="icon"
                      className={cn(
                        !isActive &&
                          'bg-primary/10 text-primary hover:bg-primary/20'
                      )}
                      onClick={() => setPage(p)}
                      aria-current={isActive ? 'page' : undefined}
                      aria-label={`Página ${p} de ${totalPages}`}
                    >
                      {p}
                    </Button>
                  </PaginationItem>
                )
              })}

              {showRightEllipsis && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              <PaginationItem>
                <Button
                  variant="ghost"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages}
                  aria-label="Próxima página"
                >
                  <span className="max-sm:hidden">Próxima</span>
                  <ChevronRightIcon aria-hidden="true" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </Card>
  )
}
