'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  ClipboardCopyIcon,
  PrinterIcon,
  LinkIcon,
  MessageCircleIcon,
} from 'lucide-react'
import { Button } from '@/components/admin/ui/button'
import { Badge } from '@/components/admin/ui/badge'
import { Input } from '@/components/admin/ui/input'
import { Label } from '@/components/admin/ui/label'
import { Textarea } from '@/components/admin/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/admin/ui/select'
import { Skeleton } from '@/components/admin/ui/skeleton'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/admin/ui/card'
import type {
  Party,
  Contract,
  ContractStatus,
  ContractPaymentStatus,
  ContractVariableType,
} from '@/types/parties'
import {
  buildContractValues,
  buildDefaultValues,
  getDefaultVariableLabel,
  isDefaultVariable,
  CONTRACT_PAYMENT_STATUS_LABELS,
} from '@/lib/contract-defaults'
import { extractBodyVariables, getVariableInputProps, renderContractBody } from '@/lib/contract-render'
import { ContractPreview } from '@/components/ui/contract-preview'

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

function handleGeneratePdf(contract: {
  id: number
  docusignEnvelopeId?: string | null
}) {
  if (contract.docusignEnvelopeId) {
    window.open(`/api/admin/contracts/${contract.id}/pdf`, '_blank')
  } else {
    window.print()
  }
}

function VariablesEditor({
  contractId,
  variables,
  types,
  labels,
  defaultValues,
  initialValues,
  onSaved,
}: {
  contractId: number
  variables: string[]
  types: Record<string, ContractVariableType>
  labels: Record<string, string>
  defaultValues: Record<string, string>
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
      }).then((r) => r.json()),
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
    <Card>
      <CardHeader>
        <CardTitle>Variáveis do Contrato</CardTitle>
        <CardDescription>
          Preencha agora ou deixe para o cliente preencher pelo link.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {variables.map((variable) => {
            const label = labels[variable] || getDefaultVariableLabel(variable)
            if (isDefaultVariable(variable)) {
              return (
                <div key={variable} className="flex flex-col gap-1.5">
                  <Label>{label}</Label>
                  <Input value={defaultValues[variable] ?? ''} disabled readOnly />
                  <p className="text-muted-foreground text-xs">
                    Editado em Dados / Valor e pagamento
                  </p>
                </div>
              )
            }
            return (
              <div key={variable} className="flex flex-col gap-1.5">
                <Label>{label}</Label>
                <Input
                  {...getVariableInputProps(values[variable] ?? '', types[variable])}
                  value={values[variable] ?? ''}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [variable]: e.target.value }))
                  }
                  placeholder={label}
                />
              </div>
            )
          })}
        </div>
        <Button
          type="button"
          className="w-fit"
          disabled={mutation.isPending}
          onClick={() =>
            mutation.mutate(
              Object.fromEntries(
                Object.entries(values).filter(([key]) => !isDefaultVariable(key))
              )
            )
          }
        >
          {mutation.isPending ? 'Salvando...' : 'Salvar variáveis'}
        </Button>
      </CardContent>
    </Card>
  )
}

