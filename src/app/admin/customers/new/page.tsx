'use client'

import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CustomerForm } from '../CustomerForm'
import type { CustomerInput } from '@/lib/schemas/parties'

export default function NewCustomerPage() {
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: (data: CustomerInput) =>
      fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: (result) => {
      if (result.id) {
        toast.success('Cliente criado com sucesso')
        router.push('/admin/customers')
      } else {
        toast.error('Erro ao criar cliente')
      }
    },
    onError: () => toast.error('Erro ao criar cliente'),
  })

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Novo Cliente</h1>
        <p className="text-muted-foreground text-sm">Cadastre um novo cliente</p>
      </div>
      <CustomerForm
        onSubmit={mutation.mutate}
        isLoading={mutation.isPending}
      />
    </div>
  )
}
