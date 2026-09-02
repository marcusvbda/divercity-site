'use client'

import Link from 'next/link'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PlusIcon, PencilIcon, TrashIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AdminDataTable } from '@/components/ui/admin-data-table'
import { toast } from 'sonner'
import type { PassportType } from '@/types/tickets'
import type { Column } from '@/components/ui/admin-data-table'

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
    header: 'Criança (semana)',
    render: (r) => currency(r.weekdayChildPrice),
  },
  {
    key: 'weekendChildPrice',
    header: 'Criança (fim de semana)',
    render: (r) => currency(r.weekendChildPrice),
  },
  {
    key: 'weekdayCompanionPrice',
    header: 'Acompanhante (semana)',
    render: (r) => currency(r.weekdayCompanionPrice),
  },
  {
    key: 'weekendCompanionPrice',
    header: 'Acompanhante (fim de semana)',
    render: (r) => currency(r.weekendCompanionPrice),
  },
]

export default function PassportTypesPage() {
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
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Passaportes — Compra Antecipada</h1>
          <p className="text-muted-foreground text-sm">
            Preços por duração, usados no cálculo da compra antecipada pelo site
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/admin/passport-types/new" />}>
          <PlusIcon className="size-4" />
          Novo tipo de passaporte
        </Button>
      </div>

      <AdminDataTable<PassportType>
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
          </div>
        )}
      />
    </div>
  )
}
