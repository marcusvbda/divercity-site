'use client'

import Link from 'next/link'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PlusIcon, PencilIcon, TrashIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/admin/ui/button'
import { Badge } from '@/components/admin/ui/badge'
import { DataTable } from '@/components/admin/data-table'
import type { Faq, FaqStatus } from '@/types/faqs'
import type { Column } from '@/components/admin/data-table'

const STATUS_LABEL: Record<FaqStatus, string> = {
  unanswered: 'Sem resposta',
  answered: 'Respondida, não publicada',
  published: 'Publicada',
}

const STATUS_VARIANT: Record<FaqStatus, 'outline' | 'secondary' | 'default'> = {
  unanswered: 'outline',
  answered: 'secondary',
  published: 'default',
}

function statusOf(faq: Faq): FaqStatus {
  if (faq.answer.trim() === '') return 'unanswered'
  return faq.published ? 'published' : 'answered'
}

const columns: Column<Faq>[] = [
  {
    key: 'question',
    header: 'Pergunta',
    render: (r) => (
      <span className="line-clamp-2 max-w-md font-medium break-words">
        {r.question}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (r) => {
      const status = statusOf(r)
      return (
        <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
      )
    },
  },
  {
    key: 'createdAt',
    header: 'Criada em',
    render: (r) => new Date(r.createdAt).toLocaleDateString('pt-BR'),
  },
]

export default function FaqsPage() {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/faqs/${id}`, { method: 'DELETE' })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body?.error ?? 'Erro ao remover FAQ')
      return body
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'faqs'] })
      toast.success('FAQ removida')
    },
    onError: (error: Error) =>
      toast.error(error.message || 'Erro ao remover FAQ'),
  })

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">FAQs</h1>
          <p className="text-muted-foreground text-sm">
            Perguntas frequentes e suas respostas
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/admin/faqs/new" />}>
          <PlusIcon className="size-4" />
          Nova FAQ
        </Button>
      </div>

      <DataTable<Faq>
        queryKey={['admin', 'faqs']}
        endpoint="/api/admin/faqs"
        columns={columns}
        filters={[
          {
            key: 'published',
            type: 'select',
            placeholder: 'Publicação',
            options: [
              { label: 'Todas', value: '' },
              { label: 'Publicadas', value: 'true' },
              { label: 'Não publicadas', value: 'false' },
            ],
          },
          {
            key: 'unanswered',
            type: 'select',
            placeholder: 'Resposta',
            options: [
              { label: 'Todas', value: '' },
              { label: 'Sem resposta', value: 'true' },
            ],
          },
        ]}
        actions={(faq) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Editar FAQ"
              nativeButton={false}
              render={<Link href={`/admin/faqs/${faq.id}`} />}
            >
              <PencilIcon className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Remover FAQ"
              onClick={() => {
                if (confirm('Remover esta FAQ?')) {
                  deleteMutation.mutate(faq.id)
                }
              }}
            >
              <TrashIcon className="text-destructive size-4" />
            </Button>
          </div>
        )}
      />
    </div>
  )
}
