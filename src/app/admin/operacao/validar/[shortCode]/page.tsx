'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Accessibility,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Info,
  Loader2,
  LogIn,
  LogOut,
  MessageCircle,
  Phone,
  ShieldAlert,
  Ticket,
  UserX,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { OperationalTicket } from '@/lib/tickets/get-operational-ticket'
import type { TicketOrderStatus, TicketPassStatus } from '@/types/tickets'
import {
  formatAge,
  formatCurrency,
  formatDateOnly,
  formatDuration,
  formatMinutes,
  formatTime,
} from './format'

const STATUS_LABEL: Record<TicketPassStatus, string> = {
  not_used: 'Aguardando entrada',
  checked_in: 'Em uso no parque',
  checked_out: 'Finalizado',
}

const BLOCKED_ORDER_REASON: Partial<Record<TicketOrderStatus, string>> = {
  pending_payment: 'A compra deste ticket ainda não foi paga.',
  payment_failed: 'O pagamento da compra deste ticket falhou.',
  cancelled: 'A compra deste ticket foi cancelada.',
}

async function fetchTicket(shortCode: string): Promise<OperationalTicket> {
  const res = await fetch(
    `/api/tickets/operate/${encodeURIComponent(shortCode)}`
  )
  const body = await res.json()
  if (!res.ok) throw new Error(body?.error ?? 'Erro ao buscar ticket')
  return body
}

function StatusBadge({ status }: { status: TicketPassStatus }) {
  const label = STATUS_LABEL[status]
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

function TicketHeader({ ticket }: { ticket: OperationalTicket }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Ticket className="text-muted-foreground size-6" />
        <div>
          <p className="font-mono text-xl font-bold tracking-widest">
            {ticket.shortCode}
          </p>
          <p className="text-sm font-medium">{ticket.holder.name}</p>
          <p className="text-muted-foreground text-xs">
            {ticket.kind === 'group_companion'
              ? 'Acompanhante do grupo'
              : 'Criança'}{' '}
            · {ticket.holder.passportTypeName}
          </p>
        </div>
      </div>
      <StatusBadge status={ticket.status} />
    </div>
  )
}

function BackToSearchButton() {
  return (
    <Button
      nativeButton={false}
      render={<Link href="/admin/operacao/ingressos" />}
      variant="outline"
    >
      <ArrowLeft className="size-4" />
      Ver ingressos
    </Button>
  )
}

function DocumentWarningBanner() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4">
      <Info className="size-5 shrink-0 text-amber-700" />
      <p className="text-sm font-semibold text-amber-900">
        APRESENTE UM DOCUMENTO COM FOTO DA CRIANÇA NA ENTRADA DO PARQUE PARA
        UTILIZAR O PASSAPORTE.
      </p>
    </div>
  )
}

