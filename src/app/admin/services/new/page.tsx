'use client'

import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ServiceForm } from '../ServiceForm'
import type { ServiceInput } from '@/lib/schemas/parties'

export default function NewServicePage() {
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: (data: ServiceInput) =>
      fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: (result) => {
      if (result.id) {
        toast.success('Serviço criado com sucesso')
        router.push('/admin/services')
      } else {
        toast.error('Erro ao criar serviço')
      }
    },
    onError: () => toast.error('Erro ao criar serviço'),
  })

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Novo Serviço</h1>
        <p className="text-muted-foreground text-sm">Cadastre um novo serviço/produto e seus preços</p>
      </div>
      <ServiceForm onSubmit={mutation.mutate} isLoading={mutation.isPending} />
    </div>
  )
}
