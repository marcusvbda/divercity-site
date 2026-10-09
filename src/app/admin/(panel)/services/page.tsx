'use client'

import Link from 'next/link'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PlusIcon, PencilIcon, TrashIcon } from 'lucide-react'
import { Button } from '@/components/admin/ui/button'
import { Badge } from '@/components/admin/ui/badge'
import { DataTable } from '@/components/admin/data-table'
import { toast } from 'sonner'
import { useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/admin/ui/tabs'
import { PassportTypesTab } from './PassportTypesTab'
import type { Service } from '@/types/parties'
import type { Column } from '@/components/admin/data-table'

function currency(value: string) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const columns: Column<Service>[] = [
  {
    key: 'name',
    header: 'Nome',
    sortable: true,
    render: (r) => (
      <div className="flex items-center gap-2">
        <span className="font-medium">{r.name}</span>
        {r.key && (
          <Badge variant="outline" className="font-mono text-xs">
            {r.key}
          </Badge>
        )}
      </div>
    ),
  },
  {
    key: 'weekdayPrice',
    header: 'Dia de semana',
    render: (r) => currency(r.weekdayPrice),
  },
  {
    key: 'weekendPrice',
    header: 'Fim de semana',
    render: (r) => currency(r.weekendPrice),
  },
]

function ServicesTab() {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/admin/services/${id}`, { method: 'DELETE' }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'services'] })
      toast.success('Serviço removido')
    },
    onError: () => toast.error('Erro ao remover serviço'),
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Preços usados no orçamento e na reserva de festas
        </p>
        <Button nativeButton={false} render={<Link href="/admin/services/new" />}>
          <PlusIcon className="size-4" />
          Novo serviço
        </Button>
      </div>

      <DataTable<Service>
        queryKey={['admin', 'services']}
        endpoint="/api/admin/services"
        columns={columns}
        filters={[{ key: 'search', placeholder: 'Buscar por nome...', type: 'search' }]}
        actions={(service) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              nativeButton={false}
              render={<Link href={`/admin/services/${service.id}`} />}
            >
              <PencilIcon className="size-4" />
            </Button>
            {!service.key && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (confirm('Remover este serviço? Isso pode afetar cálculos que dependem dele.')) {
                    deleteMutation.mutate(service.id)
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

export default function PricesPage() {
  const tab = useSearchParams().get('tab') === 'passaportes' ? 'passaportes' : 'salao'

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Preços</h1>
        <p className="text-muted-foreground text-sm">
          Preços do salão de festas e dos passaportes
        </p>
      </div>

      <Tabs defaultValue={tab}>
        <TabsList>
          <TabsTrigger value="salao">Salão de festas</TabsTrigger>
          <TabsTrigger value="passaportes">Passaportes</TabsTrigger>
        </TabsList>
        <TabsContent value="salao">
          <ServicesTab />
        </TabsContent>
        <TabsContent value="passaportes">
          <PassportTypesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
