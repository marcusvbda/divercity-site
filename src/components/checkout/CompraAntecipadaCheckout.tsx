'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Info, Star, Ticket } from 'lucide-react'

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

const currency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function CompraAntecipadaCheckout() {
  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const [selectedDate, setSelectedDate] = useState<Date | null>(today)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [children, setChildren] = useState(2)
  const [adults, setAdults] = useState(1)

  const tier = selectedDate ? priceForWeekday(selectedDate.getDay()) : null
  const childrenTotal = tier ? tier.price * children : 0
  const total = childrenTotal

  const canContinue = Boolean(selectedDate && selectedTime)

  return (
    <div className="bg-gray-50">
      <div className="container-max px-4 py-8 md:py-12">
        <div className="gap-6 lg:items-start">
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
                    <p className="font-body text-sm text-gray-600">
                      Crianças (2 a 12 anos)
                    </p>
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
                    <p className="font-body text-sm text-gray-600">
                      Adultos acompanhantes
                    </p>
                    <p className="font-body text-xs text-gray-400">
                      {adults} x Grátis
                    </p>
                  </div>
                  <span className="font-body text-sm font-semibold text-gray-800">
                    {currency(0)}
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
