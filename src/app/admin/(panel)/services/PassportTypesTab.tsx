'use client'

import Link from 'next/link'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PlusIcon, PencilIcon, TrashIcon } from 'lucide-react'
import { Button } from '@/components/admin/ui/button'
import { Badge } from '@/components/admin/ui/badge'
import { DataTable } from '@/components/admin/data-table'
import { toast } from 'sonner'
import type { PassportType } from '@/types/tickets'
import type { Column } from '@/components/admin/data-table'

function currency(value: string) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const columns: Column<PassportType>[] = [
  {
    key: 'name',
    header: 'Nome',
    render: (r) => (
      <div className="flex items-center gap-2">
        <span className="font-medium">{r.name}</span>
        {r.key && (
          <Badge variant="secondary" className="text-xs">
            Fixo
          </Badge>
        )}
        {!r.active && (
          <Badge variant="outline" className="text-xs">
            Inativo
          </Badge>
        )}
      </div>
    ),
  },
  { key: 'durationMinutes', header: 'Duração', render: (r) => `${r.durationMinutes} min` },
  {
    key: 'weekdayChildPrice',
    header: 'Criança (segunda a quinta)',
    render: (r) => currency(r.weekdayChildPrice),
  },
  {
    key: 'weekendChildPrice',
    header: 'Criança (sexta a domingo e feriados)',
    render: (r) => currency(r.weekendChildPrice),
  },
  {
    key: 'weekdayCompanionPrice',
    header: 'Acompanhante (segunda a quinta)',
    render: (r) => currency(r.weekdayCompanionPrice),
  },
  {
    key: 'weekendCompanionPrice',
    header: 'Acompanhante (sexta a domingo e feriados)',
    render: (r) => currency(r.weekendCompanionPrice),
  },
]

export function PassportTypesTab() {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/admin/passport-types/${id}`, { method: 'DELETE' }).then((r) => r.json()),
    onSuccess: (result) => {
      if (result.error) {
        toast.error(result.error)
        return
      }
      queryClient.invalidateQueries({ queryKey: ['admin', 'passport-types'] })
      toast.success('Tipo de passaporte removido')
    },
    onError: () => toast.error('Erro ao remover tipo de passaporte'),
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Preços por duração, usados na compra antecipada e na vitrine do site
        </p>
        <Button nativeButton={false} render={<Link href="/admin/passport-types/new" />}>
          <PlusIcon className="size-4" />
          Novo passaporte
        </Button>
      </div>

      <DataTable<PassportType>
        queryKey={['admin', 'passport-types']}
        endpoint="/api/admin/passport-types"
        columns={columns}
        filters={[{ key: 'search', placeholder: 'Buscar por nome...', type: 'search' }]}
        actions={(passportType) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              nativeButton={false}
              render={<Link href={`/admin/passport-types/${passportType.id}`} />}
            >
              <PencilIcon className="size-4" />
            </Button>
            {!passportType.key && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (confirm('Remover este tipo de passaporte?')) {
                    deleteMutation.mutate(passportType.id)
                  }
                }}
              >
                <TrashIcon className="size-4 text-destructive" />
              </Button>
            )}
          </div>
        )}
      />
    </div>
  )
}
