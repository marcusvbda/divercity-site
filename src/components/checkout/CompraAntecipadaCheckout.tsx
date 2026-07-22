'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Star, Ticket, Users } from 'lucide-react'

type PriceItem = {
  id: number
  value: {
    title?: string | null
    subtitle?: string | null
    color?: string | null
  }
}

type TierItem = {
  id: number
  value: {
    label?: string | null
    valor?: string | null
    acompanhante?: string | null
  }
}

const currency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function CompraAntecipadaCheckout({
  advancePurchaseSection,
}: {
  advancePurchaseSection: any
}) {
  const groups: PriceItem[] = advancePurchaseSection?.Tickets?.prices ?? []
  const tiersByGroup: TierItem[][] = [
    advancePurchaseSection?.Tiers?.weekdayTiers ?? [],
    advancePurchaseSection?.Tiers?.weekendTiers ?? [],
  ]

  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0)
  const [selectedTierIndex, setSelectedTierIndex] = useState(0)
  const [hasCompanion, setHasCompanion] = useState(false)

  const selectedGroup = groups[selectedGroupIndex]
  const tiers = tiersByGroup[selectedGroupIndex] ?? []
  const selectedTier = tiers[selectedTierIndex]

  const childPrice = Number(selectedTier?.value.valor ?? 0)
  const companionPrice = Number(selectedTier?.value.acompanhante ?? 0)
  const total = childPrice + (hasCompanion ? companionPrice : 0)

  return (
    <div className="bg-gray-50">
      <div className="container-max px-4 py-8 md:py-12">
        <div className="mx-auto flex max-w-xl flex-col gap-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="font-heading mb-4 flex items-center gap-2 text-lg font-bold text-gray-800">
              <Ticket className="text-brand-pink" size={26} />
              Comprar Ingresso
            </h2>
            <div className="flex flex-col gap-3 border-t border-gray-100 py-4">
              <div className="flex items-center justify-between">
                <p className="font-body text-sm text-gray-600">Tipo de ingresso</p>
                <p className="font-body text-sm font-semibold text-gray-800">
                  {selectedGroup?.value.title}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="font-body text-sm text-gray-600">Duração</p>
                <p className="font-body text-sm font-semibold text-gray-800">
                  {selectedTier?.value.label}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="font-body text-sm text-gray-600">Ingresso</p>
                <span className="font-body text-sm font-semibold text-gray-800">
                  {currency(childPrice)}
                </span>
              </div>
              {hasCompanion && (
                <div className="flex items-center justify-between">
                  <p className="font-body text-sm text-gray-600">Acompanhante</p>
                  <span className="font-body text-sm font-semibold text-gray-800">
                    {currency(companionPrice)}
                  </span>
                </div>
              )}
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
            <h3 className="font-heading mb-4 flex items-center gap-2 text-sm font-bold text-gray-800">
              <Star size={16} className="text-brand-yellow" />
              Informações importantes
            </h3>

            <div className="mb-5">
              <p className="font-body mb-2 text-xs font-semibold text-gray-500">
                Tipo de ingresso
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                {groups.map((group, idx) => {
                  const isSelected = idx === selectedGroupIndex
                  const color = group.value.color ?? '#12C7C8'
                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => setSelectedGroupIndex(idx)}
                      className="font-body flex-1 rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition-colors"
                      style={
                        isSelected
                          ? { backgroundColor: color, borderColor: color, color: '#fff' }
                          : { borderColor: '#e5e7eb', color: '#4b5563' }
                      }
                    >
                      {group.value.title}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mb-5">
              <p className="font-body mb-2 text-xs font-semibold text-gray-500">
                Duração
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {tiers.map((tier, idx) => {
                  const isSelected = idx === selectedTierIndex
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setSelectedTierIndex(idx)}
                      className={
                        'font-body flex flex-col items-center gap-1 rounded-xl border px-3 py-2.5 transition-colors ' +
                        (isSelected
                          ? 'bg-brand-pink border-brand-pink text-white'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300')
                      }
                    >
                      <span className="flex items-center gap-1 text-xs opacity-90">
                        <Clock size={11} />
                        {tier.value.label}
                      </span>
                      <span className="text-sm font-bold">
                        {currency(Number(tier.value.valor ?? 0))}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4 py-3">
              <input
                type="checkbox"
                checked={hasCompanion}
                onChange={(e) => setHasCompanion(e.target.checked)}
                className="accent-brand-pink h-4 w-4"
              />
              <span className="font-body flex flex-1 items-center gap-1.5 text-sm text-gray-700">
                <Users size={14} className="text-gray-400" />
                Vou levar acompanhante
              </span>
              <span className="font-body text-xs font-semibold text-gray-500">
                + {currency(companionPrice)}
              </span>
            </label>
          </div>
        </div>

        <div className="mx-auto mt-6 flex max-w-xl items-center justify-end rounded-2xl bg-white p-4 shadow-sm">
          <motion.button
            type="button"
            onClick={() => alert('Ainda não implementado')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="font-body bg-brand-pink flex items-center gap-2 rounded-full px-8 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            Comprar Ingresso
          </motion.button>
        </div>
      </div>
    </div>
  )
}
