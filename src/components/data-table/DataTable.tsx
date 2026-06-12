'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronsUpDownIcon,
  CheckIcon,
  XIcon,
  Loader2Icon,
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SortOrder = 'asc' | 'desc'

export type ColumnDef<T> = {
  key: string
  label: string
  sortable?: boolean
  editable?: boolean
  render?: (value: unknown, row: T) => React.ReactNode
}

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

type EditStage = 'editing' | 'confirming'

type EditState = {
  rowId: string | number
  key: string
  originalValue: string
  currentValue: string
  stage: EditStage
}

export type DataTableProps<T extends Record<string, unknown> & { id: string | number }> = {
  queryKey: string[]
  endpoint: string
  columns: ColumnDef<T>[]
  defaultLimit?: number
  defaultSort?: string
  idKey?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DataTable<T extends Record<string, unknown> & { id: string | number }>({
  queryKey,
  endpoint,
  columns,
  defaultLimit = 10,
  defaultSort = 'id',
  idKey = 'id',
}: DataTableProps<T>) {
  const queryClient = useQueryClient()

  const [page, setPage] = useState(1)
  const [limit] = useState(defaultLimit)
  const [sort, setSort] = useState(defaultSort)
  const [order, setOrder] = useState<SortOrder>('asc')
  const [filterInput, setFilterInput] = useState('')
  const [filter, setFilter] = useState('')
  const [editState, setEditState] = useState<EditState | null>(null)

  // Debounce filter 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilter(filterInput)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [filterInput])

  // Cancel edit when page/sort/filter changes
  useEffect(() => {
    setEditState(null)
  }, [page, sort, order, filter])

  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sort,
    order,
    ...(filter && { filter }),
  })

  const { data, isFetching, isLoading } = useQuery<PaginatedResponse<T>>({
    queryKey: [...queryKey, { page, limit, sort, order, filter }],
    queryFn: async () => {
      const res = await fetch(`${endpoint}?${searchParams}`)
      if (!res.ok) throw new Error('Falha ao carregar dados')
      return res.json()
    },
    placeholderData: (prev) => prev,
  })

  const mutation = useMutation({
    mutationFn: async ({
      id,
      changes,
    }: {
      id: string | number
      changes: Record<string, string>
    }) => {
      const res = await fetch(`${endpoint}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { error?: string }).error ?? 'Falha ao salvar')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
      toast.success('Alteração salva com sucesso!')
      setEditState(null)
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Erro ao salvar. Tente novamente.')
    },
  })

  function handleSort(key: string) {
    if (sort === key) {
      setOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
    } else {
      setSort(key)
      setOrder('asc')
    }
    setPage(1)
  }

  function startEdit(row: T, key: string) {
    setEditState({
      rowId: row[idKey] as string | number,
      key,
      originalValue: String(row[key] ?? ''),
      currentValue: String(row[key] ?? ''),
      stage: 'editing',
    })
  }

  function cancelEdit() {
    setEditState(null)
  }

  function moveToConfirm() {
    if (!editState) return
    if (editState.currentValue.trim() === editState.originalValue) {
      setEditState(null)
      return
    }
    setEditState({ ...editState, currentValue: editState.currentValue.trim(), stage: 'confirming' })
  }

  function confirmEdit() {
    if (!editState) return
    mutation.mutate({
      id: editState.rowId,
      changes: { [editState.key]: editState.currentValue },
    })
  }

  const rows = data?.data ?? []
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0
  const from = total === 0 ? 0 : (page - 1) * limit + 1
  const to = Math.min(page * limit, total)
  const editableCols = columns.filter((c) => c.editable)

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filtrar registros..."
            value={filterInput}
            onChange={(e) => setFilterInput(e.target.value)}
            className="h-9 w-64 pl-9 pr-8"
          />
          {isFetching && !isLoading && (
            <Loader2Icon className="absolute right-3 top-1/2 size-3.5 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>

        {total > 0 && (
          <span className="ml-auto text-xs text-muted-foreground">
            {from}–{to} de {total} registros
          </span>
        )}
      </div>

      {/* Table */}
      <div
        className={cn(
          'relative overflow-hidden rounded-xl border transition-opacity duration-200',
          (isFetching || mutation.isPending) && 'pointer-events-none opacity-70',
        )}
      >
        {/* Thin progress bar */}
        {(isFetching || mutation.isPending) && (
          <div className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-muted">
            <div className="h-full w-1/3 animate-[bounce_1s_ease-in-out_infinite] bg-brand-cyan" />
          </div>
        )}

        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-left">
                  {col.sortable ? (
                    <button
                      onClick={() => handleSort(col.key)}
                      className="flex items-center gap-1 font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {col.label}
                      {sort === col.key ? (
                        order === 'asc' ? (
                          <ChevronUpIcon className="size-3.5" />
                        ) : (
                          <ChevronDownIcon className="size-3.5" />
                        )
                      ) : (
                        <ChevronsUpDownIcon className="size-3.5 opacity-40" />
                      )}
                    </button>
                  ) : (
                    <span className="font-medium text-muted-foreground">{col.label}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              Array.from({ length: limit }).map((_, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/20'}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  Nenhum registro encontrado.
                </td>
              </tr>
            ) : (
              rows.map((row, i) => {
                const rowId = row[idKey] as string | number
                const isEditingRow = editState?.rowId === rowId
                const isMutatingRow = isEditingRow && mutation.isPending

                return (
                  <tr
                    key={rowId}
                    className={cn(
                      'group',
                      i % 2 === 0 ? 'bg-card' : 'bg-muted/20',
                    )}
                  >
                    {columns.map((col) => {
                      const value = row[col.key]
                      const isEditingCell = isEditingRow && editState?.key === col.key

                      if (col.editable && isEditingCell && editState) {
                        if (editState.stage === 'editing') {
                          return (
                            <td key={col.key} className="px-3 py-2">
                              <div className="flex items-center gap-1">
                                <Input
                                  value={editState.currentValue}
                                  onChange={(e) =>
                                    setEditState({ ...editState, currentValue: e.target.value })
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') moveToConfirm()
                                    if (e.key === 'Escape') cancelEdit()
                                  }}
                                  className="h-7 w-full text-sm"
                                  autoFocus
                                />
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="size-7 shrink-0 text-green-600 hover:bg-green-50 hover:text-green-700"
                                  onClick={moveToConfirm}
                                  title="Confirmar"
                                >
                                  <CheckIcon className="size-3.5" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="size-7 shrink-0 text-muted-foreground"
                                  onClick={cancelEdit}
                                  title="Cancelar"
                                >
                                  <XIcon className="size-3.5" />
                                </Button>
                              </div>
                            </td>
                          )
                        }

                        // Confirming stage
                        return (
                          <td key={col.key} className="px-3 py-2">
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                              <span className="text-muted-foreground line-through">
                                {editState.originalValue}
                              </span>
                              <span className="text-muted-foreground">→</span>
                              <span className="font-semibold text-foreground">
                                {editState.currentValue}
                              </span>
                              <Button
                                size="sm"
                                className="h-6 bg-brand-cyan px-2 text-xs text-white hover:bg-brand-cyan/90"
                                onClick={confirmEdit}
                                disabled={mutation.isPending}
                              >
                                {mutation.isPending ? (
                                  <Loader2Icon className="size-3 animate-spin" />
                                ) : (
                                  'Salvar'
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2 text-xs"
                                onClick={cancelEdit}
                                disabled={mutation.isPending}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </td>
                        )
                      }

                      // Normal cell — editable ones show pencil on hover
                      return (
                        <td key={col.key} className="px-4 py-3">
                          {col.editable ? (
                            <div className="flex items-center gap-1.5">
                              <span>
                                {col.render
                                  ? col.render(value, row)
                                  : value != null
                                    ? String(value)
                                    : '—'}
                              </span>
                              {isMutatingRow ? (
                                <Loader2Icon className="size-3.5 animate-spin shrink-0 text-muted-foreground" />
                              ) : (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="size-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-60 hover:opacity-100! text-muted-foreground hover:text-foreground"
                                  onClick={() => startEdit(row, col.key)}
                                  title={`Editar ${col.label}`}
                                >
                                  <PencilIcon className="size-3" />
                                </Button>
                              )}
                            </div>
                          ) : (
                            col.render
                              ? col.render(value, row)
                              : value != null
                                ? String(value)
                                : '—'
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Página {page} de {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="outline"
              className="size-8"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = totalPages <= 5 ? i + 1 : Math.max(1, page - 2) + i
              if (p > totalPages) return null
              return (
                <Button
                  key={p}
                  size="icon"
                  variant={p === page ? 'default' : 'outline'}
                  className="size-8 text-xs"
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              )
            })}
            <Button
              size="icon"
              variant="outline"
              className="size-8"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
