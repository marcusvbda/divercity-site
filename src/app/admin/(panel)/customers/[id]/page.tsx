'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Skeleton } from '@/components/admin/ui/skeleton'
import { CustomerForm } from '../CustomerForm'
import type { Customer } from '@/types/parties'
import type { CustomerInput } from '@/lib/schemas/parties'
import { parseCustomerResponse } from '@/lib/customer-errors'

export default function EditCustomerPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: customer, isLoading } = useQuery<Customer>({
    queryKey: ['admin', 'customers', id],
    queryFn: () => fetch(`/api/admin/customers/${id}`).then(r => r.json()),
  })

  const mutation = useMutation({
    mutationFn: (data: CustomerInput) =>
      fetch(`/api/admin/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(parseCustomerResponse),
    onSuccess: (result) => {
      if (result.id) {
        queryClient.invalidateQueries({ queryKey: ['admin', 'customers'] })
        toast.success('Cliente atualizado')
        router.push('/admin/customers')
      } else {
        toast.error('Erro ao atualizar cliente')
      }
    },
    onError: (err: Error) => toast.error(err.message),
  })

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6 p-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex w-full flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-9 w-full" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 p-6">
      <CustomerForm
        title="Editar Cliente"
        description={customer?.name}
        defaultValues={customer ? { name: customer.name, cpf: customer.cpf, email: customer.email ?? '', phone: customer.phone ?? '' } : undefined}
        onSubmit={mutation.mutate}
        isLoading={mutation.isPending}
      />
    </div>
  )
}
