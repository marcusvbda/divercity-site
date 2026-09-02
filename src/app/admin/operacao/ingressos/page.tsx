'use client'

import Link from 'next/link'
import { ScanLineIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AdminDataTable } from '@/components/ui/admin-data-table'
import { TicketQrPopover } from '@/components/operacao/TicketQrPopover'
import type { TicketOrderSummary, TicketOrderStatus } from '@/types/tickets'
import type { Column } from '@/components/ui/admin-data-table'

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
  { key: 'checkedOutAt', header: 'Saída', render: (r) => formatDateTime(r.checkedOutAt) },
  { key: 'createdAt', header: 'Comprado em', sortable: true, render: (r) => formatDateTime(r.createdAt) },
]

export default function IngressosPage() {
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
            <TicketQrPopover shortCode={order.shortCode} />
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
