'use client'

import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { HourForm } from '../HourForm'
import type { HourFormValues } from '../HourForm'

export default function NewHourPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: HourFormValues) =>
      fetch('/api/admin/hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: (result) => {
      if (result.id) {
        queryClient.invalidateQueries({ queryKey: ['admin', 'hours'] })
        toast.success('Horário criado com sucesso')
        router.push('/admin/hours')
      } else {
        toast.error('Erro ao criar horário')
      }
    },
    onError: () => toast.error('Erro ao criar horário'),
  })

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <HourForm
        title="Novo Horário"
        description="Cadastre um novo horário de funcionamento"
        onSubmit={mutation.mutate}
        isLoading={mutation.isPending}
      />
    </div>
  )
}
