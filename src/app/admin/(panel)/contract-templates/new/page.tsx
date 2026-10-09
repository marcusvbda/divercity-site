'use client'

import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { TemplateForm } from '../TemplateForm'
import type { ContractTemplateInput } from '@/lib/schemas/parties'

export default function NewTemplatePage() {
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: (data: ContractTemplateInput) =>
      fetch('/api/admin/contract-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: (result) => {
      if (result.id) {
        toast.success('Modelo criado com sucesso')
        router.push('/admin/contract-templates')
      } else {
        toast.error('Erro ao criar modelo')
      }
    },
    onError: () => toast.error('Erro ao criar modelo'),
  })

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <TemplateForm
        title="Novo Modelo"
        description="Crie um template de contrato reutilizável"
        onSubmit={mutation.mutate}
        isLoading={mutation.isPending}
      />
    </div>
  )
}
