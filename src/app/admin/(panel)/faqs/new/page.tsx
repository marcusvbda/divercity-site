'use client'

import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { FaqApiError, FaqForm, parseFaqResponse } from '../FaqForm'
import type { FaqFormValues } from '../FaqForm'
import type { Faq } from '@/types/faqs'

export default function NewFaqPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (data: FaqFormValues) => {
      const res = await fetch('/api/admin/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: data.question, answer: data.answer }),
      })
      return parseFaqResponse<Faq>(res, 'Erro ao criar FAQ')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'faqs'] })
      toast.success('FAQ criada com sucesso')
      router.push('/admin/faqs')
    },
    onError: (error: Error) =>
      toast.error(error.message || 'Erro ao criar FAQ'),
  })

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <FaqForm
        mode="create"
        title="Nova FAQ"
        description="Cadastre uma nova pergunta frequente"
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
