'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, ScanLineIcon, SearchIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {
  TicketOrderStatus,
  TicketOrderSummary,
  TicketPassStatus,
  TicketSummary,
} from '@/types/tickets'
import { formatDuration, formatMinutes } from '../validar/[shortCode]/format'

type ApiResponse = {
  data: TicketOrderSummary[]
  pagination: {
    page: number
    perPage: number
    total: number
    totalPages: number
  }
}

const PAYMENT_LABEL: Record<TicketOrderStatus, string> = {
  pending_payment: 'Aguardando pagamento',
  paid: 'Pago',
  payment_failed: 'Pagamento falhou',
  cancelled: 'Cancelada',
}

const TICKET_STATUS_LABEL: Record<TicketPassStatus, string> = {
  not_used: 'Aguardando entrada',
  checked_in: 'Em uso no parque',
  checked_out: 'Finalizado',
}

const PAYMENT_OPTIONS = [
  { value: 'all', label: 'Todos os pagamentos' },
  ...Object.entries(PAYMENT_LABEL).map(([value, label]) => ({ value, label })),
]

const TICKET_STATUS_OPTIONS = [
  { value: 'all', label: 'Todos os status de ticket' },
  ...Object.entries(TICKET_STATUS_LABEL).map(([value, label]) => ({
    value,
    label,
  })),
]

const PER_PAGE = 15

function formatDateTime(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function PaymentBadge({ status }: { status: TicketOrderStatus }) {
  const label = PAYMENT_LABEL[status]
  if (status === 'paid') return <Badge variant="secondary">{label}</Badge>
  if (status === 'pending_payment')
    return <Badge variant="outline">{label}</Badge>
  return <Badge variant="destructive">{label}</Badge>
}

function TicketStatusBadge({ status }: { status: TicketPassStatus }) {
  const label = TICKET_STATUS_LABEL[status]
  if (status === 'checked_in') {
    return (
      <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
        {label}
      </Badge>
    )
  }
  if (status === 'checked_out') return <Badge variant="outline">{label}</Badge>
  return <Badge variant="secondary">{label}</Badge>
}

function TicketTime({ ticket }: { ticket: TicketSummary }) {
  const [now, setNow] = useState(() => Date.now())
  const running = ticket.status === 'checked_in'

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [running])

  if (!ticket.checkedInAt)
    return <span className="text-muted-foreground">—</span>

  const startMs = new Date(ticket.checkedInAt).getTime()
  const endMs = ticket.checkedOutAt
    ? new Date(ticket.checkedOutAt).getTime()
    : now
  const elapsed = Math.max(0, Math.floor((endMs - startMs) / 1000))
  const overtimeSeconds = Math.max(
    0,
    elapsed - ticket.contractedDurationMinutes * 60
  )
  const overtimeMinutes = ticket.checkedOutAt ? ticket.overtimeMinutes : null

  return (
    <div className="flex flex-col text-sm">
      <span
        className={`font-mono tabular-nums ${overtimeSeconds > 0 ? 'font-semibold text-red-600' : ''}`}
      >
        {formatDuration(elapsed)}
      </span>
      {ticket.checkedOutAt ? (
        <span className="text-muted-foreground text-xs">
          Saída {formatDateTime(ticket.checkedOutAt)}
        </span>
      ) : (
        ticket.plannedEndAt && (
          <span className="text-muted-foreground text-xs">
            Previsto {formatDateTime(ticket.plannedEndAt)}
          </span>
        )
      )}
      {overtimeMinutes != null && overtimeMinutes > 0 ? (
        <span className="text-xs font-semibold text-red-600">
          +{formatMinutes(overtimeMinutes)} excedente
        </span>
      ) : (
        !ticket.checkedOutAt &&
        overtimeSeconds > 0 && (
          <span className="text-xs font-semibold text-red-600">
            +{formatDuration(overtimeSeconds)} excedente
          </span>
        )
      )}
    </div>
  )
}