function PaymentCard({
  contract,
  partyId,
  partyDate,
  locked,
}: {
  contract: Contract
  partyId: string
  partyDate: string
  locked: boolean
}) {
  const queryClient = useQueryClient()
  const hasStoredValue = contract.value != null && contract.value !== ''
  const [valueText, setValueText] = useState(
    hasStoredValue ? String(Number(contract.value)) : ''
  )
  const [valueEdited, setValueEdited] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<ContractPaymentStatus>(
    contract.paymentStatus
  )
  const [additionalInfo, setAdditionalInfo] = useState(contract.additionalInfo ?? '')
  const [errors, setErrors] = useState<{ value?: string; additionalInfo?: string }>({})

  const { data: quoteData, isError: quoteError } = useQuery<{ salonPrice: number }>({
    queryKey: ['party-budget-quote', 'salon_only', partyDate],
    queryFn: () =>
      fetch(
        `/api/party-budget/quote?date=${encodeURIComponent(partyDate)}&paymentOption=salon_only`
      ).then(async (r) => {
        if (!r.ok) throw new Error('quote_failed')
        return r.json()
      }),
    enabled: !hasStoredValue && !locked,
    retry: false,
  })
  const suggestedValue =
    typeof quoteData?.salonPrice === 'number' ? String(quoteData.salonPrice) : ''
  const valueInput = hasStoredValue || valueEdited ? valueText : suggestedValue

  const mutation = useMutation({
    mutationFn: (payload: {
      value: number | null
      paymentStatus: ContractPaymentStatus
      additionalInfo: string | null
    }) =>
      fetch(`/api/admin/contracts/${contract.id}/payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then(async (r) => ({ ok: r.ok, body: await r.json() })),
    onSuccess: ({ ok, body }) => {
      if (ok) {
        toast.success('Pagamento salvo')
        queryClient.invalidateQueries({ queryKey: ['admin', 'parties', partyId] })
        queryClient.invalidateQueries({ queryKey: ['admin', 'parties'] })
      } else {
        const apiError = body?.error
        toast.error(
          typeof apiError === 'string'
            ? apiError
            : (apiError?.fieldErrors?.additionalInfo?.[0] ??
                apiError?.fieldErrors?.value?.[0] ??
                'Erro ao salvar pagamento')
        )
      }
    },
    onError: () => toast.error('Erro ao salvar pagamento'),
  })

  function handleSave() {
    if (locked) {
      mutation.mutate({
        value: hasStoredValue ? Number(contract.value) : null,
        paymentStatus,
        additionalInfo: contract.additionalInfo ?? null,
      })
      return
    }

    const next: typeof errors = {}
    const numeric = valueInput.trim() === '' ? null : Number(valueInput)
    if (numeric !== null && (!Number.isFinite(numeric) || numeric < 0)) {
      next.value = 'Valor inválido'
    }
    if (paymentStatus === 'partial' && !additionalInfo.trim()) {
      next.additionalInfo = 'Descreva a negociação do pagamento parcial'
    }
    setErrors(next)
    if (Object.keys(next).length > 0) return

    mutation.mutate({
      value: numeric,
      paymentStatus,
      additionalInfo: additionalInfo.trim() || null,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Valor e pagamento</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="payment-value">Valor do contrato</Label>
            <div className="relative">
              <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm">
                R$
              </span>
              <Input
                id="payment-value"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                className="pl-9"
                value={valueInput}
                placeholder="0,00"
                disabled={locked}
                onChange={(e) => {
                  setValueText(e.target.value)
                  setValueEdited(true)
                }}
                aria-invalid={!!errors.value}
              />
            </div>
            {quoteError && !hasStoredValue && !valueEdited && !locked && (
              <p className="text-muted-foreground text-xs">
                Não foi possível obter o preço do salão; informe o valor.
              </p>
            )}
            {errors.value && <p className="text-destructive text-xs">{errors.value}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="payment-status">Status de pagamento</Label>
            <Select
              value={paymentStatus}
              onValueChange={(v) => v && setPaymentStatus(v as ContractPaymentStatus)}
            >
              <SelectTrigger id="payment-status" className="w-full">
                <SelectValue>{CONTRACT_PAYMENT_STATUS_LABELS[paymentStatus]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(CONTRACT_PAYMENT_STATUS_LABELS) as ContractPaymentStatus[]).map(
                  (s) => (
                    <SelectItem key={s} value={s}>
                      {CONTRACT_PAYMENT_STATUS_LABELS[s]}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="payment-info">
            Informações adicionais{paymentStatus === 'partial' && !locked ? ' *' : ''}
          </Label>
          <Textarea
            id="payment-info"
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            placeholder="Negociação, formas de pagamento, observações..."
            disabled={locked}
            aria-invalid={!!errors.additionalInfo}
          />
          {errors.additionalInfo && (
            <p className="text-destructive text-xs">{errors.additionalInfo}</p>
          )}
        </div>
        <Button
          type="button"
          className="w-fit"
          disabled={mutation.isPending}
          onClick={handleSave}
        >
          {mutation.isPending ? 'Salvando...' : 'Salvar pagamento'}
        </Button>
      </CardContent>
    </Card>
  )
}

export function PartyContractTab({ partyId }: { partyId: string }) {
  const queryClient = useQueryClient()

  const { data: party, isLoading } = useQuery<Party>({
    queryKey: ['admin', 'parties', partyId],
    queryFn: () => fetch(`/api/admin/parties/${partyId}`).then((r) => r.json()),
  })

  const contract = party?.contract

  const toggleLinkMutation = useMutation({
    mutationFn: () =>
      fetch(`/api/admin/contracts/${contract?.id}/toggle-link`, {
        method: 'POST',
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'parties', partyId] })
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
      queryClient.invalidateQueries({ queryKey: ['admin', 'parties', partyId] })
      toast.success('Link copiado para a área de transferência!')
    },
    onError: () => toast.error('Erro ao gerar link'),
  })

  const sendWhatsAppMutation = useMutation({
    mutationFn: async () => {
      let token = contract?.clientToken
      if (!token) {
        const result = await fetch(
          `/api/admin/contracts/${contract?.id}/generate-token`,
          {
            method: 'POST',
          }
        ).then((r) => r.json())
        token = result.clientToken
      }
      await fetch(`/api/admin/contracts/${contract?.id}/mark-sent`, {
        method: 'POST',
      })
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
      <p className="text-muted-foreground text-sm">
        Nenhum contrato encontrado para esta festa.
      </p>
    )
  }

  const partyWithTemplate = party as Party & {
    contractTemplate?: {
      variables?: string[]
      body?: string
      variableTypes?: Record<string, ContractVariableType>
      variableLabels?: Record<string, string>
    }
  }

  const isLocked =
    contract.status === 'signed' ||
    contract.status === 'completed' ||
    contract.status === 'cancelled'
  const bodyToRender = isLocked
    ? contract.body
    : (partyWithTemplate?.contractTemplate?.body ?? contract.body)

  const defaultValues = buildDefaultValues(
    party as unknown as Parameters<typeof buildDefaultValues>[0]
  )
  const userValues = contract.fieldValues as Record<string, string>
  const mergedValues = {
    ...defaultValues,
    ...buildContractValues(contract),
    ...userValues,
  }

  const allVars = extractBodyVariables(bodyToRender)

  const variableTypes = partyWithTemplate?.contractTemplate?.variableTypes ?? {}
  const renderedBody = renderContractBody(bodyToRender, mergedValues, variableTypes, {
    highlightMissing: true,
  })

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
              disabled={
                sendWhatsAppMutation.isPending || !party?.customer?.phone
              }
              title={
                !party?.customer?.phone
                  ? 'Cliente sem telefone cadastrado'
                  : undefined
              }
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

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleGeneratePdf(contract)}
            >
              <PrinterIcon className="size-4" />
              Gerar PDF
            </Button>
          </div>
        </div>

        <PaymentCard
          key={`${contract.id}-${contract.paymentStatus}-${contract.value}-${contract.additionalInfo}`}
          contract={contract}
          partyId={partyId}
          partyDate={party!.date}
          locked={isLocked}
        />

        {allVars.length > 0 && (
          <VariablesEditor
            key={contract.id}
            contractId={contract.id}
            variables={allVars}
            types={variableTypes}
            defaultValues={mergedValues}
            labels={partyWithTemplate?.contractTemplate?.variableLabels ?? {}}
            initialValues={contract.fieldValues as Record<string, string>}
            onSaved={() =>
              queryClient.invalidateQueries({
                queryKey: ['admin', 'parties', partyId],
              })
            }
          />
        )}

        <Card>
          <CardContent>
            <ContractPreview html={renderedBody} />
          </CardContent>
        </Card>
      </div>

      <div id="contract-print" className="p-8">
        <ContractPreview html={renderedBody} />
      </div>
    </>
  )
}
