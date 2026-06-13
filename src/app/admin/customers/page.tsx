'use client'

import Link from 'next/link'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PlusIcon, PencilIcon, TrashIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdminDataTable } from '@/components/ui/admin-data-table'
import { toast } from 'sonner'
import type { Customer } from '@/types/parties'
import type { Column } from '@/components/ui/admin-data-table'

function formatCPF(cpf: string) {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

function formatPhone(phone: string | null | undefined) {
  if (!phone) return '—'
  return phone.replace(/^(\d{2})(\d{4,5})(\d{4})$/, '($1) $2-$3')
}

const columns: Column<Customer>[] = [
  { key: 'name', header: 'Nome', sortable: true, render: r => <span className="font-medium">{r.name}</span> },
  { key: 'cpf', header: 'CPF', sortable: true, render: r => <span className="font-mono text-sm">{formatCPF(r.cpf)}</span> },
  { key: 'email', header: 'Email', render: r => r.email ?? '—' },
  { key: 'phone', header: 'Telefone', render: r => formatPhone(r.phone) },
]

export default function CustomersPage() {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/admin/customers/${id}`, { method: 'DELETE' }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'customers'] })
      toast.success('Cliente removido')
    },
    onError: () => toast.error('Erro ao remover cliente'),
  })

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-muted-foreground text-sm">Gerencie os clientes do Divercity Park</p>
        </div>
        <Button nativeButton={false} render={<Link href="/admin/customers/new" />}>
          <PlusIcon className="size-4" />
          Novo cliente
        </Button>
      </div>

      <AdminDataTable<Customer>
        queryKey={['admin', 'customers']}
        endpoint="/api/admin/customers"
        columns={columns}
        filters={[{ key: 'search', placeholder: 'Buscar por nome ou CPF...', type: 'search' }]}
        actions={customer => (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" nativeButton={false} render={<Link href={`/admin/customers/${customer.id}`} />}>
              <PencilIcon className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (confirm('Remover este cliente?')) {
                  deleteMutation.mutate(customer.id)
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
