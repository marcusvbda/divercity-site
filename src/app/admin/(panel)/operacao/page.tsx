import Link from 'next/link'
import { connection } from 'next/server'
import {
  ClockIcon,
  LogInIcon,
  LogOutIcon,
  ScanLineIcon,
  TicketIcon,
} from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/admin/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/admin/ui/card'

function startOfToday() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

async function getOverview() {
  await connection()
  const since = startOfToday()

  const [currentlyInPark, awaitingEntry, checkedInToday, checkedOutToday] =
    await Promise.all([
      prisma.ticketPass.count({ where: { status: 'checked_in' } }),
      prisma.ticketPass.count({
        where: { status: 'not_used', order: { status: 'paid' } },
      }),
      prisma.ticketPass.count({ where: { checkedInAt: { gte: since } } }),
      prisma.ticketPass.count({ where: { checkedOutAt: { gte: since } } }),
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
      <CardHeader className="flex items-center gap-2">
        <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-sm">
          <Icon className="size-4" />
        </div>
        <span className="text-2xl tabular-nums">{value}</span>
      </CardHeader>
      <CardContent>
        <span className="text-base font-semibold">{label}</span>
      </CardContent>
    </Card>
  )
}

export default async function OperacaoOverviewPage() {
  const { currentlyInPark, awaitingEntry, checkedInToday, checkedOutToday } =
    await getOverview()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Visão geral</h1>
          <p className="text-muted-foreground text-sm">
            Resumo rápido da operação do parque hoje
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/admin/operacao/validar" />}
        >
          <ScanLineIcon className="size-4" />
          Validar ticket
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={ClockIcon}
          label="No parque agora"
          value={currentlyInPark}
        />
        <StatCard
          icon={TicketIcon}
          label="Aguardando entrada"
          value={awaitingEntry}
        />
        <StatCard
          icon={LogInIcon}
          label="Check-ins hoje"
          value={checkedInToday}
        />
        <StatCard
          icon={LogOutIcon}
          label="Check-outs hoje"
          value={checkedOutToday}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Como usar</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground flex flex-col gap-1.5 text-sm">
          <p>
            Use <strong>Validar ticket</strong> para ler o QR Code do cliente ou
            digitar o código do ticket.
          </p>
          <p>Confira os dados e alertas exibidos antes de aprovar a entrada.</p>
          <p>
            O mesmo código do ticket é usado novamente na saída para registrar o
            check-out.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
