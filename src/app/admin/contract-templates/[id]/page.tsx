'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { TemplateForm } from '../TemplateForm'
import type { ContractTemplate } from '@/types/parties'
import type { ContractTemplateInput } from '@/lib/schemas/parties'

export default function EditTemplatePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: template, isLoading } = useQuery<ContractTemplate>({
    queryKey: ['admin', 'contract-templates', id],
    queryFn: () => fetch(`/api/admin/contract-templates/${id}`).then(r => r.json()),
  })

  const mutation = useMutation({
    mutationFn: (data: ContractTemplateInput) =>
      fetch(`/api/admin/contract-templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: (result) => {
      if (result.id) {
        queryClient.invalidateQueries({ queryKey: ['admin', 'contract-templates'] })
        toast.success('Modelo atualizado')
        router.push('/admin/contract-templates')
      } else {
        toast.error('Erro ao atualizar modelo')
      }
    },
    onError: () => toast.error('Erro ao atualizar modelo'),
  })

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full max-w-3xl" />
        <Skeleton className="h-64 w-full max-w-3xl" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Editar Modelo</h1>
        <p className="text-muted-foreground text-sm">{template?.name}</p>
      </div>
      <TemplateForm
        defaultValues={
          template
            ? { name: template.name, body: template.body, isDefault: template.isDefault }
            : undefined
        }
        onSubmit={mutation.mutate}
        isLoading={mutation.isPending}
      />
    </div>
  )
}
