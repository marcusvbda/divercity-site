'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  AlertTriangle,
  ChevronLeftIcon,
  ChevronRightIcon,
  ScanLineIcon,
  SearchIcon,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/admin/ui/alert'
import { Badge } from '@/components/admin/ui/badge'
import { Button } from '@/components/admin/ui/button'
import { Card, CardContent, CardHeader } from '@/components/admin/ui/card'
import { Label } from '@/components/admin/ui/label'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/admin/ui/input-group'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from '@/components/admin/ui/pagination'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/admin/ui/select'
import { Skeleton } from '@/components/admin/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/admin/ui/table'
import { cn } from '@/lib/utils'
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
  if (status === 'checked_in') return <Badge>{label}</Badge>
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
        className={cn(
          'font-mono tabular-nums',
          overtimeSeconds > 0 && 'text-destructive font-semibold'
        )}
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
        <span className="text-destructive text-xs font-semibold">
          +{formatMinutes(overtimeMinutes)} excedente
        </span>
      ) : (
        !ticket.checkedOutAt &&
        overtimeSeconds > 0 && (
          <span className="text-destructive text-xs font-semibold">
            +{formatDuration(overtimeSeconds)} excedente
          </span>
        )
      )}
    </div>
  )
}

function TicketRow({ ticket }: { ticket: TicketSummary }) {
  return (
    <TableRow>
      <TableCell className="h-14 pl-4">
        <div className="flex min-w-40 flex-col">
          <span className="font-medium">{ticket.holderName}</span>
          <span className="text-muted-foreground font-mono text-xs tracking-widest">
            {ticket.shortCode}
            {ticket.kind === 'group_companion' && ' · Acompanhante do grupo'}
          </span>
        </div>
      </TableCell>
      <TableCell className="h-14">
        <TicketStatusBadge status={ticket.status} />
      </TableCell>
      <TableCell className="h-14">
        <TicketTime ticket={ticket} />
      </TableCell>
      <TableCell className="h-14 pr-4 text-right">
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href={`/admin/operacao/validar/${ticket.shortCode}`} />}
        >
          <ScanLineIcon className="size-4" />
          Validar
        </Button>
      </TableCell>
    </TableRow>
  )
}

function OrderCard({ order }: { order: TicketOrderSummary }) {
  return (
    <Card className="gap-0 py-0 shadow-none">
      <CardHeader className="flex flex-wrap items-center justify-between gap-2 border-b py-4">
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-muted-foreground pl-4">
                Ticket
              </TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Tempo</TableHead>
              <TableHead className="w-24 px-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.tickets.map((ticket) => (
              <TicketRow key={ticket.shortCode} ticket={ticket} />
            ))}
          </TableBody>
        </Table>
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
        <h1 className="text-2xl font-semibold">Ingressos</h1>
        <p className="text-muted-foreground text-sm">
          Consulte compras por nome, telefone, e-mail, código da compra ou
          código do ticket — use quando o cliente não tiver o código nem o QR
          Code em mãos.
        </p>
      </div>

      <Card className="py-0 shadow-none">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="w-full sm:max-w-sm">
            <Label htmlFor="filter-search" className="sr-only">
              Buscar por nome, telefone, e-mail ou código...
            </Label>
            <InputGroup>
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupInput
                id="filter-search"
                type="text"
                placeholder="Buscar por nome, telefone, e-mail ou código..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
              />
            </InputGroup>
          </div>
          <Select
            items={PAYMENT_OPTIONS}
            value={payment}
            onValueChange={(v) => {
              setPayment(v ?? 'all')
              setPage(1)
            }}
          >
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {PAYMENT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select
            items={TICKET_STATUS_OPTIONS}
            value={ticketStatus}
            onValueChange={(v) => {
              setTicketStatus(v ?? 'all')
              setPage(1)
            }}
          >
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {TICKET_STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : isError ? (
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-destructive">
              Não foi possível carregar os ingressos.
            </span>
            <Button variant="outline" onClick={() => refetch()}>
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
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
        <div className="flex items-center justify-between gap-3 max-sm:flex-col">
          <p className="text-muted-foreground text-sm" aria-live="polite">
            {pagination.total} {pagination.total === 1 ? 'compra' : 'compras'}
          </p>
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="ghost"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page <= 1}
                >
                  <ChevronLeftIcon aria-hidden="true" />
                  Anterior
                </Button>
              </PaginationItem>
              <PaginationItem>
                <span className="px-2 text-sm">
                  Página {page} de {totalPages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <Button
                  variant="ghost"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages}
                >
                  Próxima
                  <ChevronRightIcon aria-hidden="true" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
