'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Info, Minus, Plus, Star, Ticket, Users } from 'lucide-react'

/**
 * Configuração temporária — hoje são constantes fixas no código.
 * Em breve virão do CMS (incluindo regras diferentes por dia útil/fim de semana),
 * então a estrutura fica isolada aqui para facilitar a troca depois.
 */
const CHECKOUT_CONFIG = {
  minDaysInAdvance: 1,
  dateWindowDays: 14,
  openTime: '10:00',
  closeTime: '22:00',
  timeSlotIntervalMinutes: 60,
  childPrice: 55,
  companionPrice: 15,
  maxChildren: 10,
  maxCompanions: 5,
}

function generateDateOptions(minDaysInAdvance: number, windowDays: number) {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() + minDaysInAdvance)

  return Array.from({ length: windowDays }, (_, i) => {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    return d
  })
}

function generateTimeSlots(openTime: string, closeTime: string, intervalMinutes: number) {
  const [openH, openM] = openTime.split(':').map(Number)
  const [closeH, closeM] = closeTime.split(':').map(Number)
  const openMinutes = openH * 60 + openM
  const closeMinutes = closeH * 60 + closeM

  const slots: string[] = []
  for (let m = openMinutes; m < closeMinutes; m += intervalMinutes) {
    const h = Math.floor(m / 60)
    const mm = m % 60
    slots.push(`${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`)
  }
  return slots
}

const currency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function formatDateChip(date: Date) {
  const weekday = date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
  const month = date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
  return { weekday, day: date.getDate(), month }
}

function QuantityStepper({
  label,
  sublabel,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  sublabel: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="font-body text-sm font-medium text-gray-700">{label}</p>
        <p className="font-body text-xs text-gray-400">{sublabel}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Minus size={14} />
        </button>
        <span className="font-body w-4 text-center text-sm font-semibold text-gray-800">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}

export default function CompraAntecipadaCheckout() {
  const dateOptions = useMemo(
    () => generateDateOptions(CHECKOUT_CONFIG.minDaysInAdvance, CHECKOUT_CONFIG.dateWindowDays),
    []
  )
  const timeSlots = useMemo(
    () =>
      generateTimeSlots(
        CHECKOUT_CONFIG.openTime,
        CHECKOUT_CONFIG.closeTime,
        CHECKOUT_CONFIG.timeSlotIntervalMinutes
      ),
    []
  )

  const [selectedDate, setSelectedDate] = useState<Date>(dateOptions[0])
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [children, setChildren] = useState(1)
  const [companions, setCompanions] = useState(0)

  const childrenTotal = children * CHECKOUT_CONFIG.childPrice
  const companionsTotal = companions * CHECKOUT_CONFIG.companionPrice
  const total = childrenTotal + companionsTotal

  const canContinue = Boolean(selectedDate && selectedTime && children > 0)

  return (
    <div className="bg-gray-50">
      <div className="container-max px-4 py-8 md:py-12">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
          {/* Seleção */}
          <div className="flex min-w-0 flex-col gap-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="font-heading mb-4 flex items-center gap-2 text-sm font-bold text-gray-800">
                <Calendar size={16} className="text-brand-pink" />
                Escolha a data
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {dateOptions.map((date) => {
                  const { weekday, day, month } = formatDateChip(date)
                  const isSelected = date.getTime() === selectedDate.getTime()
                  return (
                    <button
                      key={date.toISOString()}
                      type="button"
                      onClick={() => setSelectedDate(date)}
                      className={
                        'font-body flex shrink-0 flex-col items-center gap-0.5 rounded-2xl border px-4 py-2.5 text-center transition-colors ' +
                        (isSelected
                          ? 'bg-brand-pink border-brand-pink text-white'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300')
                      }
                    >
                      <span className="text-[10px] uppercase opacity-80">{weekday}</span>
                      <span className="text-lg leading-tight font-bold">{day}</span>
                      <span className="text-[10px] uppercase opacity-80">{month}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="font-heading mb-4 flex items-center gap-2 text-sm font-bold text-gray-800">
                <Clock size={16} className="text-brand-pink" />
                Escolha o horário
              </h3>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {timeSlots.map((time) => {
                  const isSelected = time === selectedTime
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={
                        'font-body rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ' +
                        (isSelected
                          ? 'bg-brand-pink border-brand-pink text-white'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300')
                      }
                    >
                      {time}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="font-heading mb-1 flex items-center gap-2 text-sm font-bold text-gray-800">
                <Users size={16} className="text-brand-pink" />
                Ingressos
              </h3>
              <div className="divide-y divide-gray-100">
                <QuantityStepper
                  label="Crianças"
                  sublabel={`${currency(CHECKOUT_CONFIG.childPrice)} por criança`}
                  value={children}
                  min={1}
                  max={CHECKOUT_CONFIG.maxChildren}
                  onChange={setChildren}
                />
                <QuantityStepper
                  label="Acompanhantes"
                  sublabel={`${currency(CHECKOUT_CONFIG.companionPrice)} por acompanhante`}
                  value={companions}
                  min={0}
                  max={CHECKOUT_CONFIG.maxCompanions}
                  onChange={setCompanions}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="font-heading mb-4 flex items-center gap-2 text-lg font-bold text-gray-800">
                <Ticket className="text-brand-pink" size={26} />
                Comprar Ingresso
              </h2>
              <div className="flex flex-col gap-3 border-t border-gray-100 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar size={15} className="text-gray-400" />
                    <div>
                      <p className="font-body text-xs text-gray-400">Data</p>
                      <p className="font-body text-sm font-semibold text-gray-700">
                        {selectedDate.toLocaleDateString('pt-BR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
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
                    <p className="font-body text-sm text-gray-600">
                      Crianças
                    </p>
                    <p className="font-body text-xs text-gray-400">
                      {children} x {currency(CHECKOUT_CONFIG.childPrice)}
                    </p>
                  </div>
                  <span className="font-body text-sm font-semibold text-gray-800">
                    {currency(childrenTotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-body text-sm text-gray-600">
                      Acompanhantes
                    </p>
                    <p className="font-body text-xs text-gray-400">
                      {companions} x {currency(CHECKOUT_CONFIG.companionPrice)}
                    </p>
                  </div>
                  <span className="font-body text-sm font-semibold text-gray-800">
                    {currency(companionsTotal)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="font-heading text-base font-bold text-gray-800">
                  Total
                </span>
                <span className="font-heading text-brand-pink text-xl font-bold">
                  {currency(total)}
                </span>
              </div>
            </div>

            <div className="bg-brand-yellow/10 rounded-2xl p-6">
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
                  <li
                    key={info}
                    className="font-body flex items-start gap-2 text-xs text-gray-600"
                  >
                    <Info
                      size={13}
                      className="text-brand-yellow mt-0.5 shrink-0"
                    />
                    {info}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer nav */}
        <div className="mt-6 flex items-center justify-end gap-4 rounded-2xl bg-white p-4 shadow-sm">
          <motion.button
            disabled={!canContinue}
            whileHover={canContinue ? { scale: 1.03 } : {}}
            whileTap={canContinue ? { scale: 0.98 } : {}}
            className={
              'font-body flex items-center gap-2 rounded-full px-8 py-3 text-sm font-bold text-white transition-opacity ' +
              (canContinue
                ? 'bg-brand-pink hover:opacity-90'
                : 'cursor-not-allowed bg-gray-300')
            }
          >
            Continuar para seus dados
          </motion.button>
        </div>
      </div>
    </div>
  )
}
