'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { PassportTypeForm } from '../PassportTypeForm'
import type { PassportType } from '@/types/tickets'
import type { PassportTypeInput } from '@/lib/schemas/tickets'

export default function EditPassportTypePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: passportType, isLoading } = useQuery<PassportType>({
    queryKey: ['admin', 'passport-types', id],
    queryFn: () => fetch(`/api/admin/passport-types/${id}`).then((r) => r.json()),
  })

  const mutation = useMutation({
    mutationFn: (data: PassportTypeInput) =>
      fetch(`/api/admin/passport-types/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: (result) => {
      if (result.id) {
        queryClient.invalidateQueries({ queryKey: ['admin', 'passport-types'] })
        toast.success('Tipo de passaporte atualizado')
        router.push('/admin/passport-types')
      } else {
        toast.error('Erro ao atualizar tipo de passaporte')
      }
    },
    onError: () => toast.error('Erro ao atualizar tipo de passaporte'),
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
        <h1 className="text-2xl font-bold">Editar Tipo de Passaporte</h1>
        <p className="text-muted-foreground text-sm">{passportType?.name}</p>
      </div>
      <PassportTypeForm
        defaultValues={
          passportType
            ? {
                name: passportType.name,
                durationMinutes: passportType.durationMinutes,
                weekdayChildPrice: Number(passportType.weekdayChildPrice),
                weekendChildPrice: Number(passportType.weekendChildPrice),
                weekdayCompanionPrice: Number(passportType.weekdayCompanionPrice),
                weekendCompanionPrice: Number(passportType.weekendCompanionPrice),
                active: passportType.active,
              }
            : undefined
        }
        onSubmit={mutation.mutate}
        isLoading={mutation.isPending}
      />
    </div>
  )
}
