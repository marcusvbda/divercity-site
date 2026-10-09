'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PlusIcon } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/admin/ui/button'
import { Input } from '@/components/admin/ui/input'
import { Label } from '@/components/admin/ui/label'
import { Textarea } from '@/components/admin/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin/ui/card'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/admin/ui/combobox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/admin/ui/select'
import { CONTRACT_PAYMENT_STATUS_LABELS } from '@/lib/contract-defaults'
import { extractBodyVariables } from '@/lib/contract-render'
import type { Customer, ContractTemplate, ContractPaymentStatus, Party } from '@/types/parties'

export type PartyFormData = {
  customerId: number
  contractTemplateId: number
  date: string
  dateEnd: string
  contract?: {
    value: number
    paymentStatus: ContractPaymentStatus
    additionalInfo: string | null
  }
}

type Props = {
  mode: 'create' | 'edit'
  defaultValues?: Partial<Party>
  onSubmit: (data: PartyFormData) => void
  isLoading?: boolean
}

export function PartyForm({ mode, defaultValues, onSubmit, isLoading }: Props) {
  const [foundCustomer, setFoundCustomer] = useState<Customer | null>(
    defaultValues?.customer ?? null
  )
  const [customerSearch, setCustomerSearch] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const [templateId, setTemplateId] = useState<string>(
    defaultValues?.contractTemplateId?.toString() ?? ''
  )
  const [date, setDate] = useState(
    defaultValues?.date
      ? new Date(defaultValues.date).toISOString().split('T')[0]
      : ''
  )
  const [startTime, setStartTime] = useState(
    defaultValues?.date
      ? new Date(defaultValues.date).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      : '10:00'
  )
  const [endTime, setEndTime] = useState(
    defaultValues?.dateEnd
      ? new Date(defaultValues.dateEnd).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      : '14:00'
  )
  const [dateConflict, setDateConflict] = useState(false)
  const [checkingConflict, setCheckingConflict] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [contractValue, setContractValue] = useState('')
  const [valueEdited, setValueEdited] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<ContractPaymentStatus>('unpaid')
  const [additionalInfo, setAdditionalInfo] = useState('')

  const { data: searchData, isFetching: isSearching } = useQuery<{ data: Customer[] }>({
    queryKey: ['customer-search', customerSearch],
    queryFn: () =>
      fetch(`/api/admin/customers?search=${encodeURIComponent(customerSearch)}`).then(r => r.json()),
    enabled: customerSearch.trim().length >= 2,
  })
  const searchResults = searchData?.data ?? []

  const { data: templatesData } = useQuery<{ data: ContractTemplate[] }>({
    queryKey: ['admin', 'contract-templates'],
    queryFn: () => fetch('/api/admin/contract-templates').then(r => r.json()),
  })
  const templates = templatesData?.data ?? []
  const selectedTemplate = templates.find(t => t.id.toString() === templateId)
  const templateVariables = selectedTemplate ? extractBodyVariables(selectedTemplate.body) : []

  const quoteEnabled = mode === 'create' && !!date && !!startTime
  const {
    data: quoteData,
    isError: quoteError,
    isFetching: quoteFetching,
  } = useQuery<{ salonPrice: number }>({
    queryKey: ['party-budget-quote', 'salon_only', date, startTime],
    queryFn: () =>
      fetch(
        `/api/party-budget/quote?date=${encodeURIComponent(`${date}T${startTime}:00.000Z`)}&paymentOption=salon_only`
      ).then(async r => {
        if (!r.ok) throw new Error('quote_failed')
        return r.json()
      }),
    enabled: quoteEnabled,
    retry: false,
  })
  const suggestedValue =
    typeof quoteData?.salonPrice === 'number' ? String(quoteData.salonPrice) : ''
  const valueInput = valueEdited ? contractValue : suggestedValue

  function handleTemplateChange(value: string | null) {
    if (!value) return
    setTemplateId(value)
  }

  async function checkDateConflict(dateStr: string, start: string, end: string) {
    if (!dateStr || !start || !end) return
    setCheckingConflict(true)
    try {
      const res = await fetch('/api/admin/parties')
      const json = await res.json()
      const parties: Party[] = json.data ?? []
      const newStart = new Date(`${dateStr}T${start}:00.000Z`)
      const newEnd = new Date(`${dateStr}T${end}:00.000Z`)
      const conflict = parties.some(p => {
        if (p.status === 'cancelled') return false
        if (defaultValues?.id && p.id === defaultValues.id) return false
        const pStart = new Date(p.date)
        const pEnd = p.dateEnd ? new Date(p.dateEnd) : new Date(pStart.getTime() + 4 * 60 * 60 * 1000)
        return newStart < pEnd && newEnd > pStart
      })
      setDateConflict(conflict)
    } finally {
      setCheckingConflict(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!foundCustomer) newErrors.customer = 'Selecione um cliente'
    if (!templateId) newErrors.template = 'Selecione um template'
    if (!date) newErrors.date = 'Data é obrigatória'
    if (endTime <= startTime) newErrors.date = 'Horário de fim deve ser após o início'
    if (dateConflict) newErrors.date = 'Conflito com festa já confirmada neste horário'

    const numericValue = valueInput.trim() === '' ? NaN : Number(valueInput)
    if (mode === 'create') {
      if (!Number.isFinite(numericValue) || numericValue < 0) {
        newErrors.value = 'Informe um valor válido'
      }
      if (paymentStatus === 'partial' && !additionalInfo.trim()) {
        newErrors.additionalInfo = 'Descreva a negociação do pagamento parcial'
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit({
      customerId: foundCustomer!.id,
      contractTemplateId: Number(templateId),
      date: `${date}T${startTime}:00.000Z`,
      dateEnd: `${date}T${endTime}:00.000Z`,
      ...(mode === 'create' && {
        contract: {
          value: numericValue,
          paymentStatus,
          additionalInfo: additionalInfo.trim() || null,
        },
      }),
    })
  }

  const searchEnabled = customerSearch.trim().length >= 2

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>1. Cliente</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {foundCustomer ? (
            <div className="bg-muted rounded-md p-3">
              <p className="font-medium">{foundCustomer.name}</p>
              {foundCustomer.email && (
                <p className="text-muted-foreground text-sm">{foundCustomer.email}</p>
              )}
              {foundCustomer.phone && (
                <p className="text-muted-foreground text-sm">{foundCustomer.phone}</p>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-1 h-6 text-xs"
                onClick={() => setFoundCustomer(null)}
              >
                Alterar
              </Button>
            </div>
          ) : (
            <Combobox<Customer>
              items={searchResults}
              filter={null}
              value={null}
              inputValue={customerSearch}
              onInputValueChange={setCustomerSearch}
              open={dropdownOpen && searchEnabled}
              onOpenChange={setDropdownOpen}
              itemToStringLabel={c => c.name}
              itemToStringValue={c => String(c.id)}
              onValueChange={c => {
                if (!c) return
                setFoundCustomer(c)
                setDropdownOpen(false)
                setCustomerSearch('')
                setErrors(prev => { const { customer: _, ...rest } = prev; return rest })
              }}
            >
              <ComboboxInput
                placeholder="Buscar cliente por nome ou CPF..."
                showTrigger={false}
                autoComplete="off"
              />
              <ComboboxContent>
                <ComboboxEmpty className="flex-col gap-2 px-3">
                  {isSearching ? (
                    <span>Buscando...</span>
                  ) : (
                    <>
                      <span>Nenhum cliente encontrado</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        nativeButton={false}
                        render={<Link href="/admin/customers/new" target="_blank" />}
                      >
                        <PlusIcon className="size-4" />
                        Cadastrar cliente
                      </Button>
                    </>
                  )}
                </ComboboxEmpty>
                <ComboboxList>
                  {(c: Customer) => (
                    <ComboboxItem key={c.id} value={c}>
                      <span className="font-medium">{c.name}</span>
                      <span className="text-muted-foreground font-mono text-xs">
                        {c.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                      </span>
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          )}

          {errors.customer && (
            <p className="text-destructive text-xs">{errors.customer}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Modelo de Contrato</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {selectedTemplate ? (
            <div className="bg-muted rounded-md p-3">
              <p className="font-medium">{selectedTemplate.name}</p>
              {templateVariables.length > 0 ? (
                <div className="mt-1 flex flex-wrap gap-1">
                  {templateVariables.map(v => (
                    <span key={v} className="bg-background text-muted-foreground rounded border px-1.5 py-0.5 font-mono text-xs">
                      {`{{${v}}}`}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground mt-0.5 text-xs">Sem variáveis</p>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-1 h-6 text-xs"
                onClick={() => setTemplateId('')}
              >
                Alterar
              </Button>
            </div>
          ) : (
            <Select value={templateId} onValueChange={handleTemplateChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um modelo..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map(t => (
                  <SelectItem key={t.id} value={t.id.toString()}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {errors.template && (
            <p className="text-destructive text-xs">{errors.template}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Data e Horário</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-3">
            <div className="flex min-w-40 flex-1 flex-col gap-1.5">
              <Label htmlFor="party-date">Data</Label>
              <Input
                id="party-date"
                type="date"
                value={date}
                onChange={e => { setDate(e.target.value); setDateConflict(false) }}
                onBlur={e => checkDateConflict(e.target.value, startTime, endTime)}
              />
            </div>
            <div className="flex w-28 flex-col gap-1.5">
              <Label htmlFor="party-start">Início</Label>
              <Input
                id="party-start"
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                onBlur={() => checkDateConflict(date, startTime, endTime)}
              />
            </div>
            <div className="flex w-28 flex-col gap-1.5">
              <Label htmlFor="party-end">Fim</Label>
              <Input
                id="party-end"
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                onBlur={() => checkDateConflict(date, startTime, endTime)}
              />
            </div>
          </div>
          {dateConflict && (
            <p className="text-destructive text-xs">
              Conflito com festa já confirmada neste horário. Escolha outro horário.
            </p>
          )}
          {errors.date && !dateConflict && (
            <p className="text-destructive text-xs">{errors.date}</p>
          )}
        </CardContent>
      </Card>

      {mode === 'create' && (
        <Card>
          <CardHeader>
            <CardTitle>4. Valor e pagamento</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-3">
              <div className="flex min-w-40 flex-1 flex-col gap-1.5">
                <Label htmlFor="contract-value">Valor do contrato *</Label>
                <div className="relative">
                  <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm">
                    R$
                  </span>
                  <Input
                    id="contract-value"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.01"
                    className="pl-9"
                    value={valueInput}
                    placeholder={quoteFetching ? 'Calculando...' : '0,00'}
                    onChange={e => {
                      setContractValue(e.target.value)
                      setValueEdited(true)
                    }}
                    aria-invalid={!!errors.value}
                  />
                </div>
                {quoteError && !valueEdited && (
                  <p className="text-muted-foreground text-xs">
                    Não foi possível obter o preço do salão; informe o valor.
                  </p>
                )}
                {errors.value && <p className="text-destructive text-xs">{errors.value}</p>}
              </div>
              <div className="flex min-w-40 flex-1 flex-col gap-1.5">
                <Label htmlFor="contract-payment-status">Status de pagamento</Label>
                <Select
                  value={paymentStatus}
                  onValueChange={v => v && setPaymentStatus(v as ContractPaymentStatus)}
                >
                  <SelectTrigger id="contract-payment-status" className="w-full">
                    <SelectValue>{CONTRACT_PAYMENT_STATUS_LABELS[paymentStatus]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(CONTRACT_PAYMENT_STATUS_LABELS) as ContractPaymentStatus[]).map(s => (
                      <SelectItem key={s} value={s}>
                        {CONTRACT_PAYMENT_STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contract-additional-info">
                Informações adicionais{paymentStatus === 'partial' ? ' *' : ''}
              </Label>
              <Textarea
                id="contract-additional-info"
                value={additionalInfo}
                onChange={e => setAdditionalInfo(e.target.value)}
                placeholder="Negociação, formas de pagamento, observações..."
                aria-invalid={!!errors.additionalInfo}
              />
              {errors.additionalInfo && (
                <p className="text-destructive text-xs">{errors.additionalInfo}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        type="submit"
        disabled={isLoading || dateConflict || checkingConflict}
        className="w-fit"
      >
        {isLoading ? 'Salvando...' : 'Salvar festa'}
      </Button>
    </form>
  )
}
