'use client'

import Link from 'next/link'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PlusIcon, PencilIcon, TrashIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/admin/ui/button'
import { Badge } from '@/components/admin/ui/badge'
import { DataTable } from '@/components/admin/data-table'
import { formatHourRange } from '@/lib/business-hours-format'
import type { BusinessHour } from '@/types/business-hours'
import type { Column } from '@/components/admin/data-table'

const columns: Column<BusinessHour>[] = [
  {
    key: 'label',
    header: 'Rótulo',
    sortable: true,
    render: (r) => (
      <div className="flex items-center gap-2">
        <span className="font-medium">{r.label}</span>
        {r.key && (
          <Badge variant="outline" className="font-mono text-xs">
            {r.key}
          </Badge>
        )}
      </div>
    ),
  },
  {
    key: 'range',
    header: 'Horário',
    render: (r) => formatHourRange(r.opening, r.close),
  },
]

export default function HoursPage() {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/hours/${id}`, { method: 'DELETE' })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body?.error ?? 'Erro ao remover horário')
      return body
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'hours'] })
      toast.success('Horário removido')
    },
    onError: (error: Error) =>
      toast.error(error.message || 'Erro ao remover horário'),
  })

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Horários de funcionamento</h1>
          <p className="text-muted-foreground text-sm">
            Horários de funcionamento exibidos no site e na API de conteúdo
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/admin/hours/new" />}>
          <PlusIcon className="size-4" />
          Novo horário
        </Button>
      </div>

      <DataTable<BusinessHour>
        queryKey={['admin', 'hours']}
        endpoint="/api/admin/hours"
        columns={columns}
        filters={[
          {
            key: 'search',
            placeholder: 'Buscar por rótulo...',
            type: 'search',
          },
        ]}
        actions={(hour) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              nativeButton={false}
              render={<Link href={`/admin/hours/${hour.id}`} />}
            >
              <PencilIcon className="size-4" />
            </Button>
            {!hour.key && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (confirm('Remover este horário?')) {
                    deleteMutation.mutate(hour.id)
                  }
                }}
              >
                <TrashIcon className="text-destructive size-4" />
              </Button>
            )}
          </div>
        )}
      />
    </div>
  )
}
