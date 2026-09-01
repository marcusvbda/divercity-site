'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Calendar,
  Users,
  Baby,
  PartyPopper,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ScrollText,
  Minus,
  Plus,
  MessageCircle,
} from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  PartyBudgetReservationSchema,
  type PartyBudgetReservationInput,
  type PartyPaymentOption,
} from '@/lib/schemas/parties'

type QuoteResponse = {
  available: boolean
  salonPrice: number
  passportPackagePrice: number | null
  passportSinglePrice: number | null
  total: number
}

type AvailabilityResponse = { available: boolean }

type ZodFlattenedError = {
  formErrors: string[]
  fieldErrors: Record<string, string[]>
}

class ApiError extends Error {
  status: number
  body: unknown
  constructor(status: number, body: unknown, message: string) {
    super(message)
    this.status = status
    this.body = body
  }
}

const TERMS_TEXT = `Antes de confirmar, é necessário estar ciente das regras aplicáveis à reserva.

Capacidade
- Máximo de 50 participantes no total.
- O salão possui 9 mesas e 36 cadeiras.
- Crianças, aniversariante e adultos entram no limite total de 50 participantes.

Salão
- Utilização por até 3 horas.
- Respeitar o horário limite conforme o dia.
- Todos os participantes entram no limite de 50.
- Participantes deverão utilizar pulseira de identificação.

Decoração
- O parque não fornece decoração.
- O cliente poderá contratar sua própria decoração.
- Não é permitido colar materiais nas paredes.
- Grandes volumes possuem horário específico para carga e descarga.
- O cliente deverá indicar um responsável para receber materiais.
- Funcionários do parque não deverão receber materiais da festa em nome do cliente.

Alimentação e bebidas
- O cliente poderá levar bebidas conforme as regras do parque.
- Poderá solicitar bebidas fornecidas pelo parque, mediante disponibilidade e solicitação antecipada.

Pagamento
- Opção A (Somente salão): nenhum valor é pago agora. No mínimo 10 passaportes deverão ser pagos no dia do evento (à vista, PIX ou cartão, conforme disponibilidade).
- Opção B (Salão + adiantamento de passaportes): se comparecerem menos crianças do que o reservado, não há reembolso pelos passaportes não utilizados; se comparecerem mais, os adicionais podem ser pagos avulsos no dia, conforme disponibilidade.
- Esta reserva ainda não é uma cobrança. Nossa equipe entrará em contato pelo WhatsApp para confirmar os detalhes, formalizar o contrato e combinar o pagamento.`

