'use client'

import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

type StatusResponse = {
  partyStatus: 'pending' | 'confirmed' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed'
}

function Loading({ text }: { text: string }) {
  return (
    <>
      <div className="bg-brand-cyan/10 mb-6 flex h-16 w-16 items-center justify-center rounded-full">
        <Loader2 size={32} className="text-brand-cyan animate-spin" />
      </div>
      <h1 className="font-heading mb-4 text-3xl font-bold text-gray-800 md:text-4xl">
        Confirmando pagamento
      </h1>
      <p className="font-body text-lg text-gray-600">{text}</p>
    </>
  )
}

export default function PartyStatusMessage({
  partyId,
  sessionId,
}: {
  partyId?: string
  sessionId?: string
}) {
  const { data, isLoading, isError } = useQuery<StatusResponse>({
    queryKey: ['party-budget-status', sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/party-budget/status?session_id=${encodeURIComponent(sessionId!)}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Erro ao consultar status da reserva')
      return json as StatusResponse
    },
    enabled: Boolean(sessionId),
    refetchInterval: (query) => (query.state.data?.paymentStatus === 'pending' ? 2000 : false),
  })

  if (!sessionId) {
    return (
      <>
        <div className="bg-brand-lime/10 mb-6 flex h-16 w-16 items-center justify-center rounded-full">
          <CheckCircle2 size={32} className="text-brand-lime" />
        </div>
        <h1 className="font-heading mb-4 text-3xl font-bold text-gray-800 md:text-4xl">
          Reserva recebida!
        </h1>
        <p className="font-body text-lg text-gray-600">
          Recebemos sua reserva{partyId ? ` #${partyId}` : ''}! Em breve entraremos em contato para os
          próximos passos (confirmação e assinatura do contrato).
        </p>
      </>
    )
  }

  if (isLoading || (!isError && !data)) {
    return <Loading text="Estamos confirmando seu pagamento junto ao Stripe. Isso leva só alguns instantes..." />
  }

  if (isError || !data) {
    return (
      <>
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
          <AlertCircle size={32} className="text-amber-500" />
        </div>
        <h1 className="font-heading mb-4 text-3xl font-bold text-gray-800 md:text-4xl">
          Não foi possível confirmar agora
        </h1>
        <p className="font-body text-lg text-gray-600">
          Não conseguimos consultar o status do seu pagamento neste momento. Se o pagamento foi
          concluído, entraremos em contato em breve
          {partyId ? ` sobre a reserva #${partyId}` : ''}. Caso tenha dúvidas, fale conosco.
        </p>
      </>
    )
  }

  if (data.paymentStatus === 'paid') {
    return (
      <>
        <div className="bg-brand-lime/10 mb-6 flex h-16 w-16 items-center justify-center rounded-full">
          <CheckCircle2 size={32} className="text-brand-lime" />
        </div>
        <h1 className="font-heading mb-4 text-3xl font-bold text-gray-800 md:text-4xl">
          Pagamento confirmado!
        </h1>
        <p className="font-body text-lg text-gray-600">
          Recebemos o pagamento da sua reserva{partyId ? ` #${partyId}` : ''}. Em breve entraremos em
          contato para os próximos passos (confirmação e assinatura do contrato).
        </p>
      </>
    )
  }

  if (data.paymentStatus === 'failed') {
    return (
      <>
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <AlertCircle size={32} className="text-red-500" />
        </div>
        <h1 className="font-heading mb-4 text-3xl font-bold text-gray-800 md:text-4xl">
          Pagamento não confirmado
        </h1>
        <p className="font-body text-lg text-gray-600">
          Não conseguimos confirmar o pagamento da sua reserva{partyId ? ` #${partyId}` : ''}. Ela não
          foi concluída — você pode tentar novamente ou falar conosco.
        </p>
      </>
    )
  }

  return <Loading text="Estamos confirmando seu pagamento junto ao Stripe. Isso leva só alguns instantes..." />
}
