'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { ServiceForm } from '../ServiceForm'
import type { Service } from '@/types/parties'
import type { ServiceInput } from '@/lib/schemas/parties'

export default function EditServicePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: service, isLoading } = useQuery<Service>({
    queryKey: ['admin', 'services', id],
    queryFn: () => fetch(`/api/admin/services/${id}`).then((r) => r.json()),
  })

  const mutation = useMutation({
    mutationFn: (data: ServiceInput) =>
      fetch(`/api/admin/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: (result) => {
      if (result.id) {
        queryClient.invalidateQueries({ queryKey: ['admin', 'services'] })
        toast.success('Serviço atualizado')
        router.push('/admin/services')
      } else {
        toast.error('Erro ao atualizar serviço')
      }
    },
    onError: () => toast.error('Erro ao atualizar serviço'),
  })

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full max-w-3xl" />
        <Skeleton className="h-32 w-full max-w-3xl" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Editar Serviço</h1>
        <p className="text-muted-foreground text-sm">{service?.name}</p>
      </div>
      <ServiceForm
        defaultValues={
          service
            ? {
                name: service.name,
                weekdayPrice: Number(service.weekdayPrice),
                weekendPrice: Number(service.weekendPrice),
              }
            : undefined
        }
        onSubmit={mutation.mutate}
        isLoading={mutation.isPending}
      />
    </div>
  )
}
