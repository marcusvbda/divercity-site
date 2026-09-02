import Link from 'next/link'
import { connection } from 'next/server'
import { ClockIcon, LogInIcon, LogOutIcon, ScanLineIcon, TicketIcon } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function startOfToday() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

async function getOverview() {
  await connection()
  const since = startOfToday()

  const [currentlyInPark, awaitingEntry, checkedInToday, checkedOutToday] = await Promise.all([
    prisma.ticketOrder.count({ where: { status: 'checked_in' } }),
    prisma.ticketOrder.count({ where: { status: 'paid' } }),
    prisma.ticketOrder.count({ where: { checkedInAt: { gte: since } } }),
    prisma.ticketOrder.count({ where: { checkedOutAt: { gte: since } } }),
  ])

  return { currentlyInPark, awaitingEntry, checkedInToday, checkedOutToday }
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: number
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-6">
        <div className="bg-muted flex size-11 shrink-0 items-center justify-center rounded-full">
          <Icon className="text-muted-foreground size-5" />
        </div>
        <div>
          <p className="text-2xl font-bold tabular-nums">{value}</p>
          <p className="text-muted-foreground text-sm">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default async function OperacaoOverviewPage() {
  const { currentlyInPark, awaitingEntry, checkedInToday, checkedOutToday } = await getOverview()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Visão geral</h1>
          <p className="text-muted-foreground text-sm">Resumo rápido da operação do parque hoje</p>
        </div>
        <Button size="lg" nativeButton={false} render={<Link href="/admin/operacao/validar" />}>
          <ScanLineIcon className="size-4" />
          Validar ticket
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={ClockIcon} label="No parque agora" value={currentlyInPark} />
        <StatCard icon={TicketIcon} label="Pagos aguardando entrada" value={awaitingEntry} />
        <StatCard icon={LogInIcon} label="Check-ins hoje" value={checkedInToday} />
        <StatCard icon={LogOutIcon} label="Check-outs hoje" value={checkedOutToday} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Como usar</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground flex flex-col gap-1.5 text-sm">
          <p>Use <strong>Validar ticket</strong> para ler o QR Code do cliente ou digitar o código curto da compra.</p>
          <p>Confira os dados e alertas exibidos antes de aprovar a entrada.</p>
          <p>O mesmo código é usado novamente na saída para registrar o check-out.</p>
        </CardContent>
      </Card>
    </div>
  )
}