function HolderConference({ ticket }: { ticket: OperationalTicket }) {
  const { holder, companionIncluded, order } = ticket

  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-base font-semibold">{holder.name}</p>
            <p className="text-muted-foreground text-sm">
              {holder.birthDate && holder.ageMonths != null
                ? `${formatDateOnly(holder.birthDate)} · ${formatAge(holder.ageMonths)} · `
                : ''}
              {holder.passportTypeName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {holder.isPNE && (
              <Badge
                variant="outline"
                className="border-blue-300 text-blue-700"
              >
                <Accessibility className="size-3" />
                PNE
              </Badge>
            )}
            <span className="text-sm font-medium">
              {formatCurrency(holder.unitPrice)}
            </span>
          </div>
        </div>

        {ticket.kind === 'group_companion' && holder.phone && (
          <p className="text-muted-foreground inline-flex items-center gap-1 text-sm">
            <Phone className="size-3.5" />
            {holder.phone}
          </p>
        )}

        {companionIncluded && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm">
            <Users className="mt-0.5 size-4 shrink-0 text-amber-700" />
            <p className="text-amber-900">
              <span className="font-semibold">
                Este ticket tem 1 acompanhante incluso: {companionIncluded.name}
              </span>{' '}
              — confirme que possui mais de 18 anos (documento com foto).
              {companionIncluded.phone && (
                <span className="block text-xs">
                  Telefone: {companionIncluded.phone}
                </span>
              )}
            </p>
          </div>
        )}

        {holder.hasCompanion === false && (
          <div className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-sm">
            <UserX className="mt-0.5 size-4 shrink-0 text-red-700" />
            <div className="text-red-900">
              <p className="font-semibold">
                Esta criança ficará SEM acompanhante
                {holder.unaccompaniedTermsAcceptedAt && (
                  <>
                    {' '}
                    — Termo de Responsabilidade aceito em{' '}
                    {formatDateOnly(holder.unaccompaniedTermsAcceptedAt)}
                  </>
                )}
                .
              </p>
              <div className="mt-1 flex flex-wrap gap-3 text-xs font-medium">
                <span className="inline-flex items-center gap-1">
                  <Phone className="size-3" />
                  {order.guardianPhone}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageCircle className="size-3" />
                  {order.guardianWhatsapp}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function OtherTickets({ ticket }: { ticket: OperationalTicket }) {
  if (ticket.otherTickets.length === 0) return null
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Outros tickets desta compra</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {ticket.otherTickets.map((other) => (
          <Link
            key={other.shortCode}
            href={`/admin/operacao/validar/${other.shortCode}`}
            className="hover:bg-muted flex min-h-12 flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium">{other.holderName}</span>
              <span className="text-muted-foreground font-mono text-xs tracking-widest">
                {other.shortCode}
                {other.kind === 'group_companion' && ' · Acompanhante do grupo'}
              </span>
            </div>
            <StatusBadge status={other.status} />
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}

type TimeInfo = {
  elapsedSeconds: number
  remainingSeconds: number
  overtimeSeconds: number
  isOvertime: boolean
  plannedEndAt: Date
}

function getTimeInfo(
  ticket: OperationalTicket | undefined,
  now: number
): TimeInfo | null {
  if (!ticket?.checkedInAt) return null
  const checkedInMs = new Date(ticket.checkedInAt).getTime()
  const referenceMs = ticket.checkedOutAt
    ? new Date(ticket.checkedOutAt).getTime()
    : now
  const contractedSeconds = ticket.contractedDurationMinutes * 60
  const elapsedSeconds = Math.max(
    0,
    Math.floor((referenceMs - checkedInMs) / 1000)
  )
  const remainingSeconds = contractedSeconds - elapsedSeconds
  const isOvertime = remainingSeconds < 0
  return {
    elapsedSeconds,
    remainingSeconds,
    overtimeSeconds: isOvertime ? -remainingSeconds : 0,
    isOvertime,
    plannedEndAt: new Date(checkedInMs + contractedSeconds * 1000),
  }
}

export default function OperacaoTicketPage() {
  const { shortCode } = useParams<{ shortCode: string }>()
  const queryClient = useQueryClient()
  const [confirmingCheckout, setConfirmingCheckout] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const queryKey = ['operacao', 'ticket', shortCode]

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => fetchTicket(shortCode),
    retry: false,
    refetchInterval: (query) =>
      query.state.data?.status === 'checked_in' ? 30_000 : false,
  })

  useEffect(() => {
    if (data?.status !== 'checked_in') return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [data?.status])

  function afterAction(ticket: OperationalTicket) {
    queryClient.setQueryData(queryKey, ticket)
    queryClient.invalidateQueries({ queryKey: ['operacao', 'ingressos'] })
  }

  const checkInMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `/api/tickets/operate/${encodeURIComponent(shortCode)}/check-in`,
        {
          method: 'POST',
        }
      )
      const body = await res.json()
      if (!res.ok) throw new Error(body?.error ?? 'Erro ao realizar check-in')
      return body as OperationalTicket
    },
    onSuccess: (ticket) => {
      afterAction(ticket)
      toast.success('Check-in realizado com sucesso')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const checkOutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `/api/tickets/operate/${encodeURIComponent(shortCode)}/check-out`,
        {
          method: 'POST',
        }
      )
      const body = await res.json()
      if (!res.ok) throw new Error(body?.error ?? 'Erro ao realizar check-out')
      return body as OperationalTicket
    },
    onSuccess: (ticket) => {
      afterAction(ticket)
      setConfirmingCheckout(false)
      toast.success('Check-out realizado com sucesso')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const timeInfo = getTimeInfo(data, now)

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 p-10 text-center">
        <AlertTriangle className="text-destructive size-10" />
        <h1 className="text-xl font-bold">Ticket não encontrado</h1>
        <p className="text-muted-foreground text-sm">
          {error instanceof Error
            ? error.message
            : 'Confira o código e tente novamente.'}
        </p>
        <BackToSearchButton />
      </div>
    )
  }

  const blockedReason = BLOCKED_ORDER_REASON[data.order.status]
  const isPaid = data.order.status === 'paid'
  const contracted = formatMinutes(data.contractedDurationMinutes)

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-6">
      <BackToSearchButton />
      <TicketHeader ticket={data} />

      <p className="text-muted-foreground text-sm">
        Compra{' '}
        <span className="font-mono tracking-widest">
          {data.order.shortCode}
        </span>{' '}
        · {data.order.guardianName}
      </p>

      {blockedReason && (
        <Card className="border-destructive/40">
          <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
            <ShieldAlert className="text-destructive size-10" />
            <p className="text-destructive text-lg font-semibold">
              {blockedReason}
            </p>
            <p className="text-muted-foreground text-sm">
              Não é possível processar entrada para este ticket.
            </p>
          </CardContent>
        </Card>
      )}

      {isPaid && data.status === 'not_used' && (
        <>
          <DocumentWarningBanner />

          <Card>
            <CardContent className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <div>
                <p className="text-muted-foreground">Valor do ticket</p>
                <p className="font-semibold">
                  {formatCurrency(data.holder.unitPrice)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Tempo contratado</p>
                <p className="font-semibold">{contracted}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Telefone / WhatsApp</p>
                <p className="font-semibold">{data.order.guardianPhone}</p>
              </div>
            </CardContent>
          </Card>

          <HolderConference ticket={data} />

          <Button
            size="lg"
            className="h-14 w-full text-base"
            disabled={checkInMutation.isPending}
            onClick={() => {
              const confirmed = window.confirm(
                `Confirmar a entrada de ${data.holder.name}? Esta ação registrará o check-in em seu nome e iniciará a contagem do tempo contratado deste ticket.`
              )
              if (confirmed) checkInMutation.mutate()
            }}
          >
            {checkInMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <LogIn className="size-4" />
            )}
            Aprovar entrada / Check-in
          </Button>
        </>
      )}

      {data.status === 'checked_in' && timeInfo && (
        <>
          <Card className={timeInfo.isOvertime ? 'border-red-400' : undefined}>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-muted-foreground">Entrada</p>
                  <p className="font-semibold">
                    {data.checkedInAt ? formatTime(data.checkedInAt) : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tempo contratado</p>
                  <p className="font-semibold">{contracted}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Término previsto</p>
                  <p className="font-semibold">
                    {formatTime(timeInfo.plannedEndAt.toISOString())}
                  </p>
                </div>
              </div>

              <div className="bg-muted flex flex-col items-center gap-1 rounded-xl py-6">
                <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
                  <Clock className="size-4" />
                  Tempo decorrido
                </p>
                <p
                  className={`font-mono text-4xl font-bold tabular-nums ${timeInfo.isOvertime ? 'text-red-600' : ''}`}
                >
                  {formatDuration(timeInfo.elapsedSeconds)}
                </p>
              </div>

              {timeInfo.isOvertime ? (
                <div className="flex items-center justify-center gap-2 rounded-lg border border-red-400 bg-red-50 p-3 text-red-800">
                  <AlertTriangle className="size-5" />
                  <p className="font-semibold">
                    Tempo excedente: {formatDuration(timeInfo.overtimeSeconds)}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground text-center text-sm">
                  Tempo restante:{' '}
                  <span className="font-semibold">
                    {formatDuration(timeInfo.remainingSeconds)}
                  </span>
                </p>
              )}

              {data.checkedInByName && (
                <p className="text-muted-foreground text-center text-xs">
                  Check-in feito por {data.checkedInByName}
                </p>
              )}
            </CardContent>
          </Card>

          <HolderConference ticket={data} />

          {!confirmingCheckout ? (
            <Button
              size="lg"
              variant="outline"
              className="h-14 w-full text-base"
              onClick={() => setConfirmingCheckout(true)}
            >
              <LogOut className="size-4" />
              Check-out
            </Button>
          ) : (
            <Card className="border-primary/40">
              <CardHeader>
                <CardTitle className="text-base">Confirmar check-out</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Entrada</p>
                    <p className="font-medium">
                      {data.checkedInAt ? formatTime(data.checkedInAt) : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Término previsto</p>
                    <p className="font-medium">
                      {formatTime(timeInfo.plannedEndAt.toISOString())}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tempo contratado</p>
                    <p className="font-medium">{contracted}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">
                      Tempo utilizado até agora
                    </p>
                    <p
                      className={`font-medium ${timeInfo.isOvertime ? 'text-red-600' : ''}`}
                    >
                      {formatDuration(timeInfo.elapsedSeconds)}
                    </p>
                  </div>
                </div>

                {timeInfo.isOvertime && (
                  <div className="flex flex-col gap-2 rounded-lg border border-red-400 bg-red-50 p-3 text-sm text-red-800">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="size-4 shrink-0" />
                      <span className="font-semibold">
                        Tempo excedente — cobrar à parte no caixa
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs opacity-80">Contratado</p>
                        <p className="font-semibold">{contracted}</p>
                      </div>
                      <div>
                        <p className="text-xs opacity-80">Utilizado</p>
                        <p className="font-semibold">
                          {formatDuration(timeInfo.elapsedSeconds)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs opacity-80">Extra (exato)</p>
                        <p className="font-mono font-bold">
                          {formatDuration(timeInfo.overtimeSeconds)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs opacity-80">
                          Extra (minutos iniciados)
                        </p>
                        <p className="font-bold">
                          {Math.ceil(timeInfo.overtimeSeconds / 60)} min
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    className="h-12 flex-1"
                    onClick={() => setConfirmingCheckout(false)}
                    disabled={checkOutMutation.isPending}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="h-12 flex-1"
                    onClick={() => checkOutMutation.mutate()}
                    disabled={checkOutMutation.isPending}
                  >
                    {checkOutMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-4" />
                    )}
                    Confirmar check-out
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {data.status === 'checked_out' && (
        <>
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-6 text-center">
              <CheckCircle2 className="text-muted-foreground size-8" />
              <p className="font-semibold">Check-out realizado</p>
              <p className="text-muted-foreground text-sm">
                {data.overtimeMinutes && data.overtimeMinutes > 0
                  ? 'Saída registrada com tempo excedente — confira o valor extra a cobrar no caixa.'
                  : 'Saída registrada dentro do tempo contratado. Nada a cobrar.'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <div>
                <p className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="size-3.5" />
                  Entrada
                </p>
                <p className="font-semibold">
                  {data.checkedInAt ? formatTime(data.checkedInAt) : '—'}
                </p>
                {data.checkedInByName && (
                  <p className="text-muted-foreground text-xs">
                    por {data.checkedInByName}
                  </p>
                )}
              </div>
              <div>
                <p className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="size-3.5" />
                  Saída
                </p>
                <p className="font-semibold">
                  {data.checkedOutAt ? formatTime(data.checkedOutAt) : '—'}
                </p>
                {data.checkedOutByName && (
                  <p className="text-muted-foreground text-xs">
                    por {data.checkedOutByName}
                  </p>
                )}
              </div>
              <div>
                <p className="text-muted-foreground">Tempo contratado</p>
                <p className="font-semibold">{contracted}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tempo total utilizado</p>
                <p className="font-semibold">
                  {timeInfo ? formatDuration(timeInfo.elapsedSeconds) : '—'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Tempo excedente</p>
                <p
                  className={
                    data.overtimeMinutes && data.overtimeMinutes > 0
                      ? 'font-semibold text-red-700'
                      : 'font-semibold'
                  }
                >
                  {data.overtimeMinutes != null
                    ? formatMinutes(data.overtimeMinutes)
                    : '—'}
                </p>
              </div>
            </CardContent>
          </Card>

          <HolderConference ticket={data} />
        </>
      )}

      {!isPaid && data.status === 'not_used' && (
        <HolderConference ticket={data} />
      )}

      <OtherTickets ticket={data} />
    </div>
  )
}
