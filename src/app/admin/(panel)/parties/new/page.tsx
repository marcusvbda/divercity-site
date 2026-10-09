'use client'

import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PartyForm } from '../PartyForm'

import type { PartyFormData } from '../PartyForm'

export default function NewPartyPage() {
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: (data: PartyFormData) =>
      fetch('/api/admin/parties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: (result) => {
      if (result?.id) {
        toast.success('Festa criada com sucesso')
        router.push(`/admin/parties/${result.id}`)
      } else {
        toast.error(result?.error ?? 'Erro ao criar festa')
      }
    },
    onError: () => toast.error('Erro ao criar festa'),
  })

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Nova Festa</h1>
        <p className="text-muted-foreground text-sm">Cadastre uma nova festa com contrato</p>
      </div>
      <PartyForm onSubmit={mutation.mutate} isLoading={mutation.isPending} />
    </div>
  )
}
