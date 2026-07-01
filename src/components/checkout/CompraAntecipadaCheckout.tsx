'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Clock,
  Info,
  Lock,
  Minus,
  Plus,
  ShieldCheck,
  Star,
  Ticket,
  Users,
} from 'lucide-react'

const STEPS = ['Escolher data e hora', 'Seus dados', 'Pagamento', 'Confirmação']

const WEEKDAYS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB']

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const PRICE_TIERS = [
  { label: 'Segunda a Quinta', price: 45, color: '#12C7C8' },
  { label: 'Sexta', price: 60, color: '#8E4CCF' },
  { label: 'Sábado', price: 65, color: '#FFD23F' },
  { label: 'Domingo e Feriados', price: 70, color: '#FF4F8A' },
]

function priceForWeekday(weekday: number) {
  if (weekday === 0) return PRICE_TIERS[3]
  if (weekday === 6) return PRICE_TIERS[2]
  if (weekday === 5) return PRICE_TIERS[1]
  return PRICE_TIERS[0]
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function buildMonthGrid(monthDate: Date) {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const startOffset = firstDay.getDay()
  const gridStart = new Date(year, month, 1 - startOffset)

  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(gridStart)
    date.setDate(gridStart.getDate() + i)
    return date
  })
}

const TIME_SLOTS: { time: string; status: 'disponivel' | 'poucas' | 'indisponivel' }[] = [
  { time: '10:00', status: 'disponivel' },
  { time: '11:00', status: 'disponivel' },
  { time: '12:00', status: 'poucas' },
  { time: '13:00', status: 'disponivel' },
  { time: '14:00', status: 'disponivel' },
  { time: '15:00', status: 'disponivel' },
  { time: '16:00', status: 'disponivel' },
  { time: '17:00', status: 'poucas' },
  { time: '18:00', status: 'disponivel' },
  { time: '19:00', status: 'indisponivel' },
]

const STATUS_LABEL: Record<string, string> = {
  disponivel: 'Disponível',
  poucas: 'Poucas vagas',
  indisponivel: 'Indisponível',
}

const STATUS_COLOR: Record<string, string> = {
  disponivel: 'text-brand-cyan',
  poucas: 'text-brand-yellow',
  indisponivel: 'text-gray-400',
}

