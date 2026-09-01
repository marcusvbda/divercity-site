'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueries, useMutation } from '@tanstack/react-query'
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
  total: number
  breakdown: { label: string; value: number }[]
}

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

const PAYMENT_OPTIONS: { value: PartyPaymentOption; title: string; description: string }[] = [
  {
    value: 'salon_only',
    title: 'Opção A — Somente salão',
    description:
      'Pagamento integral do salão no momento da reserva. Passaportes pagos posteriormente no dia do evento (à vista, PIX ou cartão, conforme disponibilidade).',
  },
  {
    value: 'salon_and_passports',
    title: 'Opção B — Salão + passaportes',
    description:
      'Pagamento do salão junto com um pacote de 10 passaportes. Passaportes adicionais seguem as regras do parque.',
  },
]

const TERMS_TEXT = `Antes do pagamento, é necessário estar ciente das regras aplicáveis à reserva.

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
- Opção A (Somente salão): pagamento integral do salão no momento da reserva; passaportes pagos posteriormente no dia do evento (à vista, PIX ou cartão, conforme disponibilidade).
- Opção B (Salão + passaportes): pagamento do salão junto com um pacote de 10 passaportes; passaportes adicionais e ajustes posteriores seguem as regras definidas pelo parque.`

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

const STEP_LABELS = ['Seus dados', 'Orçamento', 'Termos e pagamento']

export default function OrcamentoWizard() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [submitError, setSubmitError] = useState<string | null>(null)

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
      termsAccepted: false,
    } as unknown as PartyBudgetReservationInput,
  })

  const childrenCount = watch('childrenCount') ?? 0
  const adultsCount = watch('adultsCount') ?? 0
  const dateIso = watch('date')
  const paymentOption = watch('paymentOption')
  const termsAccepted = watch('termsAccepted')
  const total = childrenCount + adultsCount

  const quotes = useQueries({
    queries: (['salon_only', 'salon_and_passports'] as const).map((option) => ({
      queryKey: ['party-budget-quote', dateIso, option],
      queryFn: async (): Promise<QuoteResponse> => {
        const params = new URLSearchParams({ date: dateIso, paymentOption: option })
        const res = await fetch(`/api/party-budget/quote?${params.toString()}`)
        const json = await res.json()
        if (!res.ok) {
          throw new Error(json.error ?? 'Erro ao calcular orçamento')
        }
        return json as QuoteResponse
      },
      enabled: step === 2 && Boolean(dateIso),
      retry: false,
    })),
  })

  const [salonOnlyQuote, salonAndPassportsQuote] = quotes
  const isLoadingQuotes = quotes.some((q) => q.isLoading)
  const allQuotesErrored = quotes.every((q) => q.isError)
  const generalQuoteError = allQuotesErrored ? quotes[0].error : null
  const generalQuoteErrorMessage =
    generalQuoteError instanceof Error ? generalQuoteError.message : null
  const isUnavailable = quotes.some((q) => q.data?.available === false)

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
      return json as { partyId: number; checkoutUrl: string }
    },
    onSuccess: (data) => {
      window.location.href = data.checkoutUrl
    },
    onError: (err) => {
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
    if (valid) setStep(2)
  }

  async function goToStep3() {
    const valid = await trigger(['paymentOption'])
    if (valid) setStep(3)
  }

  const onSubmit = (data: PartyBudgetReservationInput) => {
    setSubmitError(null)
    mutation.mutate(data)
  }

  const minDateTimeLocal = dateToLocalInputValue(new Date())

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
              Preencha os dados abaixo para verificar disponibilidade e concluir sua reserva.
            </p>
          </div>

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
                      Telefone
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
                {isLoadingQuotes && (
                  <div className="flex flex-col items-center gap-3 py-10 text-gray-500">
                    <Loader2 size={28} className="animate-spin" />
                    <p className="font-body text-sm">Verificando disponibilidade e calculando orçamento...</p>
                  </div>
                )}

                {!isLoadingQuotes && generalQuoteErrorMessage && (
                  <div className="font-body flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600">
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    <p>{generalQuoteErrorMessage}</p>
                  </div>
                )}

                {!isLoadingQuotes && !generalQuoteErrorMessage && isUnavailable && (
                  <div className="font-body flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600">
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    <p>Essa data/horário já está reservado. Escolha outra data.</p>
                  </div>
                )}

                {!isLoadingQuotes && !generalQuoteErrorMessage && !isUnavailable && (
                  <>
                    <p className="font-body text-sm text-gray-500">
                      Escolha a forma de pagamento para a sua reserva:
                    </p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {PAYMENT_OPTIONS.map((option) => {
                        const query = option.value === 'salon_only' ? salonOnlyQuote : salonAndPassportsQuote
                        const quote = query.data
                        const optionErrorMessage =
                          query.isError && query.error instanceof Error ? query.error.message : null
                        const isSelected = paymentOption === option.value
                        const isDisabled = Boolean(optionErrorMessage)
                        return (
                          <button
                            key={option.value}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => {
                              if (!isDisabled) {
                                setValue('paymentOption', option.value, { shouldValidate: true })
                              }
                            }}
                            className={`w-full rounded-2xl border p-5 text-left transition-colors ${
                              isDisabled
                                ? 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-60'
                                : isSelected
                                  ? 'border-brand-pink bg-brand-pink/5 ring-brand-pink/30 ring-2'
                                  : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <div className="mb-3 flex items-center gap-2">
                              <PartyPopper size={18} className="text-brand-pink" />
                              <h3 className="font-heading text-sm font-bold text-gray-800">
                                {option.title}
                              </h3>
                            </div>
                            <p className="font-body mb-4 text-xs leading-relaxed text-gray-500">
                              {option.description}
                            </p>
                            {optionErrorMessage ? (
                              <div className="font-body flex items-start gap-2 border-t border-gray-100 pt-3 text-xs text-red-500">
                                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                <span>{optionErrorMessage}</span>
                              </div>
                            ) : (
                              quote && (
                                <>
                                  <ul className="space-y-1.5 border-t border-gray-100 pt-3">
                                    {quote.breakdown.map((item, idx) => (
                                      <li
                                        key={idx}
                                        className="font-body flex items-center justify-between text-xs text-gray-600"
                                      >
                                        <span>{item.label}</span>
                                        <span className="font-semibold text-gray-800">
                                          {currency(item.value)}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                  <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                                    <span className="font-heading text-sm font-bold text-gray-800">
                                      Total
                                    </span>
                                    <span className="font-heading text-brand-pink text-lg font-bold">
                                      {currency(quote.total)}
                                    </span>
                                  </div>
                                </>
                              )
                            )}
                          </button>
                        )
                      })}
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
                  {!isLoadingQuotes && !generalQuoteErrorMessage && !isUnavailable && (
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
                      {submitError.includes('já está reservado') && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSubmitError(null)
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
                        Redirecionando para pagamento...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        Confirmar e pagar
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}
