'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Skeleton } from '@/components/admin/ui/skeleton'
import { HourForm } from '../HourForm'
import type { HourFormValues } from '../HourForm'
import type { BusinessHour } from '@/types/business-hours'

export default function EditHourPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: hour, isLoading } = useQuery<BusinessHour>({
    queryKey: ['admin', 'hours', id],
    queryFn: () => fetch(`/api/admin/hours/${id}`).then((r) => r.json()),
  })

  const mutation = useMutation({
    mutationFn: (data: HourFormValues) =>
      fetch(`/api/admin/hours/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: (result) => {
      if (result.id) {
        queryClient.invalidateQueries({ queryKey: ['admin', 'hours'] })
        toast.success('Horário atualizado')
        router.push('/admin/hours')
      } else {
        toast.error('Erro ao atualizar horário')
      }
    },
    onError: () => toast.error('Erro ao atualizar horário'),
  })

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-full max-w-3xl" />
        <Skeleton className="h-32 w-full max-w-3xl" />
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <HourForm
        title="Editar Horário"
        description={hour?.label}
        hourKey={hour?.key}
        defaultValues={
          hour?.id
            ? { label: hour.label, opening: hour.opening, close: hour.close }
            : undefined
        }
        onSubmit={mutation.mutate}
        isLoading={mutation.isPending}
      />
    </div>
  )
}