const currency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function CompraAntecipadaCheckout() {
  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  )
  const [selectedDate, setSelectedDate] = useState<Date | null>(today)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [children, setChildren] = useState(2)
  const [adults, setAdults] = useState(1)

  const monthGrid = useMemo(() => buildMonthGrid(visibleMonth), [visibleMonth])

  const tier = selectedDate ? priceForWeekday(selectedDate.getDay()) : null
  const childrenTotal = tier ? tier.price * children : 0
  const total = childrenTotal

  const goToMonth = (delta: number) => {
    setVisibleMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1))
  }

  const canContinue = Boolean(selectedDate && selectedTime)

  return (
    <div className="bg-gray-50">
      <div className="container-max px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 rounded-2xl bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-heading flex items-center gap-2 text-2xl font-bold text-gray-800 md:text-3xl">
              <Ticket className="text-brand-pink" size={26} />
              Comprar Ingresso
            </h1>
            <p className="font-body mt-1 text-sm text-gray-500">
              Garanta sua diversão antecipadamente!
            </p>
          </div>
          <div className="flex items-center gap-2 self-start rounded-full bg-brand-cyan/10 px-4 py-2 text-sm font-medium text-brand-cyan md:self-auto">
            <Lock size={14} />
            Ambiente 100% seguro
          </div>
        </div>

        {/* Stepper */}
        <div className="mb-8 overflow-x-auto rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex min-w-max items-center justify-center gap-2 md:min-w-0 md:justify-between">
            {STEPS.map((step, i) => (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center gap-2 md:flex-row md:gap-3">
                  <div
                    className={
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-body text-sm font-bold ' +
                      (i === 0
                        ? 'bg-brand-purple text-white'
                        : 'bg-gray-100 text-gray-400')
                    }
                  >
                    {i + 1}
                  </div>
                  <span
                    className={
                      'font-body text-xs font-medium whitespace-nowrap md:text-sm ' +
                      (i === 0 ? 'text-gray-800' : 'text-gray-400')
                    }
                  >
                    {step}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="mx-3 h-px w-8 bg-gray-200 md:w-16" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
          {/* Left column */}
          <div className="flex flex-col gap-6">
            {/* Calendar */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Calendar className="text-brand-purple" size={20} />
                <h2 className="font-heading text-lg font-bold text-gray-800">
                  1. Escolha a data
                </h2>
              </div>
              <p className="font-body mb-4 text-sm text-gray-500">
                Selecione o dia da sua visita.
              </p>

              <div className="mb-4 flex items-center justify-between">
                <button
                  onClick={() => goToMonth(-1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                  aria-label="Mês anterior"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="font-body text-sm font-semibold text-gray-700">
                  {MONTH_NAMES[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
                </span>
                <button
                  onClick={() => goToMonth(1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                  aria-label="Próximo mês"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {WEEKDAYS.map((wd) => (
                  <span key={wd} className="font-body py-1 text-[11px] font-semibold text-gray-400">
                    {wd}
                  </span>
                ))}
                {monthGrid.map((date) => {
                  const inMonth = date.getMonth() === visibleMonth.getMonth()
                  const isPast = date < today
                  const disabled = !inMonth || isPast
                  const dayTier = priceForWeekday(date.getDay())
                  const selected = selectedDate && isSameDay(date, selectedDate)

                  return (
                    <button
                      key={date.toISOString()}
                      disabled={disabled}
                      onClick={() => setSelectedDate(date)}
                      className={
                        'flex flex-col items-center gap-0.5 rounded-xl py-2 transition-colors ' +
                        (selected
                          ? 'bg-brand-purple text-white'
                          : disabled
                            ? 'cursor-not-allowed text-gray-300'
                            : 'text-gray-700 hover:bg-gray-100')
                      }
                    >
                      <span className="font-body text-sm font-medium">{date.getDate()}</span>
                      {!disabled && (
                        <span
                          className="font-body text-[10px] font-semibold"
                          style={{ color: selected ? '#fff' : dayTier.color }}
                        >
                          R${dayTier.price}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-gray-100 pt-4">
                {PRICE_TIERS.map((t) => (
                  <span key={t.label} className="font-body flex items-center gap-1.5 text-xs text-gray-500">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: t.color }}
                    />
                    R${t.price} {t.label}
                  </span>
                ))}
                <span className="font-body flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="h-2 w-2 rounded-full bg-gray-300" />
                  Indisponível
                </span>
              </div>
            </div>

            {/* Time slots */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Clock className="text-brand-purple" size={20} />
                <h2 className="font-heading text-lg font-bold text-gray-800">
                  2. Escolha o horário
                </h2>
              </div>
              <p className="font-body mb-4 text-sm text-gray-500">
                Selecione o melhor horário para você.
              </p>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {TIME_SLOTS.map(({ time, status }) => {
                  const selected = selectedTime === time
                  const disabled = status === 'indisponivel'
                  return (
                    <button
                      key={time}
                      disabled={disabled}
                      onClick={() => setSelectedTime(time)}
                      className={
                        'relative flex flex-col items-center gap-1 rounded-xl border px-3 py-3 transition-colors ' +
                        (selected
                          ? 'border-brand-purple bg-brand-purple text-white'
                          : disabled
                            ? 'cursor-not-allowed border-gray-100 text-gray-300'
                            : 'border-gray-200 text-gray-700 hover:border-brand-purple/40')
                      }
                    >
                      <span className="font-body text-sm font-bold">{time}</span>
                      <span
                        className={
                          'font-body text-[11px] font-medium ' +
                          (selected ? 'text-white/90' : STATUS_COLOR[status])
                        }
                      >
                        {selected ? 'Selecionado' : STATUS_LABEL[status]}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-xl bg-brand-purple/5 px-4 py-3">
                <Info size={16} className="shrink-0 text-brand-purple" />
                <span className="font-body text-xs text-gray-600">
                  Chegue com pelo menos 15 minutos de antecedência.
                </span>
              </div>
            </div>

            {/* Quantity */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Users className="text-brand-purple" size={20} />
                <h2 className="font-heading text-lg font-bold text-gray-800">
                  3. Quantidade de ingressos
                </h2>
              </div>
              <p className="font-body mb-4 text-sm text-gray-500">
                Escolha a quantidade de cada tipo de ingresso.
              </p>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-body text-sm font-semibold text-gray-700">
                      Crianças (2 a 12 anos)
                    </p>
                    <p className="font-body text-xs text-gray-400">Todos pagam</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setChildren((v) => Math.max(0, v - 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-100"
                      aria-label="Diminuir crianças"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="font-body w-6 text-center text-sm font-bold text-gray-800">
                      {children}
                    </span>
                    <button
                      onClick={() => setChildren((v) => Math.min(10, v + 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-100"
                      aria-label="Aumentar crianças"
                    >
                      <Plus size={14} />
                    </button>
                    <span className="font-body w-20 text-right text-sm font-semibold text-gray-700">
                      {currency(childrenTotal)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-4">
                  <div>
                    <p className="font-body text-sm font-semibold text-gray-700">
                      Adultos acompanhantes (a partir de 18 anos)
                    </p>
                    <p className="font-body text-xs text-gray-400">Não pagam</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setAdults((v) => Math.max(0, v - 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-100"
                      aria-label="Diminuir adultos"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="font-body w-6 text-center text-sm font-bold text-gray-800">
                      {adults}
                    </span>
                    <button
                      onClick={() => setAdults((v) => Math.min(10, v + 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-100"
                      aria-label="Aumentar adultos"
                    >
                      <Plus size={14} />
                    </button>
                    <span className="font-body w-20 text-right text-sm font-semibold text-gray-700">
                      {currency(0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-xl bg-brand-yellow/10 px-4 py-3">
                <Info size={16} className="shrink-0 text-brand-yellow" />
                <span className="font-body text-xs text-gray-600">
                  Crianças até 1 ano e 11 meses não pagam. É obrigatória a presença de um adulto responsável.
                </span>
              </div>
            </div>

            {/* Reagendamento banner */}
            <div className="flex flex-col items-start gap-4 overflow-hidden rounded-2xl bg-brand-purple/5 p-6 sm:flex-row sm:items-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-brand-purple">
                <CalendarClock size={22} />
              </div>
              <div className="flex-1">
                <h3 className="font-heading text-sm font-bold text-gray-800">Reagendamento</h3>
                <p className="font-body mt-1 text-xs text-gray-500">
                  Você pode reagendar sua visita de acordo com os termos e condições e sujeito à disponibilidade de nova data e horário.
                </p>
                <button className="font-body mt-3 rounded-full border border-brand-purple/30 px-4 py-1.5 text-xs font-semibold text-brand-purple transition-colors hover:bg-white">
                  Ver termos e condições
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="font-heading mb-4 flex items-center gap-2 text-lg font-bold text-gray-800">
                <Ticket className="text-brand-pink" size={18} />
                Resumo do pedido
              </h2>

              <div className="mb-4 flex items-center gap-3">
                <img
                  src="https://placehold.co/160x160/8E4CCF/fff?text=Divercity"
                  alt="Divercity Park"
                  className="h-14 w-14 shrink-0 rounded-xl object-cover"
                />
                <div>
                  <p className="font-body text-sm font-bold text-gray-800">Divercity Park</p>
                  <p className="font-body text-xs text-gray-400">Diversão para toda a família!</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-gray-100 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar size={15} className="text-gray-400" />
                    <div>
                      <p className="font-body text-xs text-gray-400">Data</p>
                      <p className="font-body text-sm font-semibold text-gray-700">
                        {selectedDate
                          ? selectedDate.toLocaleDateString('pt-BR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })
                          : 'Selecione uma data'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock size={15} className="text-gray-400" />
                    <div>
                      <p className="font-body text-xs text-gray-400">Horário</p>
                      <p className="font-body text-sm font-semibold text-gray-700">
                        {selectedTime ?? 'Selecione um horário'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-gray-100 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-body text-sm text-gray-600">Crianças (2 a 12 anos)</p>
                    <p className="font-body text-xs text-gray-400">
                      {children} x {tier ? currency(tier.price) : '—'}
                    </p>
                  </div>
                  <span className="font-body text-sm font-semibold text-gray-800">
                    {currency(childrenTotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-body text-sm text-gray-600">Adultos acompanhantes</p>
                    <p className="font-body text-xs text-gray-400">{adults} x Grátis</p>
                  </div>
                  <span className="font-body text-sm font-semibold text-gray-800">
                    {currency(0)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="font-heading text-base font-bold text-gray-800">Total</span>
                <span className="font-heading text-xl font-bold text-brand-pink">
                  {currency(total)}
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-brand-yellow/10 p-6">
              <h3 className="font-heading mb-3 flex items-center gap-2 text-sm font-bold text-gray-800">
                <Star size={16} className="text-brand-yellow" />
                Informações importantes
              </h3>
              <ul className="flex flex-col gap-2">
                {[
                  'Ingresso válido apenas para a data e horário selecionados.',
                  'Não fazemos estorno de ingressos.',
                  'A entrada será liberada mediante apresentação do QR Code.',
                  'Consulte nossos termos e condições para mais informações.',
                ].map((info) => (
                  <li key={info} className="font-body flex items-start gap-2 text-xs text-gray-600">
                    <Info size={13} className="mt-0.5 shrink-0 text-brand-yellow" />
                    {info}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-white p-6 shadow-sm">
              <ShieldCheck size={22} className="shrink-0 text-brand-cyan" />
              <div>
                <p className="font-body text-sm font-bold text-gray-800">Ambiente seguro</p>
                <p className="font-body text-xs text-gray-500">
                  Seus dados protegidos com criptografia SSL de ponta a ponta.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer nav */}
        <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm">
          <button className="font-body rounded-full border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50">
            Voltar
          </button>
          <motion.button
            disabled={!canContinue}
            whileHover={canContinue ? { scale: 1.03 } : {}}
            whileTap={canContinue ? { scale: 0.98 } : {}}
            className={
              'font-body flex items-center gap-2 rounded-full px-8 py-3 text-sm font-bold text-white transition-opacity ' +
              (canContinue ? 'bg-brand-pink hover:opacity-90' : 'cursor-not-allowed bg-gray-300')
            }
          >
            Continuar para seus dados
          </motion.button>
        </div>
      </div>
    </div>
  )
}
