'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ClipboardCopyIcon, PrinterIcon, LinkIcon, MessageCircleIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import type { Party, ContractStatus } from '@/types/parties'
import { buildDefaultValues, isDefaultVariable } from '@/lib/contract-defaults'
import { ContractPreview } from '@/components/ui/contract-preview'

const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  draft: 'Rascunho',
  pending: 'Pendente',
  in_review: 'Em revisão',
  signed: 'Assinado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
}

const CONTRACT_STATUS_VARIANT: Record<ContractStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'outline',
  pending: 'secondary',
  in_review: 'secondary',
  signed: 'default',
  completed: 'default',
  cancelled: 'destructive',
}

function VariablesEditor({
  contractId,
  variables,
  initialValues,
  onSaved,
}: {
  contractId: number
  variables: string[]
  initialValues: Record<string, string>
  onSaved: () => void
}) {
  const [values, setValues] = useState<Record<string, string>>(initialValues)

  const mutation = useMutation({
    mutationFn: (vals: Record<string, string>) =>
      fetch(`/api/admin/contracts/${contractId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fieldValues: vals }),
      }).then(r => r.json()),
    onSuccess: (result) => {
      if (result?.id) {
        toast.success('Variáveis salvas')
        onSaved()
      } else {
        toast.error(result?.error ?? 'Erro ao salvar variáveis')
      }
    },
    onError: () => toast.error('Erro ao salvar variáveis'),
  })

  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4">
      <h3 className="text-sm font-semibold">Variáveis do Contrato</h3>
      <p className="text-muted-foreground text-xs">
        Preencha agora ou deixe para o cliente preencher pelo link.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {variables.map(variable => (
          <div key={variable} className="flex flex-col gap-1.5">
            <Label className="font-mono text-xs">{`{{${variable}}}`}</Label>
            <Input
              value={values[variable] ?? ''}
              onChange={e => setValues(prev => ({ ...prev, [variable]: e.target.value }))}
              placeholder={`Valor para ${variable}...`}
            />
          </div>
        ))}
      </div>
      <Button
        type="button"
        className="w-fit"
        disabled={mutation.isPending}
        onClick={() => mutation.mutate(values)}
      >
        {mutation.isPending ? 'Salvando...' : 'Salvar variáveis'}
      </Button>
    </div>
  )
}

export function PartyContractTab({ partyId }: { partyId: string }) {
  const queryClient = useQueryClient()

  const { data: party, isLoading } = useQuery<Party>({
    queryKey: ['admin', 'parties', partyId],
    queryFn: () => fetch(`/api/admin/parties/${partyId}`).then(r => r.json()),
  })

  const contract = party?.contract

  const toggleLinkMutation = useMutation({
    mutationFn: () =>
      fetch(`/api/admin/contracts/${contract?.id}/toggle-link`, { method: 'POST' }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'parties', partyId] })
      toast.success(contract?.clientLinkOpen ? 'Link fechado' : 'Link aberto')
    },
    onError: () => toast.error('Erro ao alterar link'),
  })

  const generateTokenMutation = useMutation({
    mutationFn: () =>
      fetch(`/api/admin/contracts/${contract?.id}/generate-token`, { method: 'POST' }).then(r => r.json()),
    onSuccess: (result) => {
      const url = `${window.location.origin}/c/${result.clientToken}`
      navigator.clipboard.writeText(url)
      queryClient.invalidateQueries({ queryKey: ['admin', 'parties', partyId] })
      toast.success('Link copiado para a área de transferência!')
    },
    onError: () => toast.error('Erro ao gerar link'),
  })

  const sendWhatsAppMutation = useMutation({
    mutationFn: async () => {
      let token = contract?.clientToken
      if (!token) {
        const result = await fetch(`/api/admin/contracts/${contract?.id}/generate-token`, {
          method: 'POST',
        }).then(r => r.json())
        token = result.clientToken
      }
      await fetch(`/api/admin/contracts/${contract?.id}/mark-sent`, { method: 'POST' })
      return token as string
    },
    onSuccess: (token) => {
      const phoneDigits = party?.customer?.phone?.replace(/\D/g, '') ?? ''
      const url = `${window.location.origin}/c/${token}`
      const message = `Olá ${party?.customer?.name ?? ''}! Segue o link para revisar e assinar o contrato da sua festa no Divercity Park: ${url}`
      const waUrl = `https://api.whatsapp.com/send/?phone=55${phoneDigits}&text=${encodeURIComponent(message)}`
      window.open(waUrl, '_blank', 'noopener,noreferrer')
      queryClient.invalidateQueries({ queryKey: ['admin', 'parties', partyId] })
      toast.success('Link aberto no WhatsApp')
    },
    onError: () => toast.error('Erro ao preparar envio'),
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!contract) {
    return (
      <p className="text-muted-foreground text-sm">Nenhum contrato encontrado para esta festa.</p>
    )
  }

  const partyWithTemplate = party as Party & { contractTemplate?: { variables?: string[]; body?: string } }

  const allVars: string[] = (
    partyWithTemplate?.contractTemplate?.variables
    ?? Object.keys(contract.fieldValues as Record<string, string>)
  ).filter(v => !isDefaultVariable(v))

  const isLocked = contract.status === 'signed' || contract.status === 'completed' || contract.status === 'cancelled'
  const bodyToRender = isLocked ? contract.body : (partyWithTemplate?.contractTemplate?.body ?? contract.body)

  const defaultValues = buildDefaultValues(party as unknown as Parameters<typeof buildDefaultValues>[0])
  const userValues = contract.fieldValues as Record<string, string>
  const mergedValues = { ...defaultValues, ...userValues }

  const renderedBody = bodyToRender.replace(
    /\{\{(\w+)\}\}/g,
    (_match: string, key: string) => {
      if (mergedValues[key]) return mergedValues[key]
      if (isDefaultVariable(key)) return ''
      return `<span class="bg-amber-100 text-amber-700 rounded px-1 font-mono text-sm">${_match}</span>`
    }
  )

  return (
    <>
      <style>{`
        #contract-print { display: none; }
        @media print {
          body * { visibility: hidden; }
          #contract-print { display: block; visibility: visible; position: fixed; top: 0; left: 0; right: 0; padding: 2rem; background: white; }
          #contract-print * { visibility: visible; }
        }
      `}</style>

      <div className="flex flex-col gap-6 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant={CONTRACT_STATUS_VARIANT[contract.status]}>
              {CONTRACT_STATUS_LABELS[contract.status]}
            </Badge>
            {contract.sentAt && (
              <span className="text-muted-foreground text-xs">
                Enviado em {new Date(contract.sentAt).toLocaleString('pt-BR')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => sendWhatsAppMutation.mutate()}
              disabled={sendWhatsAppMutation.isPending || !party?.customer?.phone}
              title={!party?.customer?.phone ? 'Cliente sem telefone cadastrado' : undefined}
            >
              <MessageCircleIcon className="size-4" />
              Enviar via WhatsApp
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleLinkMutation.mutate()}
              disabled={toggleLinkMutation.isPending}
            >
              <LinkIcon className="size-4" />
              Link: {contract.clientLinkOpen ? 'Aberto' : 'Fechado'}
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

            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <PrinterIcon className="size-4" />
              Gerar PDF
            </Button>
          </div>
        </div>

        {allVars.length > 0 && (
          <VariablesEditor
            key={contract.id}
            contractId={contract.id}
            variables={allVars}
            initialValues={contract.fieldValues as Record<string, string>}
            onSaved={() => queryClient.invalidateQueries({ queryKey: ['admin', 'parties', partyId] })}
          />
        )}

        <div className="rounded-lg border p-6">
          <ContractPreview html={renderedBody} />
        </div>
      </div>

      <div id="contract-print" className="p-8">
        <ContractPreview html={renderedBody} />
      </div>
    </>
  )
}
