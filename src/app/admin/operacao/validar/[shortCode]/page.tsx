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
import type { OperationalOrder } from '@/lib/tickets/get-operational-order'
import {
  formatAge,
  formatCurrency,
  formatDateOnly,
  formatDuration,
  formatMinutes,
  formatTime,
} from './format'

const STATUS_LABEL: Record<OperationalOrder['status'], string> = {
  pending_payment: 'Aguardando pagamento',
  paid: 'Pago — aguardando entrada',
  payment_failed: 'Pagamento falhou',
  cancelled: 'Cancelada',
  checked_in: 'Em uso no parque',
  checked_out: 'Finalizada',
}

const BLOCKED_STATUS_REASON: Partial<Record<OperationalOrder['status'], string>> = {
  pending_payment: 'Esta compra ainda não foi paga.',
  payment_failed: 'O pagamento desta compra falhou.',
  cancelled: 'Esta compra foi cancelada.',
}

async function fetchOrder(shortCode: string): Promise<OperationalOrder> {
  const res = await fetch(`/api/tickets/operate/${encodeURIComponent(shortCode)}`)
  const body = await res.json()
  if (!res.ok) throw new Error(body?.error ?? 'Erro ao buscar compra')
  return body
}

function StatusBadge({ status }: { status: OperationalOrder['status'] }) {
  const label = STATUS_LABEL[status]
  if (status === 'checked_in') {
    return <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">{label}</Badge>
  }
  if (status === 'checked_out') return <Badge variant="outline">{label}</Badge>
  if (status === 'paid') return <Badge variant="secondary">{label}</Badge>
  return <Badge variant="destructive">{label}</Badge>
}

function OrderHeader({ order }: { order: OperationalOrder }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Ticket className="size-6 text-muted-foreground" />
        <div>
          <p className="font-mono text-xl font-bold tracking-widest">{order.shortCode}</p>
          <p className="text-sm text-muted-foreground">{order.guardianName}</p>
        </div>
      </div>
      <StatusBadge status={order.status} />
    </div>
  )
}

function BackToSearchButton() {
  return (
    <Button nativeButton={false} render={<Link href="/admin/operacao/validar" />} variant="outline">
      <ArrowLeft className="size-4" />
      Voltar para a busca
    </Button>
  )
}

function DocumentWarningBanner() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/40">
      <Info className="size-5 shrink-0 text-amber-700 dark:text-amber-400" />
      <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">
        APRESENTE UM DOCUMENTO COM FOTO DA CRIANÇA NA ENTRADA DO PARQUE PARA UTILIZAR O
        PASSAPORTE.
      </p>
    </div>
  )
}

