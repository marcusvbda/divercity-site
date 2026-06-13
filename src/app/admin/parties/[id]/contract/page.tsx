'use client'

import { useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ClipboardCopyIcon, PrinterIcon, LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { Party, ContractStatus } from '@/types/parties'

const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  draft: 'Rascunho',
  pending: 'Pendente',
  in_review: 'Em revisão',
  signed: 'Assinado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
}

const CONTRACT_STATUS_VARIANT: Record<
  ContractStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  draft: 'outline',
  pending: 'secondary',
  in_review: 'secondary',
  signed: 'default',
  completed: 'default',
  cancelled: 'destructive',
}

export default function PartyContractPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()

  const { data: party, isLoading } = useQuery<Party>({
    queryKey: ['admin', 'parties', id],
    queryFn: () => fetch(`/api/admin/parties/${id}`).then((r) => r.json()),
  })

  const contract = party?.contract

  const toggleLinkMutation = useMutation({
    mutationFn: () =>
      fetch(`/api/admin/contracts/${contract?.id}/toggle-link`, {
        method: 'POST',
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'parties', id] })
      toast.success(contract?.clientLinkOpen ? 'Link fechado' : 'Link aberto')
    },
    onError: () => toast.error('Erro ao alterar link'),
  })

  const generateTokenMutation = useMutation({
    mutationFn: () =>
      fetch(`/api/admin/contracts/${contract?.id}/generate-token`, {
        method: 'POST',
      }).then((r) => r.json()),
    onSuccess: (result) => {
      const url = `${window.location.origin}/c/${result.clientToken}`
      navigator.clipboard.writeText(url)
      queryClient.invalidateQueries({ queryKey: ['admin', 'parties', id] })
      toast.success('Link copiado para a área de transferência!')
    },
    onError: () => toast.error('Erro ao gerar link'),
  })

  function handlePrint() {
    window.print()
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-96 w-full max-w-3xl" />
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <p className="text-muted-foreground text-sm">
          Nenhum contrato encontrado para esta festa.
        </p>
      </div>
    )
  }

  const renderedBody = contract.body.replace(
    /\{\{(\w+)\}\}/g,
    (_match: string, key: string) => {
      const values = contract.fieldValues as Record<string, string>
      if (values[key])
        return `<span class="font-semibold">${values[key]}</span>`
      return `<span class="bg-amber-100 text-amber-700 rounded px-1 font-mono text-sm">${_match}</span>`
    }
  )

  return (
    <>
      <style>{`
        @media print {
          body > * { display: none !important; }
          #contract-print { display: block !important; position: fixed; top: 0; left: 0; width: 100%; }
        }
        #contract-print { display: none; }
      `}</style>

      <div className="flex flex-col gap-6 p-6 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Contrato</h1>
            <Badge variant={CONTRACT_STATUS_VARIANT[contract.status]}>
              {CONTRACT_STATUS_LABELS[contract.status]}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleLinkMutation.mutate()}
              disabled={toggleLinkMutation.isPending}
            >
              <LinkIcon className="size-4" />
              Link do cliente: {contract.clientLinkOpen ? 'Aberto' : 'Fechado'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => generateTokenMutation.mutate()}
              disabled={generateTokenMutation.isPending}
            >
              <ClipboardCopyIcon className="size-4" />
              Copiar link
            </Button>

            <Button variant="outline" size="sm" onClick={handlePrint}>
              <PrinterIcon className="size-4" />
              Gerar PDF
            </Button>
          </div>
        </div>

        <div className="w-full rounded-lg border p-6">
          <div
            className="max-w-none text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderedBody }}
          />
        </div>
      </div>

      <div id="contract-print" className="p-8">
        <div dangerouslySetInnerHTML={{ __html: renderedBody }} />
      </div>
    </>
  )
}
