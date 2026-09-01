'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { SearchIcon, PlusIcon } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Customer, ContractTemplate, Party } from '@/types/parties'

export type PartyFormData = {
  customerId: number
  contractTemplateId: number
  date: string
  dateEnd: string
}

type Props = {
  defaultValues?: Partial<Party>
  onSubmit: (data: PartyFormData) => void
  isLoading?: boolean
}

export function PartyForm({ defaultValues, onSubmit, isLoading }: Props) {
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
        const isBlocking = p.status === 'confirmed' || (p.status === 'pending' && p.paymentStatus === 'paid')
        if (!isBlocking) return false
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

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit({
      customerId: foundCustomer!.id,
      contractTemplateId: Number(templateId),
      date: `${date}T${startTime}:00.000Z`,
      dateEnd: `${date}T${endTime}:00.000Z`,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6">
      {/* Step 1: Cliente */}
      <div className="flex flex-col gap-3 rounded-lg border p-4">
        <h3 className="text-sm font-semibold">1. Cliente</h3>

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
          <div className="relative">
            <div className="relative">
              <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                value={customerSearch}
                onChange={e => { setCustomerSearch(e.target.value); setDropdownOpen(true) }}
                onFocus={() => customerSearch.trim().length >= 2 && setDropdownOpen(true)}
                onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
                placeholder="Buscar cliente por nome ou CPF..."
                className="pl-9"
                autoComplete="off"
              />
            </div>

            {dropdownOpen && customerSearch.trim().length >= 2 && (
              <div
                className="bg-popover absolute top-full left-0 right-0 z-50 mt-1 overflow-hidden rounded-md border shadow-md"
                onMouseDown={e => e.preventDefault()}
              >
                {isSearching ? (
                  <p className="text-muted-foreground px-3 py-2 text-sm">Buscando...</p>
                ) : searchResults.length > 0 ? (
                  <ul>
                    {searchResults.map(c => (
                      <li key={c.id}>
                        <button
                          type="button"
                          className="hover:bg-muted w-full px-3 py-2 text-left text-sm"
                          onClick={() => {
                            setFoundCustomer(c)
                            setDropdownOpen(false)
                            setCustomerSearch('')
                            setErrors(prev => { const { customer: _, ...rest } = prev; return rest })
                          }}
                        >
                          <span className="font-medium">{c.name}</span>
                          <span className="text-muted-foreground ml-2 font-mono text-xs">
                            {c.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-3">
                    <p className="text-muted-foreground mb-2 text-sm">Nenhum cliente encontrado</p>
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
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {errors.customer && (
          <p className="text-destructive text-xs">{errors.customer}</p>
        )}
      </div>

      {/* Step 2: Template */}
      <div className="flex flex-col gap-3 rounded-lg border p-4">
        <h3 className="text-sm font-semibold">2. Modelo de Contrato</h3>

        {selectedTemplate ? (
          <div className="bg-muted rounded-md p-3">
            <p className="font-medium">{selectedTemplate.name}</p>
            {selectedTemplate.variables.length > 0 ? (
              <div className="mt-1 flex flex-wrap gap-1">
                {selectedTemplate.variables.map(v => (
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
            <SelectTrigger>
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
      </div>

      {/* Step 3: Data e Horário */}
      <div className="flex flex-col gap-3 rounded-lg border p-4">
        <h3 className="text-sm font-semibold">3. Data e Horário</h3>
        <div className="flex gap-3">
          <div className="flex flex-1 flex-col gap-1.5">
            <Label>Data</Label>
            <Input
              type="date"
              value={date}
              onChange={e => { setDate(e.target.value); setDateConflict(false) }}
              onBlur={e => checkDateConflict(e.target.value, startTime, endTime)}
            />
          </div>
          <div className="flex w-28 flex-col gap-1.5">
            <Label>Início</Label>
            <Input
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              onBlur={() => checkDateConflict(date, startTime, endTime)}
            />
          </div>
          <div className="flex w-28 flex-col gap-1.5">
            <Label>Fim</Label>
            <Input
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
      </div>

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