function ChildrenConference({ order }: { order: OperationalOrder }) {
  return (
    <div className="flex flex-col gap-3">
      {order.children.map((child) => (
        <Card key={child.id}>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-base font-semibold">{child.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDateOnly(child.birthDate)} · {formatAge(child.ageMonths)} ·{' '}
                  {child.passportTypeName}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {child.isPNE && (
                  <Badge
                    variant="outline"
                    className="border-blue-300 text-blue-700 dark:border-blue-800 dark:text-blue-300"
                  >
                    <Accessibility className="size-3" />
                    PNE
                  </Badge>
                )}
                <span className="text-sm font-medium">{formatCurrency(child.unitPrice)}</span>
              </div>
            </div>

            {child.hasCompanion === true && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-800 dark:bg-amber-950/40">
                <Users className="mt-0.5 size-4 shrink-0 text-amber-700 dark:text-amber-400" />
                <p className="text-amber-900 dark:text-amber-300">
                  <span className="font-semibold">Acompanhante: {child.companion?.name ?? '—'}</span>{' '}
                  — confirme que possui mais de 18 anos (documento com foto).
                  {child.companion?.phone && (
                    <span className="block text-xs">Telefone: {child.companion.phone}</span>
                  )}
                </p>
              </div>
            )}

            {child.hasCompanion === false && (
              <div className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-sm dark:border-red-900 dark:bg-red-950/40">
                <UserX className="mt-0.5 size-4 shrink-0 text-red-700 dark:text-red-400" />
                <div className="text-red-900 dark:text-red-300">
                  <p className="font-semibold">
                    Esta criança ficará SEM acompanhante
                    {child.unaccompaniedTermsAcceptedAt && (
                      <> — Termo de Responsabilidade aceito em{' '}
                        {formatDateOnly(child.unaccompaniedTermsAcceptedAt)}</>
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
      ))}
    </div>
  )
}

function AdditionalCompanions({ order }: { order: OperationalOrder }) {
  if (order.companions.length === 0) return null
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Acompanhantes adicionais</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {order.companions.map((c) => (
          <div key={c.id} className="flex items-center justify-between text-sm">
            <span>{c.name}</span>
            <span className="font-medium">
              {c.isFree ? 'Gratuito' : formatCurrency(c.unitPrice)}
            </span>
          </div>
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

function getTimeInfo(order: OperationalOrder | undefined, now: number): TimeInfo | null {
  if (!order?.checkedInAt) return null
  const checkedInMs = new Date(order.checkedInAt).getTime()
  const referenceMs = order.checkedOutAt ? new Date(order.checkedOutAt).getTime() : now
  const elapsedSeconds = Math.max(0, Math.floor((referenceMs - checkedInMs) / 1000))
  const contractedSeconds = (order.contractedDurationMinutes ?? 0) * 60
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

export default function OperacaoOrderPage() {
  const { shortCode } = useParams<{ shortCode: string }>()
  const queryClient = useQueryClient()
  const [confirmingCheckout, setConfirmingCheckout] = useState(false)
  const [now, setNow] = useState(() => Date.now())

  const { data, isLoading, error } = useQuery({
    queryKey: ['operacao', 'order', shortCode],
    queryFn: () => fetchOrder(shortCode),
    retry: false,
    refetchInterval: (query) => (query.state.data?.status === 'checked_in' ? 30_000 : false),
  })

  useEffect(() => {
    if (data?.status !== 'checked_in') return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [data?.status])

  const checkInMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/tickets/operate/${encodeURIComponent(shortCode)}/check-in`, {
        method: 'POST',
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body?.error ?? 'Erro ao realizar check-in')
      return body as OperationalOrder
    },
    onSuccess: (order) => {
      queryClient.setQueryData(['operacao', 'order', shortCode], order)
      toast.success('Check-in realizado com sucesso')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const checkOutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/tickets/operate/${encodeURIComponent(shortCode)}/check-out`, {
        method: 'POST',
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body?.error ?? 'Erro ao realizar check-out')
      return body as OperationalOrder
    },
    onSuccess: (order) => {
      queryClient.setQueryData(['operacao', 'order', shortCode], order)
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
        <AlertTriangle className="size-10 text-destructive" />
        <h1 className="text-xl font-bold">Compra não encontrada</h1>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : 'Confira o código e tente novamente.'}
        </p>
        <BackToSearchButton />
      </div>
    )
  }

  const blockedReason = BLOCKED_STATUS_REASON[data.status]

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-6">
      <BackToSearchButton />
      <OrderHeader order={data} />

      {blockedReason && (
        <Card className="border-destructive/40">
          <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
            <ShieldAlert className="size-10 text-destructive" />
            <p className="text-lg font-semibold text-destructive">{blockedReason}</p>
            <p className="text-sm text-muted-foreground">
              Não é possível processar entrada para esta compra.
            </p>
          </CardContent>
        </Card>
      )}

      {data.status === 'paid' && (
        <>
          <DocumentWarningBanner />

          <Card>
            <CardContent className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <div>
                <p className="text-muted-foreground">Valor pago</p>
                <p className="font-semibold">{formatCurrency(data.totalAmount)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tempo contratado</p>
                <p className="font-semibold">
                  {data.contractedDurationMinutes != null
                    ? formatMinutes(data.contractedDurationMinutes)
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Telefone / WhatsApp</p>
                <p className="font-semibold">{data.guardianPhone}</p>
              </div>
            </CardContent>
          </Card>

          <ChildrenConference order={data} />
          <AdditionalCompanions order={data} />

          <Button
            size="lg"
            className="h-14 w-full text-base"
            disabled={checkInMutation.isPending}
            onClick={() => {
              const confirmed = window.confirm(
                `Confirmar a entrada de ${data.children.length} criança(s) desta compra? Esta ação registrará o check-in em seu nome e iniciará a contagem do tempo contratado.`
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
          <Card className={timeInfo.isOvertime ? 'border-red-400 dark:border-red-800' : undefined}>
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
                  <p className="font-semibold">
                    {data.contractedDurationMinutes != null
                      ? formatMinutes(data.contractedDurationMinutes)
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Término previsto</p>
                  <p className="font-semibold">{formatTime(timeInfo.plannedEndAt.toISOString())}</p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-1 rounded-xl bg-muted py-6">
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="size-4" />
                  Tempo decorrido
                </p>
                <p className="font-mono text-4xl font-bold tabular-nums">
                  {formatDuration(timeInfo.elapsedSeconds)}
                </p>
              </div>

              {timeInfo.isOvertime ? (
                <div className="flex items-center justify-center gap-2 rounded-lg border border-red-400 bg-red-50 p-3 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
                  <AlertTriangle className="size-5" />
                  <p className="font-semibold">
                    Tempo excedente: {formatDuration(timeInfo.overtimeSeconds)}
                  </p>
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground">
                  Tempo restante: <span className="font-semibold">{formatDuration(timeInfo.remainingSeconds)}</span>
                </p>
              )}

              {data.checkedInByName && (
                <p className="text-center text-xs text-muted-foreground">
                  Check-in feito por {data.checkedInByName}
                </p>
              )}
            </CardContent>
          </Card>

          <ChildrenConference order={data} />

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
                    <p className="font-medium">{formatTime(timeInfo.plannedEndAt.toISOString())}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tempo contratado</p>
                    <p className="font-medium">
                      {data.contractedDurationMinutes != null
                        ? formatMinutes(data.contractedDurationMinutes)
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tempo utilizado até agora</p>
                    <p className="font-medium">{formatDuration(timeInfo.elapsedSeconds)}</p>
                  </div>
                </div>

                {timeInfo.isOvertime && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-400 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
                    <AlertTriangle className="size-4 shrink-0" />
                    <span className="font-semibold">
                      Tempo excedente: {formatDuration(timeInfo.overtimeSeconds)}
                    </span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={() => setConfirmingCheckout(false)}
                    disabled={checkOutMutation.isPending}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1"
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
              <CheckCircle2 className="size-8 text-muted-foreground" />
              <p className="font-semibold">Esta compra já foi finalizada.</p>
              <p className="text-sm text-muted-foreground">
                O check-in já ocorreu e o check-out foi confirmado. Não é possível processar uma
                nova entrada com este código.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <div>
                <p className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="size-3.5" />
                  Entrada
                </p>
                <p className="font-semibold">
                  {data.checkedInAt ? formatTime(data.checkedInAt) : '—'}
                </p>
                {data.checkedInByName && (
                  <p className="text-xs text-muted-foreground">por {data.checkedInByName}</p>
                )}
              </div>
              <div>
                <p className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="size-3.5" />
                  Saída
                </p>
                <p className="font-semibold">
                  {data.checkedOutAt ? formatTime(data.checkedOutAt) : '—'}
                </p>
                {data.checkedOutByName && (
                  <p className="text-xs text-muted-foreground">por {data.checkedOutByName}</p>
                )}
              </div>
              <div>
                <p className="text-muted-foreground">Tempo contratado</p>
                <p className="font-semibold">
                  {data.contractedDurationMinutes != null
                    ? formatMinutes(data.contractedDurationMinutes)
                    : '—'}
                </p>
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
                      ? 'font-semibold text-red-700 dark:text-red-400'
                      : 'font-semibold'
                  }
                >
                  {data.overtimeMinutes != null ? formatMinutes(data.overtimeMinutes) : '—'}
                </p>
              </div>
            </CardContent>
          </Card>

          <ChildrenConference order={data} />
        </>
      )}
    </div>
  )
}
