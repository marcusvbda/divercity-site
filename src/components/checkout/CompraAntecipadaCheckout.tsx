'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Baby,
  CalendarDays,
  CreditCard,
  Loader2,
  Lock,
  Plus,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTicketCart } from './useTicketCart'
import ChildEntryCard from './ChildEntryCard'
import ExtraCompanionCard from './ExtraCompanionCard'
import GuardianFields from './GuardianFields'
import CartSummaryPanel from './CartSummaryPanel'
import { currency } from './utils'
import type { VisitDayType } from './types'

const STEP_LABELS = ['Crianças', 'Acompanhantes e dados', 'Revisão e pagamento']

const ICON_MAP: Record<string, React.ElementType> = {
  Ticket: ShieldCheck,
  Lock,
  QrCode: ShieldCheck,
  Clock: ShieldCheck,
}

type FeatureItem = { id: number; value: { label?: string | null; iconName?: string | null; color?: string | null } }

export default function CompraAntecipadaCheckout({
  advancePurchaseSection,
}: {
  advancePurchaseSection?: any
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [stepError, setStepError] = useState<string | null>(null)

  const cart = useTicketCart()
  const {
    form,
    childrenArray,
    passportTypes,
    passportTypesQuery,
    quoteMutation,
    checkoutMutation,
    visitDayType,
    watchedChildren,
    addChild,
    removeChildAt,
    setChildCompanion,
    setChildHasCompanion,
    addExtraCompanion,
    removeExtraCompanionAt,
    extraCompanionEntries,
    childCompanionFor,
    eligibleChildrenWithoutDecision,
    childrenNeedingTerms,
    submitCheckout,
  } = cart

  const { control, formState, trigger, setValue } = form
  const { errors } = formState

  const title = advancePurchaseSection?.Section?.title?.value ?? 'Compre antecipadamente'
  const subtitle =
    advancePurchaseSection?.Section?.subtitle?.value ?? 'Evite filas e garanta sua diversão!'
  const features: FeatureItem[] = advancePurchaseSection?.Content?.features ?? []
  const disclaimer = advancePurchaseSection?.Content?.disclaimer?.value ?? ''

  async function goToStep2() {
    setStepError(null)
    const valid = await trigger(['children'])
    if (!valid) {
      setStepError('Confira os dados das crianças antes de continuar.')
      return
    }
    if (eligibleChildrenWithoutDecision.length > 0) {
      setStepError('Informe se cada criança de até 4 anos ficará com ou sem acompanhante.')
      return
    }
    if (childrenNeedingTerms.length > 0) {
      setStepError('Aceite o Termo de Responsabilidade para as crianças que ficarão sem acompanhante.')
      return
    }
    setStep(2)
  }

  async function goToStep3() {
    setStepError(null)
    const companionsValid = await trigger(['companions'])
    const guardianValid = await trigger(['guardianName', 'guardianEmail', 'guardianPhone', 'guardianWhatsapp'])
    if (!companionsValid) {
      setStepError('Confira os dados dos acompanhantes adicionais.')
      return
    }
    if (!guardianValid) {
      setStepError('Confira os dados do responsável pela compra.')
      return
    }
    setStep(3)
  }

  function handleFinalSubmit() {
    setStepError(null)
    if (!quoteMutation.data) {
      setStepError('Aguarde o cálculo do valor antes de finalizar a compra.')
      return
    }
    submitCheckout()
  }

  const isFirstChildBlockLoading = passportTypesQuery.isLoading

  return (
    <div className="bg-gray-50">
      <div className="container-max px-4 py-8 md:py-12">
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <span className="bg-brand-pink/10 text-brand-pink font-body mb-3 inline-block rounded-full px-4 py-1.5 text-sm font-semibold">
            Compra antecipada
          </span>
          <h1 className="font-heading mb-2 text-3xl font-bold text-gray-800 md:text-4xl">{title}</h1>
          <p className="font-body text-lg text-gray-500">{subtitle}</p>

          {features.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              {features.map((item) => {
                const Icon = ICON_MAP[item.value.iconName ?? ''] ?? Star
                const color = item.value.color ?? '#12C7C8'
                return (
                  <span
                    key={item.id}
                    className="font-body inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm"
                  >
                    <Icon size={14} style={{ color }} />
                    {item.value.label}
                  </span>
                )
              })}
            </div>
          )}
        </div>

        <div className="mb-8 flex items-center justify-center gap-3">
          {STEP_LABELS.map((label, idx) => {
            const stepNumber = (idx + 1) as 1 | 2 | 3
            const isActive = stepNumber === step
            const isDone = stepNumber < step
            return (
              <div key={label} className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
                    isActive ? 'bg-brand-pink text-white' : isDone ? 'bg-brand-lime text-white' : 'bg-gray-200 text-gray-500'
                  )}
                >
                  {stepNumber}
                </div>
                <span className={cn('font-body hidden text-sm font-medium sm:block', isActive ? 'text-gray-800' : 'text-gray-400')}>
                  {label}
                </span>
                {idx < STEP_LABELS.length - 1 && <div className="h-px w-8 bg-gray-300 sm:w-12" />}
              </div>
            )
          })}
        </div>

        <div className="mx-auto flex max-w-5xl flex-col gap-6 lg:flex-row lg:items-start">
          <form className="flex-1 rounded-2xl bg-white p-5 shadow-sm md:p-8" onSubmit={(e) => e.preventDefault()}>
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-5"
              >
                <div>
                  <label className="font-body mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                    <CalendarDays size={16} className="text-brand-cyan" />
                    Dia da visita *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { value: 'weekday', label: 'Dia de semana' },
                        { value: 'weekend', label: 'Fim de semana / feriado' },
                      ] as { value: VisitDayType; label: string }[]
                    ).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setValue('visitDayType', opt.value, { shouldValidate: true })}
                        className={cn(
                          'font-body min-h-11 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors',
                          visitDayType === opt.value
                            ? 'border-brand-pink bg-brand-pink text-white'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="font-body flex items-center gap-1.5 text-sm font-medium text-gray-700">
                    <Baby size={16} className="text-brand-purple" />
                    Crianças
                  </label>
                  <span className="font-body text-xs text-gray-400">{childrenArray.fields.length} criança(s)</span>
                </div>

                {isFirstChildBlockLoading && (
                  <div className="flex items-center gap-2 py-6 text-gray-500">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="font-body text-sm">Carregando tipos de passaporte...</span>
                  </div>
                )}

                {passportTypesQuery.isError && (
                  <div className="font-body flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 px-3 py-2.5 text-sm text-red-600">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    <span>Não foi possível carregar os tipos de passaporte. Recarregue a página.</span>
                  </div>
                )}

                {!isFirstChildBlockLoading &&
                  !passportTypesQuery.isError &&
                  childrenArray.fields.map((field, index) => (
                    <ChildEntryCard
                      key={field.id}
                      index={index}
                      control={control}
                      errors={errors}
                      passportTypes={passportTypes}
                      visitDayType={visitDayType ?? 'weekday'}
                      companion={childCompanionFor(index)}
                      onCompanionChange={(data) => setChildCompanion(index, data)}
                      onHasCompanionChange={(value) => setChildHasCompanion(index, value)}
                      onRemove={() => removeChildAt(index)}
                      canRemove={childrenArray.fields.length > 1}
                    />
                  ))}

                <button
                  type="button"
                  onClick={addChild}
                  className="font-body flex min-h-11 items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 py-3 text-sm font-medium text-gray-500 transition-colors hover:border-brand-pink hover:text-brand-pink"
                >
                  <Plus size={16} />
                  Adicionar outra criança
                </button>

                {stepError && (
                  <div className="font-body flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 px-3 py-2.5 text-sm text-red-600">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    <span>{stepError}</span>
                  </div>
                )}

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
                <div className="flex items-center justify-between">
                  <label className="font-body flex items-center gap-1.5 text-sm font-medium text-gray-700">
                    <Users size={16} className="text-brand-cyan" />
                    Acompanhantes adicionais (opcional)
                  </label>
                </div>
                <p className="font-body -mt-3 text-xs text-gray-400">
                  Ingressos pagos para adultos ou outras pessoas que não terão direito aos brinquedos —
                  apenas entrada no parque.
                </p>

                {extraCompanionEntries.map((entry, displayIdx) => (
                  <ExtraCompanionCard
                    key={`extra-companion-${entry.index}`}
                    index={entry.index}
                    displayNumber={displayIdx + 1}
                    control={control}
                    errors={errors}
                    passportTypes={passportTypes}
                    visitDayType={visitDayType ?? 'weekday'}
                    onRemove={() => removeExtraCompanionAt(entry.index)}
                  />
                ))}

                <button
                  type="button"
                  onClick={addExtraCompanion}
                  className="font-body flex min-h-11 items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 py-3 text-sm font-medium text-gray-500 transition-colors hover:border-brand-cyan hover:text-brand-cyan"
                >
                  <Plus size={16} />
                  Adicionar acompanhante pago
                </button>

                <GuardianFields control={control} errors={errors} />

                {stepError && (
                  <div className="font-body flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 px-3 py-2.5 text-sm text-red-600">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    <span>{stepError}</span>
                  </div>
                )}

                <div className="flex justify-between pt-2">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="rounded-full px-6 py-5">
                    <ArrowLeft size={16} />
                    Voltar
                  </Button>
                  <Button
                    type="button"
                    onClick={goToStep3}
                    className="bg-brand-pink hover:bg-brand-pink/90 rounded-full px-6 py-5 text-white"
                  >
                    Avançar
                    <ArrowRight size={16} />
                  </Button>
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
                <h3 className="font-heading text-base font-bold text-gray-800">Revise sua compra</h3>

                <div className="font-body flex flex-col gap-2 rounded-xl bg-brand-yellow/10 p-4 text-xs text-gray-600">
                  <div className="flex items-start gap-2">
                    <ShieldCheck size={16} className="mt-0.5 shrink-0 text-brand-purple" />
                    <p>
                      <strong>Documento com foto:</strong> apresente um documento com foto da criança na
                      entrada do parque para utilizar o passaporte.
                    </p>
                  </div>
                  {watchedChildren.some((c) => c?.hasCompanion === true) && (
                    <div className="flex items-start gap-2">
                      <Users size={16} className="mt-0.5 shrink-0 text-brand-cyan" />
                      <p>O acompanhante gratuito precisará comprovar que possui mais de 18 anos.</p>
                    </div>
                  )}
                  {watchedChildren.some((c) => c?.hasCompanion === false) && (
                    <div className="flex items-start gap-2">
                      <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-600" />
                      <p>
                        Há criança(s) que entrarão sem acompanhante — o Termo de Responsabilidade foi
                        aceito.
                      </p>
                    </div>
                  )}
                </div>

                <div className="lg:hidden">
                  <CartSummaryPanel quoteMutation={quoteMutation} />
                </div>

                {disclaimer && <p className="font-body text-xs text-gray-400">{disclaimer}</p>}

                {(stepError || checkoutMutation.isError) && (
                  <div className="font-body flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 px-3 py-2.5 text-sm text-red-600">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    <span>
                      {stepError ??
                        (checkoutMutation.error instanceof Error
                          ? checkoutMutation.error.message
                          : 'Erro ao processar a compra.')}
                    </span>
                  </div>
                )}

                <div className="flex justify-between pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(2)}
                    disabled={checkoutMutation.isPending}
                    className="rounded-full px-6 py-5"
                  >
                    <ArrowLeft size={16} />
                    Voltar
                  </Button>
                  <Button
                    type="button"
                    onClick={handleFinalSubmit}
                    disabled={checkoutMutation.isPending || quoteMutation.isPending || !quoteMutation.data}
                    className="bg-brand-pink hover:bg-brand-pink/90 rounded-full px-6 py-5 text-white"
                  >
                    {checkoutMutation.isPending ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Redirecionando...
                      </>
                    ) : (
                      <>
                        <CreditCard size={16} />
                        Pagar {quoteMutation.data ? currency(quoteMutation.data.total) : ''}
                      </>
                    )}
                  </Button>
                </div>

                <p className="font-body flex items-center justify-center gap-1.5 text-center text-xs text-gray-400">
                  <Lock size={12} />
                  Pagamento seguro via Stripe — cartão de crédito ou PIX.
                </p>
              </motion.div>
            )}
          </form>

          <aside className="hidden w-full max-w-sm lg:sticky lg:top-24 lg:block">
            <CartSummaryPanel quoteMutation={quoteMutation} />
          </aside>
        </div>
      </div>
    </div>
  )
}