function TicketRow({ ticket }: { ticket: TicketSummary }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t px-4 py-3 first:border-t-0">
      <div className="flex min-w-40 flex-1 flex-col">
        <span className="font-medium">{ticket.holderName}</span>
        <span className="text-muted-foreground font-mono text-xs tracking-widest">
          {ticket.shortCode}
          {ticket.kind === 'group_companion' && ' · Acompanhante do grupo'}
        </span>
      </div>
      <TicketStatusBadge status={ticket.status} />
      <div className="min-w-32">
        <TicketTime ticket={ticket} />
      </div>
      <Button
        variant="outline"
        className="h-10"
        nativeButton={false}
        render={<Link href={`/admin/operacao/validar/${ticket.shortCode}`} />}
      >
        <ScanLineIcon className="size-4" />
        Validar
      </Button>
    </div>
  )
}

function OrderCard({ order }: { order: TicketOrderSummary }) {
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="flex flex-wrap items-center justify-between gap-2 border-b py-3">
        <div className="flex flex-col">
          <span className="font-mono font-semibold tracking-widest">
            {order.shortCode}
          </span>
          <span className="text-sm font-medium">{order.guardianName}</span>
          <span className="text-muted-foreground text-xs">
            {order.guardianPhone}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <PaymentBadge status={order.status} />
          <span className="text-muted-foreground text-xs">
            {order.ticketsCount}{' '}
            {order.ticketsCount === 1 ? 'ticket' : 'tickets'} ·{' '}
            {formatDateTime(order.createdAt)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {order.tickets.map((ticket) => (
          <TicketRow key={ticket.shortCode} ticket={ticket} />
        ))}
      </CardContent>
    </Card>
  )
}

export default function IngressosPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [payment, setPayment] = useState('all')
  const [ticketStatus, setTicketStatus] = useState('all')

  const { data, isLoading, isError, refetch } = useQuery<ApiResponse>({
    queryKey: ['operacao', 'ingressos', page, search, payment, ticketStatus],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        perPage: String(PER_PAGE),
      })
      if (search.trim()) params.set('search', search.trim())
      if (payment !== 'all') params.set('payment', payment)
      if (ticketStatus !== 'all') params.set('ticketStatus', ticketStatus)
      const res = await fetch(`/api/tickets/operate?${params.toString()}`)
      if (!res.ok) throw new Error('Erro ao carregar ingressos')
      return res.json()
    },
    placeholderData: (previous) => previous,
  })

  const orders = data?.data ?? []
  const pagination = data?.pagination
  const totalPages = pagination?.totalPages ?? 1

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold">Ingressos</h1>
        <p className="text-muted-foreground text-sm">
          Consulte compras por nome, telefone, e-mail, código da compra ou
          código do ticket — use quando o cliente não tiver o código nem o QR
          Code em mãos.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <div className="relative w-full sm:max-w-sm">
          <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar por nome, telefone, e-mail ou código..."
            className="h-10 pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>
        <Select
          value={payment}
          onValueChange={(v) => {
            setPayment(v ?? 'all')
            setPage(1)
          }}
        >
          <SelectTrigger className="h-10 w-full sm:w-56">
            <SelectValue>
              {PAYMENT_OPTIONS.find((o) => o.value === payment)?.label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={ticketStatus}
          onValueChange={(v) => {
            setTicketStatus(v ?? 'all')
            setPage(1)
          }}
        >
          <SelectTrigger className="h-10 w-full sm:w-64">
            <SelectValue>
              {
                TICKET_STATUS_OPTIONS.find((o) => o.value === ticketStatus)
                  ?.label
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {TICKET_STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <AlertTriangle className="text-destructive size-8" />
            <p className="text-sm">Não foi possível carregar os ingressos.</p>
            <Button variant="outline" onClick={() => refetch()}>
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      ) : orders.length === 0 ? (
        <p className="text-muted-foreground py-10 text-center text-sm">
          Nenhum item encontrado
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}

      {pagination && pagination.total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-muted-foreground text-sm">
            {pagination.total} {pagination.total === 1 ? 'compra' : 'compras'}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-10"
              onClick={() => setPage((p) => p - 1)}
              disabled={page <= 1}
            >
              Anterior
            </Button>
            <span className="text-sm">
              Página {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              className="h-10"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