function currency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatCPF(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

function formatPhone(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function dateToLocalInputValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function isoToLocalInputValue(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return dateToLocalInputValue(d)
}

const STEP_LABELS = ['Seus dados', 'Orçamento', 'Termos e envio']
const PASSPORT_PACKAGE_SIZE = 10

export default function OrcamentoWizard() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isDateConflict, setIsDateConflict] = useState(false)
  const [createdPartyId, setCreatedPartyId] = useState<number | null>(null)

  const {
    register,
    control,
    watch,
    setValue,
    getValues,
    trigger,
    setError,
    handleSubmit,
    formState: { errors },
  } = useForm<PartyBudgetReservationInput>({
    resolver: zodResolver(PartyBudgetReservationSchema),
    defaultValues: {
      cpf: '',
      name: '',
      email: '',
      phone: '',
      date: '',
      childrenCount: 0,
      adultsCount: 0,
      totalParticipants: 0,
      passportSingleCount: 0,
      termsAccepted: false,
    } as unknown as PartyBudgetReservationInput,
  })

  const childrenCount = watch('childrenCount') ?? 0
  const adultsCount = watch('adultsCount') ?? 0
  const dateIso = watch('date')
  const paymentOption = watch('paymentOption')
  const passportSingleCount = watch('passportSingleCount') ?? 0
  const termsAccepted = watch('termsAccepted')
  const total = childrenCount + adultsCount

  const availabilityQuery = useQuery<AvailabilityResponse>({
    queryKey: ['party-budget-availability', dateIso],
    queryFn: async () => {
      const res = await fetch(`/api/party-budget/availability?date=${encodeURIComponent(dateIso)}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Erro ao verificar disponibilidade')
      return json as AvailabilityResponse
    },
    enabled: Boolean(dateIso),
    retry: false,
  })

  const quoteQuery = useQuery<QuoteResponse>({
    queryKey: ['party-budget-quote-prices', dateIso],
    queryFn: async () => {
      const params = new URLSearchParams({
        date: dateIso,
        paymentOption: 'salon_and_passports',
        passportSingleCount: '0',
      })
      const res = await fetch(`/api/party-budget/quote?${params.toString()}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Erro ao calcular orçamento')
      return json as QuoteResponse
    },
    enabled: step === 2 && Boolean(dateIso),
    retry: false,
  })

  const mutation = useMutation({
    mutationFn: async (payload: PartyBudgetReservationInput) => {
      const res = await fetch('/api/party-budget/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) {
        const message =
          typeof json?.error === 'string'
            ? json.error
            : res.status === 400
              ? 'Há campos inválidos no formulário. Corrija e tente novamente.'
              : 'Erro ao processar sua reserva. Tente novamente.'
        throw new ApiError(res.status, json.error, message)
      }
      return json as { partyId: number }
    },
    onSuccess: (data) => {
      setCreatedPartyId(data.partyId)
      setStep(4)
    },
    onError: (err) => {
      setIsDateConflict(false)
      if (err instanceof ApiError) {
        if (err.status === 400 && err.body && typeof err.body === 'object') {
          const flattened = err.body as ZodFlattenedError
          Object.entries(flattened.fieldErrors ?? {}).forEach(([field, messages]) => {
            if (messages?.length) {
              setError(field as keyof PartyBudgetReservationInput, { message: messages[0] })
            }
          })
          setSubmitError('Há campos inválidos no formulário. Corrija e tente novamente.')
        } else if (err.status === 409) {
          setIsDateConflict(true)
          setSubmitError('Essa data/horário já está reservado. Volte à etapa 1 e escolha outra data.')
        } else {
          setSubmitError(err.message)
        }
      } else {
        setSubmitError('Erro ao processar sua reserva. Tente novamente.')
      }
    },
  })

  async function goToStep2() {
    const valid = await trigger([
      'name',
      'cpf',
      'email',
      'phone',
      'date',
      'childrenCount',
      'adultsCount',
      'totalParticipants',
    ])
    if (valid && availabilityQuery.data?.available !== false) setStep(2)
  }

  async function goToStep3() {
    const valid = await trigger(['paymentOption'])
    if (valid) setStep(3)
  }

  function selectPaymentOption(option: PartyPaymentOption) {
    setValue('paymentOption', option, { shouldValidate: true })
    if (option === 'salon_and_passports' && paymentOption !== 'salon_and_passports') {
      setValue('passportSingleCount', Math.max(0, childrenCount - PASSPORT_PACKAGE_SIZE))
    }
  }

  const onSubmit = (data: PartyBudgetReservationInput) => {
    setSubmitError(null)
    setIsDateConflict(false)
    mutation.mutate(data)
  }

  const minDateTimeLocal = dateToLocalInputValue(new Date())
  const isDateUnavailable = availabilityQuery.data?.available === false

  const salonTotal = quoteQuery.data?.salonPrice ?? 0
  const passportsTotal =
    (quoteQuery.data?.passportPackagePrice ?? 0) +
    passportSingleCount * (quoteQuery.data?.passportSinglePrice ?? 0)
  const optionBTotal = salonTotal + passportsTotal

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-max">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <span className="bg-brand-pink/10 text-brand-pink font-body mb-3 inline-block rounded-full px-4 py-1.5 text-sm font-semibold">
              Orçamento de Festa
            </span>
            <h1 className="font-heading mb-4 text-4xl font-bold text-gray-800 md:text-5xl">
              Reserve sua festa
            </h1>
            <p className="font-body mx-auto max-w-xl text-lg text-gray-500">
              {step === 4
                ? 'Sua solicitação foi enviada.'
                : 'Preencha os dados abaixo para verificar disponibilidade e enviar sua solicitação de reserva.'}
            </p>
          </div>

          {step !== 4 && (
            <div className="mb-8 flex items-center justify-center gap-3">
              {STEP_LABELS.map((label, idx) => {
                const stepNumber = (idx + 1) as 1 | 2 | 3
                const isActive = stepNumber === step
                const isDone = stepNumber < step
                return (
                  <div key={label} className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                        isActive
                          ? 'bg-brand-pink text-white'
                          : isDone
                            ? 'bg-brand-lime text-white'
                            : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {stepNumber}
                    </div>
                    <span
                      className={`font-body hidden text-sm font-medium sm:block ${
                        isActive ? 'text-gray-800' : 'text-gray-400'
                      }`}
                    >
                      {label}
                    </span>
                    {idx < STEP_LABELS.length - 1 && <div className="h-px w-8 bg-gray-300 sm:w-12" />}
                  </div>
                )
              })}
            </div>
          )}

          {step === 4 ? (
            <div className="flex flex-col items-center rounded-2xl bg-white p-8 text-center shadow-sm md:p-12">
              <div className="bg-brand-lime/10 mb-6 flex h-16 w-16 items-center justify-center rounded-full">
                <CheckCircle2 size={32} className="text-brand-lime" />
              </div>
              <h2 className="font-heading mb-4 text-2xl font-bold text-gray-800 md:text-3xl">
                Reserva recebida!
              </h2>
              <p className="font-body max-w-md text-gray-600">
                Recebemos sua solicitação{createdPartyId ? ` #${createdPartyId}` : ''}. Nossa equipe
                entrará em contato pelo WhatsApp em breve para confirmar os detalhes, formalizar o
                contrato e combinar o pagamento.
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
                <MessageCircle size={16} className="text-brand-lime" />
                <span>Fique de olho no seu WhatsApp.</span>
              </div>
              <Link
                href="/"
                className="bg-brand-pink font-body mt-8 rounded-full px-8 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
              >
                Voltar para a home
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-5"
                >
                  <div>
                    <Label htmlFor="name" className="font-body mb-1.5">
                      Nome completo *
                    </Label>
                    <Input
                      id="name"
                      className="rounded-xl py-5"
                      placeholder="Seu nome completo"
                      {...register('name')}
                    />
                    {errors.name && (
                      <p className="font-body mt-1 text-xs text-red-500">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="cpf" className="font-body mb-1.5">
                        CPF *
                      </Label>
                      <Controller
                        name="cpf"
                        control={control}
                        render={({ field }) => (
                          <Input
                            id="cpf"
                            className="rounded-xl py-5"
                            placeholder="000.000.000-00"
                            maxLength={14}
                            value={formatCPF(field.value ?? '')}
                            onChange={(e) => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 11))}
                            onBlur={field.onBlur}
                          />
                        )}
                      />
                      {errors.cpf && (
                        <p className="font-body mt-1 text-xs text-red-500">{errors.cpf.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone" className="font-body mb-1.5">
                        Telefone *
                      </Label>
                      <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                          <Input
                            id="phone"
                            className="rounded-xl py-5"
                            placeholder="(11) 99999-9999"
                            maxLength={15}
                            value={formatPhone(field.value ?? '')}
                            onChange={(e) => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 11))}
                            onBlur={field.onBlur}
                          />
                        )}
                      />
                      {errors.phone && (
                        <p className="font-body mt-1 text-xs text-red-500">{errors.phone.message}</p>
                      )}
                      <p className="font-body mt-1 text-xs text-gray-400">
                        Usaremos para falar com você pelo WhatsApp.
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="font-body mb-1.5">
                      E-mail
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      className="rounded-xl py-5"
                      placeholder="email@exemplo.com"
                      {...register('email')}
                    />
                    {errors.email && (
                      <p className="font-body mt-1 text-xs text-red-500">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="date" className="font-body mb-1.5">
                      <Calendar size={16} className="text-brand-cyan" />
                      Data e hora desejada *
                    </Label>
                    <Controller
                      name="date"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="date"
                          type="datetime-local"
                          className="rounded-xl py-5"
                          min={minDateTimeLocal}
                          value={isoToLocalInputValue(field.value ?? '')}
                          onChange={(e) => {
                            const localValue = e.target.value
                            field.onChange(localValue ? new Date(localValue).toISOString() : '')
                          }}
                          onBlur={field.onBlur}
                        />
                      )}
                    />
                    {errors.date && (
                      <p className="font-body mt-1 text-xs text-red-500">{errors.date.message}</p>
                    )}
                    {availabilityQuery.isFetching && (
                      <p className="font-body mt-1.5 flex items-center gap-1.5 text-xs text-gray-400">
                        <Loader2 size={12} className="animate-spin" />
                        Verificando disponibilidade...
                      </p>
                    )}
                    {!availabilityQuery.isFetching && isDateUnavailable && (
                      <div className="font-body mt-2 flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-600">
                        <AlertCircle size={14} className="mt-0.5 shrink-0" />
                        <span>Essa data/horário já está reservado. Escolha outra data ou horário.</span>
                      </div>
                    )}
                    {!availabilityQuery.isFetching &&
                      availabilityQuery.data?.available === true && (
                        <p className="font-body mt-1.5 flex items-center gap-1.5 text-xs text-brand-lime">
                          <CheckCircle2 size={12} />
                          Data disponível
                        </p>
                      )}
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="childrenCount" className="font-body mb-1.5">
                        <Baby size={16} className="text-brand-purple" />
                        Quantidade de crianças *
                      </Label>
                      <Controller
                        name="childrenCount"
                        control={control}
                        render={({ field }) => (
                          <Input
                            id="childrenCount"
                            type="number"
                            min={0}
                            className="rounded-xl py-5"
                            value={field.value ?? 0}
                            onChange={(e) => {
                              const val = Math.max(0, Math.floor(Number(e.target.value) || 0))
                              field.onChange(val)
                              setValue('totalParticipants', val + (getValues('adultsCount') ?? 0))
                            }}
                            onBlur={field.onBlur}
                          />
                        )}
                      />
                    </div>

                    <div>
                      <Label htmlFor="adultsCount" className="font-body mb-1.5">
                        <Users size={16} className="text-brand-purple" />
                        Quantidade de adultos *
                      </Label>
                      <Controller
                        name="adultsCount"
                        control={control}
                        render={({ field }) => (
                          <Input
                            id="adultsCount"
                            type="number"
                            min={0}
                            className="rounded-xl py-5"
                            value={field.value ?? 0}
                            onChange={(e) => {
                              const val = Math.max(0, Math.floor(Number(e.target.value) || 0))
                              field.onChange(val)
                              setValue('totalParticipants', val + (getValues('childrenCount') ?? 0))
                            }}
                            onBlur={field.onBlur}
                          />
                        )}
                      />
                    </div>
                  </div>

                  <div
                    className={`font-body rounded-xl border px-4 py-3 text-sm ${
                      total > 50
                        ? 'border-red-300 bg-red-50 text-red-600'
                        : 'border-gray-200 bg-gray-50 text-gray-600'
                    }`}
                  >
                    <p className="font-semibold">
                      Total: {total} / 50 participantes
                    </p>
                    <p className="mt-0.5 text-xs">
                      Máximo de 50 participantes no total. Crianças, aniversariante e adultos entram no
                      limite.
                    </p>
                    {errors.totalParticipants && (
                      <p className="mt-1 text-xs font-semibold text-red-600">
                        {errors.totalParticipants.message}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="button"
                      onClick={goToStep2}
                      disabled={isDateUnavailable}
                      className="bg-brand-pink hover:bg-brand-pink/90 rounded-full px-6 py-5 text-white"
                    >
                      Avançar
                      <ArrowRight size={16} />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-5"
                >
                  {quoteQuery.isLoading && (
                    <div className="flex flex-col items-center gap-3 py-10 text-gray-500">
                      <Loader2 size={28} className="animate-spin" />
                      <p className="font-body text-sm">Calculando orçamento...</p>
                    </div>
                  )}

                  {!quoteQuery.isLoading && quoteQuery.isError && (
                    <div className="font-body flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600">
                      <AlertCircle size={18} className="mt-0.5 shrink-0" />
                      <p>
                        {quoteQuery.error instanceof Error
                          ? quoteQuery.error.message
                          : 'Erro ao calcular orçamento'}
                      </p>
                    </div>
                  )}

                  {!quoteQuery.isLoading && !quoteQuery.isError && quoteQuery.data?.available === false && (
                    <div className="font-body flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600">
                      <AlertCircle size={18} className="mt-0.5 shrink-0" />
                      <p>Essa data/horário já está reservado. Volte e escolha outra data.</p>
                    </div>
                  )}

                  {!quoteQuery.isLoading && !quoteQuery.isError && quoteQuery.data?.available !== false && (
                    <>
                      <p className="font-body text-sm text-gray-500">
                        Escolha a forma de pagamento para a sua reserva:
                      </p>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => selectPaymentOption('salon_only')}
                          className={`w-full rounded-2xl border p-5 text-left transition-colors ${
                            paymentOption === 'salon_only'
                              ? 'border-brand-pink bg-brand-pink/5 ring-brand-pink/30 ring-2'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="mb-3 flex items-center gap-2">
                            <PartyPopper size={18} className="text-brand-pink" />
                            <h3 className="font-heading text-sm font-bold text-gray-800">
                              Opção A — Somente salão
                            </h3>
                          </div>
                          <p className="font-body mb-3 text-xs leading-relaxed text-gray-500">
                            Nenhum valor pago agora. No mínimo 10 passaportes deverão ser pagos no dia
                            do evento (à vista, PIX ou cartão, conforme disponibilidade).
                          </p>
                          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                            <span className="font-heading text-sm font-bold text-gray-800">
                              Salão (3 horas)
                            </span>
                            <span className="font-heading text-brand-pink text-lg font-bold">
                              {currency(salonTotal)}
                            </span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => selectPaymentOption('salon_and_passports')}
                          className={`w-full rounded-2xl border p-5 text-left transition-colors ${
                            paymentOption === 'salon_and_passports'
                              ? 'border-brand-pink bg-brand-pink/5 ring-brand-pink/30 ring-2'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="mb-3 flex items-center gap-2">
                            <PartyPopper size={18} className="text-brand-pink" />
                            <h3 className="font-heading text-sm font-bold text-gray-800">
                              Opção B — Salão + adiantamento de passaportes
                            </h3>
                          </div>
                          <p className="font-body mb-3 text-xs leading-relaxed text-gray-500">
                            Inclui o salão + um pacote de 10 passaportes. Ajuste abaixo se esperar mais
                            crianças.
                          </p>

                          {paymentOption === 'salon_and_passports' && (
                            <div
                              className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="font-body text-xs text-gray-600">
                                Passaportes avulsos extras
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setValue('passportSingleCount', Math.max(0, passportSingleCount - 1))
                                  }
                                  className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
                                  aria-label="Diminuir"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="font-heading w-6 text-center text-sm font-bold text-gray-800">
                                  {passportSingleCount}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setValue('passportSingleCount', passportSingleCount + 1)}
                                  className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
                                  aria-label="Aumentar"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                            </div>
                          )}

                          <ul className="space-y-1.5 border-t border-gray-100 pt-3">
                            <li className="font-body flex items-center justify-between text-xs text-gray-600">
                              <span>Salão (3 horas)</span>
                              <span className="font-semibold text-gray-800">{currency(salonTotal)}</span>
                            </li>
                            <li className="font-body flex items-center justify-between text-xs text-gray-600">
                              <span>1x pacote de 10 passaportes</span>
                              <span className="font-semibold text-gray-800">
                                {currency(quoteQuery.data?.passportPackagePrice ?? 0)}
                              </span>
                            </li>
                            {passportSingleCount > 0 && (
                              <li className="font-body flex items-center justify-between text-xs text-gray-600">
                                <span>{passportSingleCount}x passaporte avulso adicional</span>
                                <span className="font-semibold text-gray-800">
                                  {currency(passportSingleCount * (quoteQuery.data?.passportSinglePrice ?? 0))}
                                </span>
                              </li>
                            )}
                          </ul>
                          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                            <span className="font-heading text-sm font-bold text-gray-800">Total</span>
                            <span className="font-heading text-brand-pink text-lg font-bold">
                              {currency(optionBTotal)}
                            </span>
                          </div>

                          <div className="mt-3 space-y-1.5 border-t border-gray-100 pt-3 text-xs text-amber-600">
                            <p>
                              <strong>Sem reembolso:</strong> se comparecerem menos crianças do que o
                              reservado, os passaportes não utilizados não serão reembolsados.
                            </p>
                            <p>
                              <strong>Passaportes extras:</strong> se comparecerem mais crianças, os
                              adicionais podem ser pagos avulsos no dia, conforme disponibilidade.
                            </p>
                          </div>
                        </button>
                      </div>
                      {errors.paymentOption && (
                        <p className="font-body text-xs text-red-500">{errors.paymentOption.message}</p>
                      )}
                    </>
                  )}

                  <div className="flex justify-between pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="rounded-full px-6 py-5"
                    >
                      <ArrowLeft size={16} />
                      Voltar
                    </Button>
                    {!quoteQuery.isLoading && !quoteQuery.isError && quoteQuery.data?.available !== false && (
                      <Button
                        type="button"
                        onClick={goToStep3}
                        disabled={!paymentOption}
                        className="bg-brand-pink hover:bg-brand-pink/90 rounded-full px-6 py-5 text-white"
                      >
                        Avançar
                        <ArrowRight size={16} />
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-5"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <ScrollText size={18} className="text-brand-cyan" />
                    <h3 className="font-heading text-base font-bold text-gray-800">
                      Termo e Condições da Reserva/Festa
                    </h3>
                  </div>

                  <div className="font-body max-h-72 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm whitespace-pre-line text-gray-600">
                    {TERMS_TEXT}
                  </div>

                  <Controller
                    name="termsAccepted"
                    control={control}
                    render={({ field }) => (
                      <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-gray-200 bg-white px-4 py-3">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => field.onChange(checked === true)}
                        />
                        <span className="font-body text-sm text-gray-700">
                          Li e aceito os Termos e Condições da Reserva/Festa.
                        </span>
                      </label>
                    )}
                  />
                  {errors.termsAccepted && (
                    <p className="font-body text-xs text-red-500">{errors.termsAccepted.message}</p>
                  )}

                  {submitError && (
                    <div className="font-body flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600">
                      <AlertCircle size={18} className="mt-0.5 shrink-0" />
                      <div className="flex flex-col gap-2">
                        <p>{submitError}</p>
                        {isDateConflict && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSubmitError(null)
                              setIsDateConflict(false)
                              setStep(1)
                            }}
                            className="w-fit rounded-full"
                          >
                            Escolher outra data
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(2)}
                      disabled={mutation.isPending}
                      className="rounded-full px-6 py-5"
                    >
                      <ArrowLeft size={16} />
                      Voltar
                    </Button>
                    <Button
                      type="submit"
                      disabled={!termsAccepted || mutation.isPending}
                      className="bg-brand-pink hover:bg-brand-pink/90 rounded-full px-6 py-5 text-white"
                    >
                      {mutation.isPending ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Enviando reserva...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={16} />
                          Enviar reserva
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
