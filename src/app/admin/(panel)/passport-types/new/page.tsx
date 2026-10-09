'use client'

import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PassportTypeForm } from '../PassportTypeForm'
import type { PassportTypeInput } from '@/lib/schemas/tickets'

export default function NewPassportTypePage() {
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: (data: PassportTypeInput) =>
      fetch('/api/admin/passport-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: (result) => {
      if (result.id) {
        toast.success('Tipo de passaporte criado com sucesso')
        router.push('/admin/passport-types')
      } else {
        toast.error('Erro ao criar tipo de passaporte')
      }
    },
    onError: () => toast.error('Erro ao criar tipo de passaporte'),
  })

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <PassportTypeForm
        title="Novo Tipo de Passaporte"
        description="Cadastre uma duração e seus preços para a compra antecipada"
        onSubmit={mutation.mutate}
        isLoading={mutation.isPending}
      />
    </div>
  )
}
