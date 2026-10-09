'use client'

import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CustomerForm } from '../CustomerForm'
import type { CustomerInput } from '@/lib/schemas/parties'
import { parseCustomerResponse } from '@/lib/customer-errors'

export default function NewCustomerPage() {
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: (data: CustomerInput) =>
      fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(parseCustomerResponse),
    onSuccess: (result) => {
      if (result.id) {
        toast.success('Cliente criado com sucesso')
        router.push('/admin/customers')
      } else {
        toast.error('Erro ao criar cliente')
      }
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 p-6">
      <CustomerForm
        title="Novo Cliente"
        description="Cadastre um novo cliente"
        onSubmit={mutation.mutate}
        isLoading={mutation.isPending}
      />
    </div>
  )
}
