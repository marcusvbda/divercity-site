'use client'

import Link from 'next/link'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PlusIcon, PencilIcon, TrashIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AdminDataTable } from '@/components/ui/admin-data-table'
import { toast } from 'sonner'
import type { ContractTemplate } from '@/types/parties'
import type { Column } from '@/components/ui/admin-data-table'

const columns: Column<ContractTemplate>[] = [
  { key: 'name', header: 'Nome', sortable: true, render: r => <span className="font-medium">{r.name}</span> },
  {
    key: 'variables',
    header: 'Variáveis',
    render: r => (
      <div className="flex flex-wrap gap-1">
        {r.variables.length === 0 ? (
          <span className="text-muted-foreground text-xs">Nenhuma</span>
        ) : (
          r.variables.map(v => (
            <Badge key={v} variant="secondary" className="font-mono text-xs">
              {`{{${v}}}`}
            </Badge>
          ))
        )}
      </div>
    ),
  },
]

export default function ContractTemplatesPage() {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/admin/contract-templates/${id}`, { method: 'DELETE' }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'contract-templates'] })
      toast.success('Modelo removido')
    },
    onError: () => toast.error('Erro ao remover modelo'),
  })

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Modelos de Contrato</h1>
          <p className="text-muted-foreground text-sm">Templates reutilizáveis com variáveis dinâmicas</p>
        </div>
        <Button nativeButton={false} render={<Link href="/admin/contract-templates/new" />}>
          <PlusIcon className="size-4" />
          Novo modelo
        </Button>
      </div>

      <AdminDataTable<ContractTemplate>
        queryKey={['admin', 'contract-templates']}
        endpoint="/api/admin/contract-templates"
        columns={columns}
        filters={[{ key: 'search', placeholder: 'Buscar por nome...', type: 'search' }]}
        actions={template => (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" nativeButton={false} render={<Link href={`/admin/contract-templates/${template.id}`} />}>
              <PencilIcon className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (confirm('Remover este modelo?')) {
                  deleteMutation.mutate(template.id)
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
