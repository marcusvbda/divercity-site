'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PlusIcon, ListIcon, CalendarIcon } from 'lucide-react'
import { Button } from '@/components/admin/ui/button'
import { Badge } from '@/components/admin/ui/badge'
import { DataTable } from '@/components/admin/data-table'
import { Skeleton } from '@/components/admin/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/admin/ui/tabs'
import { EventCalendar } from '@/components/admin/calendar/event-calendar'
import type { CalendarEvent, CalendarEventColor } from '@/components/admin/calendar/calendar-types'
import type { Party, PartyStatus, ContractStatus, ContractPaymentStatus } from '@/types/parties'
import { CONTRACT_PAYMENT_STATUS_LABELS } from '@/lib/contract-defaults'
import type { Column } from '@/components/admin/data-table'

const STATUS_LABELS: Record<PartyStatus, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
}

const STATUS_VARIANT: Record<PartyStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'outline',
  confirmed: 'default',
  cancelled: 'destructive',
}

const EVENT_COLOR: Record<PartyStatus, CalendarEventColor> = {
  pending: 'family',
  confirmed: 'holiday',
  cancelled: 'etc',
}

const DEFAULT_DURATION_MS = 4 * 60 * 60 * 1000

function toCalendarEvent(party: Party): CalendarEvent {
  const start = new Date(party.date)
  const end = party.dateEnd ? new Date(party.dateEnd) : new Date(start.getTime() + DEFAULT_DURATION_MS)

  return {
    id: String(party.id),
    title: party.customer?.name ?? 'Festa',
    start,
    end,
    color: EVENT_COLOR[party.status],
    strikethrough: party.status === 'cancelled',
  }
}

const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  draft: 'Rascunho',
  pending: 'Aguardando cliente',
  in_review: 'Assinando…',
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

const PAYMENT_STATUS_VARIANT: Record<ContractPaymentStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  unpaid: 'outline',
  partial: 'secondary',
  paid: 'default',
}

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

const columns: Column<Party>[] = [
  {
    key: 'date',
    header: 'Data',
    sortable: true,
    render: r => (
      <>
        {new Date(r.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
        <span className="text-muted-foreground ml-1 text-xs">
          {new Date(r.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </>
    ),
  },
  { key: 'customer', header: 'Cliente', render: r => <span className="font-medium">{r.customer?.name}</span> },
  { key: 'template', header: 'Template', render: r => <span className="text-muted-foreground text-sm">{r.contractTemplate?.name}</span> },
  {
    key: 'contract',
    header: 'Contrato',
    render: r => r.contract ? (
      <Badge variant={CONTRACT_STATUS_VARIANT[r.contract.status]}>
        {CONTRACT_STATUS_LABELS[r.contract.status]}
      </Badge>
    ) : (
      <span className="text-muted-foreground text-xs">Sem contrato</span>
    ),
  },
  {
    key: 'value',
    header: 'Valor',
    render: r =>
      r.contract?.value != null ? (
        <span className="whitespace-nowrap">{BRL.format(Number(r.contract.value))}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    key: 'payment',
    header: 'Pagamento',
    render: r =>
      r.contract ? (
        <Badge variant={PAYMENT_STATUS_VARIANT[r.contract.paymentStatus]}>
          {CONTRACT_PAYMENT_STATUS_LABELS[r.contract.paymentStatus]}
        </Badge>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    key: 'status',
    header: 'Festa',
    sortable: true,
    render: r => (
      <Badge variant={STATUS_VARIANT[r.status]}>
        {STATUS_LABELS[r.status]}
      </Badge>
    ),
  },
]

export default function PartiesPage() {
  const [view, setView] = useState<'list' | 'calendar'>('list')

  const { data, isLoading, isError } = useQuery<{ data: Party[] }>({
    queryKey: ['admin', 'parties', 'calendar'],
    queryFn: () => fetch('/api/admin/parties?perPage=100').then(r => r.json()),
    enabled: view === 'calendar',
  })

  const calendarEvents = (data?.data ?? []).map(toCalendarEvent)

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Agenda</h1>
          <p className="text-muted-foreground text-sm">Festas cadastradas no Divercity Park</p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={value => setView(value as 'list' | 'calendar')}>
            <TabsList>
              <TabsTrigger value="list">
                <ListIcon className="size-4" />
                Lista
              </TabsTrigger>
              <TabsTrigger value="calendar">
                <CalendarIcon className="size-4" />
                Calendário
              </TabsTrigger>
            </TabsList>
          </Tabs>
          {view === 'list' && (
            <Button nativeButton={false} render={<Link href="/admin/parties/new" />}>
              <PlusIcon className="size-4" />
              Nova festa
            </Button>
          )}
        </div>
      </div>

      {view === 'calendar' ? (
        isLoading ? (
          <Skeleton className="h-150 w-full rounded-lg" />
        ) : isError ? (
          <p className="text-destructive text-sm">Não foi possível carregar a agenda.</p>
        ) : (
          <EventCalendar
            events={calendarEvents}
            newEventHref="/admin/parties/new"
            newEventLabel="Nova festa"
            getEventHref={event => `/admin/parties/${event.id}`}
          />
        )
      ) : (
        <DataTable<Party>
          queryKey={['admin', 'parties']}
          endpoint="/api/admin/parties"
          columns={columns}
          filters={[
            { key: 'customerName', placeholder: 'Buscar por cliente...', type: 'search' },
            {
              key: 'status',
              type: 'select',
              placeholder: 'Status da festa',
              options: [
                { label: 'Todos os status', value: '' },
                { label: 'Pendente', value: 'pending' },
                { label: 'Confirmada', value: 'confirmed' },
                { label: 'Cancelada', value: 'cancelled' },
              ],
            },
            { key: 'date', type: 'date' },
          ]}
          actions={party => (
            <Button variant="ghost" size="sm" nativeButton={false} render={<Link href={`/admin/parties/${party.id}`} />}>
              Ver
            </Button>
          )}
        />
      )}
    </div>
  )
}
