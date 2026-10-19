'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Skeleton } from '@/components/admin/ui/skeleton'
import { FaqApiError, FaqForm, parseFaqResponse } from '../FaqForm'
import type { FaqFormValues } from '../FaqForm'
import type { Faq } from '@/types/faqs'

export default function EditFaqPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()

  const {
    data: faq,
    isLoading,
    error: loadError,
  } = useQuery<Faq>({
    queryKey: ['admin', 'faqs', id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/faqs/${id}`)
      if (res.status === 404) throw new FaqApiError('FAQ não encontrada')
      return parseFaqResponse<Faq>(res, 'Erro ao carregar FAQ')
    },
    retry: false,
  })

  const mutation = useMutation({
    mutationFn: async (data: FaqFormValues) => {
      const res = await fetch(`/api/admin/faqs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answer: data.answer,
          published: data.published,
        }),
      })
      return parseFaqResponse<Faq>(res, 'Erro ao atualizar FAQ')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'faqs'] })
      toast.success('FAQ atualizada')
      router.push('/admin/faqs')
    },
    onError: (error: Error) =>
      toast.error(error.message || 'Erro ao atualizar FAQ'),
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

  if (loadError || !faq) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 p-6">
        <h1 className="text-xl font-semibold">
          {loadError?.message || 'FAQ não encontrada'}
        </h1>
        <p className="text-muted-foreground text-sm">
          Volte para a lista de FAQs e tente novamente.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <FaqForm
        mode="edit"
        title="Editar FAQ"
        defaultValues={{
          question: faq.question,
          answer: faq.answer,
          published: faq.published,
        }}
        fieldErrors={
          mutation.error instanceof FaqApiError
            ? mutation.error.fieldErrors
            : undefined
        }
        onSubmit={mutation.mutate}
        isLoading={mutation.isPending}
      />
    </div>
  )
}
