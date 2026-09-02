'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  AlertCircle,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Loader2,
  ShieldAlert,
  Sparkles,
  Users,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { ConfirmationPaidResponse, ConfirmationResponse } from './types'
import { currency, formatAge } from './utils'

const POLL_INTERVAL_MS = 2000
const LONG_WAIT_MS = 60000

async function fetchConfirmation(shortCode: string): Promise<ConfirmationResponse> {
  const res = await fetch(`/api/tickets/confirmation/${encodeURIComponent(shortCode)}`)
  const json = await res.json().catch(() => null)
  if (!res.ok) {
    const message =
      json && typeof json === 'object' && 'error' in json && typeof (json as { error?: unknown }).error === 'string'
        ? ((json as { error: string }).error)
        : 'Não foi possível localizar essa compra.'
    throw new Error(message)
  }
  return json as ConfirmationResponse
}

function StatusCard({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-2xl bg-white p-8 text-center shadow-sm md:p-12">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">{icon}</div>
      <h1 className="font-heading text-2xl font-bold text-gray-800">{title}</h1>
      {description && <p className="font-body max-w-md text-sm text-gray-500">{description}</p>}
      {action}
    </div>
  )
}

function PaidConfirmation({
  data,
  copied,
  onCopy,
}: {
  data: ConfirmationPaidResponse
  copied: boolean
  onCopy: () => void
}) {
  const hasFreeCompanionChild = (data.children ?? []).some((c) => c.hasCompanion === true)
  const hasUnaccompaniedChild = (data.children ?? []).some((c) => c.hasCompanion === false)

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-8 text-center shadow-sm">
        <div className="bg-brand-lime/10 flex h-16 w-16 items-center justify-center rounded-full">
          <CheckCircle2 size={32} className="text-brand-lime" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-gray-800 md:text-3xl">Pagamento confirmado!</h1>
        <p className="font-body max-w-md text-sm text-gray-500">
          Obrigado, {data.guardianName}. Seu ingresso já está pronto — mostre o QR Code ou o código abaixo
          na entrada do parque.
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-sm">
        {data.qrCodeDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.qrCodeDataUrl}
            alt={`QR Code de acesso do ingresso ${data.shortCode}`}
            className="h-52 w-52 rounded-xl border border-gray-100"
          />
        )}

        <div className="flex flex-col items-center gap-1.5">
          <span className="font-body text-xs text-gray-400">Código de acesso</span>
          <button
            type="button"
            onClick={onCopy}
            className="font-heading flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-2xl font-bold tracking-widest text-gray-800 transition-colors hover:border-brand-pink"
          >
            {data.shortCode}
            {copied ? <Check size={18} className="text-brand-lime" /> : <Copy size={18} className="text-gray-400" />}
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {data.qrCodeDataUrl && (
            <a href={data.qrCodeDataUrl} download={`ingresso-${data.shortCode}.png`}>
              <Button type="button" className="bg-brand-pink hover:bg-brand-pink/90 rounded-full text-white">
                <Download size={16} />
                Salvar QR Code
              </Button>
            </a>
          )}
        </div>

        <p className="font-body flex items-center gap-1.5 text-xs text-gray-400">
          <Camera size={13} />
          Você também pode tirar um print desta tela.
        </p>
      </div>

      <div className="font-body flex items-start gap-3 rounded-2xl border-2 border-brand-yellow bg-brand-yellow/10 p-4 text-sm text-gray-700">
        <ShieldAlert size={20} className="mt-0.5 shrink-0 text-brand-yellow" />
        <p>
          <strong>Apresente um documento com foto da criança</strong> na entrada do parque para utilizar o
          passaporte.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm md:p-6">
        <h2 className="font-heading text-sm font-bold text-gray-800">Resumo da compra</h2>

        <div className="flex flex-col gap-2 border-b border-gray-100 pb-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-body text-gray-500">Duração contratada</span>
            <span className="font-body flex items-center gap-1 font-semibold text-gray-800">
              <Clock size={14} />
              {data.contractedDurationMinutes} min
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-body text-gray-500">Valor total</span>
            <span className="font-heading text-brand-pink text-lg font-bold">{currency(data.totalAmount)}</span>
          </div>
        </div>

        {(data.children ?? []).length > 0 && (
          <div className="flex flex-col gap-2 border-b border-gray-100 pb-3">
            <span className="font-body text-xs font-semibold text-gray-400">Crianças</span>
            {(data.children ?? []).map((child, idx) => (
              <div key={`conf-child-${idx}`} className="flex flex-col gap-1 rounded-xl bg-gray-50 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-body text-sm font-medium text-gray-700">{child.name ?? `Criança ${idx + 1}`}</span>
                  {child.unitPrice !== undefined && (
                    <span className="font-body text-sm font-semibold text-gray-800">{currency(child.unitPrice)}</span>
                  )}
                </div>
                <div className="font-body flex flex-wrap items-center gap-1.5 text-[11px] text-gray-400">
                  {child.passportTypeName && <span>{child.passportTypeName}</span>}
                  {typeof child.ageMonths === 'number' && <span>· {formatAge(child.ageMonths)}</span>}
                  {child.isPNE && (
                    <span className="text-brand-purple inline-flex items-center gap-0.5 font-semibold">
                      <Sparkles size={10} /> PNE
                    </span>
                  )}
                </div>
                {child.hasCompanion === true && (
                  <p className="font-body mt-1 flex items-start gap-1.5 text-xs text-gray-600">
                    <Users size={13} className="mt-0.5 shrink-0 text-brand-cyan" />
                    Com acompanhante gratuito{child.companionName ? ` (${child.companionName})` : ''} — comprovar
                    que possui mais de 18 anos na entrada.
                  </p>
                )}
                {(child.hasCompanion === false || child.unaccompanied) && (
                  <p className="font-body mt-1 flex items-start gap-1.5 text-xs text-amber-700">
                    <AlertCircle size={13} className="mt-0.5 shrink-0" />
                    Sem acompanhante — Termo de Responsabilidade aceito. Contato do responsável:{' '}
                    {data.guardianPhone ?? data.guardianWhatsapp ?? 'registrado na compra'}
                    {data.guardianPhone && data.guardianWhatsapp && data.guardianPhone !== data.guardianWhatsapp
                      ? ` / WhatsApp ${data.guardianWhatsapp}`
                      : ''}
                    .
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {(data.companions ?? []).length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="font-body text-xs font-semibold text-gray-400">Acompanhantes</span>
            {(data.companions ?? []).map((companion, idx) => (
              <div key={`conf-companion-${idx}`} className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
                <div className="flex flex-col">
                  <span className="font-body text-sm font-medium text-gray-700">{companion.name ?? `Acompanhante ${idx + 1}`}</span>
                  {companion.passportTypeName && (
                    <span className="font-body text-[11px] text-gray-400">{companion.passportTypeName}</span>
                  )}
                </div>
                <span
                  className={
                    companion.isFree
                      ? 'font-body text-xs font-semibold text-brand-lime'
                      : 'font-body text-sm font-semibold text-gray-800'
                  }
                >
                  {companion.isFree ? 'Gratuito' : companion.unitPrice ? currency(companion.unitPrice) : ''}
                </span>
              </div>
            ))}
          </div>
        )}

        {(hasFreeCompanionChild || hasUnaccompaniedChild) && (
          <p className="font-body text-xs text-gray-400">
            Avisos específicos de cada criança estão detalhados acima e serão conferidos pela nossa equipe
            na entrada.
          </p>
        )}
      </div>

      <p className="font-body text-center text-xs text-gray-400">
        Enviamos uma cópia deste comprovante para o seu e-mail. Guarde o código{' '}
        <strong>{data.shortCode}</strong> — ele também será usado na saída do parque.
      </p>

      <div className="flex justify-center">
        <Link href="/" className="font-body text-brand-pink text-sm font-semibold hover:underline">
          Voltar para a home
        </Link>
      </div>
    </div>
  )
}

export default function ConfirmationView({ shortCode }: { shortCode: string }) {
  const [copied, setCopied] = useState(false)
  const [longWait, setLongWait] = useState(false)

  const query = useQuery<ConfirmationResponse, Error>({
    queryKey: ['ticket-confirmation', shortCode],
    queryFn: () => fetchConfirmation(shortCode),
    refetchInterval: (q) => {
      const data = q.state.data
      if (data && 'status' in data && data.status !== 'pending_payment') return false
      return POLL_INTERVAL_MS
    },
    retry: 1,
  })

  useEffect(() => {
    const timer = setTimeout(() => setLongWait(true), LONG_WAIT_MS)
    return () => clearTimeout(timer)
  }, [])

  function handleCopy() {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return
    navigator.clipboard.writeText(shortCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (query.isLoading) {
    return <StatusCard icon={<Loader2 className="animate-spin text-brand-cyan" size={32} />} title="Carregando sua compra..." />
  }

  if (query.isError) {
    return (
      <StatusCard
        icon={<AlertCircle size={32} className="text-red-500" />}
        title="Não encontramos essa compra"
        description={query.error.message}
        action={
          <Button
            type="button"
            onClick={() => query.refetch()}
            className="bg-brand-pink hover:bg-brand-pink/90 rounded-full text-white"
          >
            Tentar novamente
          </Button>
        }
      />
    )
  }

  const data = query.data

  if (!data || 'error' in data || data.status === 'pending_payment') {
    return (
      <StatusCard
        icon={<Loader2 className="animate-spin text-brand-cyan" size={32} />}
        title="Processando pagamento..."
        description={
          longWait
            ? 'Isso está demorando mais que o esperado. Assim que o pagamento for confirmado, esta página é atualizada automaticamente — você também receberá um e-mail de confirmação.'
            : 'Aguarde só um instante enquanto confirmamos seu pagamento junto ao Stripe.'
        }
      />
    )
  }

  if (data.status === 'payment_failed') {
    return (
      <StatusCard
        icon={<AlertCircle size={32} className="text-red-500" />}
        title="Pagamento não foi concluído"
        description="O pagamento dessa compra não foi confirmado pelo Stripe. Você pode voltar e tentar novamente."
        action={
          <Link href="/compra-antecipada">
            <Button type="button" className="bg-brand-pink hover:bg-brand-pink/90 rounded-full text-white">
              Tentar novamente
            </Button>
          </Link>
        }
      />
    )
  }

  if (data.status === 'paid' || data.status === 'checked_in' || data.status === 'checked_out') {
    return <PaidConfirmation data={data} copied={copied} onCopy={handleCopy} />
  }

  return null
}
