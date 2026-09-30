'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ScanLineIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AdminDataTable } from '@/components/ui/admin-data-table'
import { TicketQrPopover } from '@/components/operacao/TicketQrPopover'
import type { TicketOrderSummary, TicketOrderStatus } from '@/types/tickets'
import type { Column } from '@/components/ui/admin-data-table'
import { formatDuration } from '../validar/[shortCode]/format'

const STATUS_LABEL: Record<TicketOrderStatus, string> = {
  pending_payment: 'Aguardando pagamento',
  paid: 'Pago — aguardando entrada',
  payment_failed: 'Pagamento falhou',
  cancelled: 'Cancelada',
  checked_in: 'Em uso no parque',
  checked_out: 'Finalizada',
}

function currency(value: string) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDateTime(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function StatusBadge({ status }: { status: TicketOrderStatus }) {
  const label = STATUS_LABEL[status]
  if (status === 'checked_in') return <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">{label}</Badge>
  if (status === 'checked_out') return <Badge variant="outline">{label}</Badge>
  if (status === 'paid') return <Badge variant="secondary">{label}</Badge>
  return <Badge variant="destructive">{label}</Badge>
}

function ElapsedTime({ order }: { order: TicketOrderSummary }) {
  const [now, setNow] = useState(() => Date.now())
  const running = order.status === 'checked_in'

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [running])

  if (!order.checkedInAt) return <span>—</span>

  const startMs = new Date(order.checkedInAt).getTime()
  const endMs = order.checkedOutAt ? new Date(order.checkedOutAt).getTime() : now
  const elapsed = Math.max(0, Math.floor((endMs - startMs) / 1000))
  const contractedSeconds = (order.contractedDurationMinutes ?? 0) * 60
  const overtime = contractedSeconds > 0 ? Math.max(0, elapsed - contractedSeconds) : 0

  return (
    <div className={`flex flex-col font-mono tabular-nums ${overtime > 0 ? 'font-semibold text-red-600' : ''}`}>
      <span>{formatDuration(elapsed)}</span>
      {overtime > 0 && <span className="text-xs">+{formatDuration(overtime)} extra</span>}
    </div>
  )
}

const columns: Column<TicketOrderSummary>[] = [
  {
    key: 'shortCode',
    header: 'Código',
    render: (r) => <span className="font-mono font-semibold tracking-widest">{r.shortCode}</span>,
  },
  {
    key: 'guardianName',
    header: 'Responsável',
    sortable: true,
    render: (r) => (
      <div className="flex flex-col">
        <span className="font-medium">{r.guardianName}</span>
        <span className="text-muted-foreground text-xs">{r.guardianPhone}</span>
      </div>
    ),
  },
  { key: 'childrenCount', header: 'Crianças', render: (r) => r.childrenCount },
  { key: 'totalAmount', header: 'Valor', sortable: true, render: (r) => currency(r.totalAmount) },
  { key: 'status', header: 'Status', sortable: true, render: (r) => <StatusBadge status={r.status} /> },
  { key: 'checkedInAt', header: 'Entrada', render: (r) => formatDateTime(r.checkedInAt) },
  { key: 'elapsed', header: 'Tempo', render: (r) => <ElapsedTime order={r} /> },
  {
    key: 'checkedOutAt',
    header: 'Saída',
    render: (r) => {
      if (r.checkedOutAt) return formatDateTime(r.checkedOutAt)
      if (r.checkedInAt && r.contractedDurationMinutes != null) {
        const plannedEnd = new Date(new Date(r.checkedInAt).getTime() + r.contractedDurationMinutes * 60000)
        return <span className="text-muted-foreground" title="Saída prevista">{formatDateTime(plannedEnd.toISOString())}</span>
      }
      return '—'
    },
  },
  { key: 'createdAt', header: 'Comprado em', sortable: true, render: (r) => formatDateTime(r.createdAt) },
]

export default function IngressosPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Ingressos</h1>
        <p className="text-muted-foreground text-sm">
          Consulte compras por nome, telefone, e-mail ou código — use quando o cliente não tiver o
          código curto nem o QR Code em mãos.
        </p>
      </div>

      <AdminDataTable<TicketOrderSummary>
        queryKey={['operacao', 'ingressos']}
        endpoint="/api/tickets/operate"
        columns={columns}
        onRowClick={(order) => router.push(`/admin/operacao/validar/${order.shortCode}`)}
        filters={[
          { key: 'search', placeholder: 'Buscar por nome, telefone, e-mail ou código...', type: 'search' },
          {
            key: 'status',
            type: 'select',
            placeholder: 'Todos os status',
            options: [
              { value: '', label: 'Todos os status' },
              ...Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label })),
            ],
          },
        ]}
        actions={(order) => (
          <div className="flex items-center gap-1">
            {order.status === 'paid' || order.status === 'checked_in' ? (
              <TicketQrPopover shortCode={order.shortCode} />
            ) : (
              <span className="size-8" aria-hidden />
            )}
            <Button
              variant="ghost"
              size="icon"
              title="Validar"
              nativeButton={false}
              render={<Link href={`/admin/operacao/validar/${order.shortCode}`} />}
            >
              <ScanLineIcon className="size-4" />
            </Button>
          </div>
        )}
      />
    </div>
  )
}
