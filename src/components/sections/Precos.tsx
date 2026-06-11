'use client'

import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
}

type TierItem = {
  id: number
  value: { label?: string | null; valor?: string | null; acompanhante?: string | null }
}

type PriceItem = {
  id: number
  value: { title?: string | null; subtitle?: string | null; color?: string | null }
}

type DisclaimerItem = { id: number; value: string }

export default function Precos({ priceSection }: any) {
  const badge    = priceSection?.Section?.badge?.value    ?? ''
  const title    = priceSection?.Section?.title?.value    ?? ''
  const subtitle = priceSection?.Section?.subtitle?.value ?? ''
  const prices: PriceItem[]           = priceSection?.Content?.prices      ?? []
  const disclaimers: DisclaimerItem[] = priceSection?.Content?.disclaimers ?? []
  const weekdayTiers: TierItem[]      = priceSection?.Tiers?.weekdayTiers  ?? []
  const weekendTiers: TierItem[]      = priceSection?.Tiers?.weekendTiers  ?? []

  const tiersByGroup = [weekdayTiers, weekendTiers]

  return (
    <section id="precos" className="section-padding bg-gray-50">
      <div className="container-max">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <span className="bg-brand-yellow/20 font-body mb-3 inline-block rounded-full px-4 py-1.5 text-sm font-semibold text-yellow-700">
            {badge}
          </span>
          <h2 className="font-heading mb-4 text-4xl font-bold text-gray-800 md:text-5xl">
            {title}
          </h2>
          <p className="font-body mx-auto max-w-xl text-lg text-gray-500">
            {subtitle}
          </p>
        </motion.div>

        {/* Price cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 gap-8 lg:grid-cols-2"
        >
          {prices.map((group, idx) => {
            const color = group.value.color ?? '#12C7C8'
            const tiers = tiersByGroup[idx] ?? []
            return (
              <motion.div
                key={group.id}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-md transition-shadow hover:shadow-xl"
              >
                {/* Card header */}
                <div
                  className="px-8 py-6 text-center"
                  style={{
                    backgroundColor: color + '18',
                    borderBottom: `3px solid ${color}`,
                  }}
                >
                  <h3 className="font-heading text-2xl font-bold" style={{ color }}>
                    {group.value.title}
                  </h3>
                  {group.value.subtitle && group.value.subtitle !== '-' && (
                    <p className="font-body mt-1 text-sm text-gray-500">
                      ({group.value.subtitle})
                    </p>
                  )}
                </div>

                {/* Tiers grid */}
                <div className="grid flex-1 grid-cols-2 gap-4 p-8">
                  {tiers.map((tier) => (
                    <div
                      key={tier.id}
                      className="flex flex-col gap-1 rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 transition-colors hover:border-gray-200"
                    >
                      <div className="mb-1 flex items-center gap-1.5 text-gray-400">
                        <Clock size={13} />
                        <span className="font-body text-xs font-medium">{tier.value.label}</span>
                      </div>
                      <span className="font-heading text-4xl leading-none font-bold" style={{ color }}>
                        R${tier.value.valor}
                      </span>
                      <p className="font-body mt-1 text-xs text-gray-400">
                        Acompanhante{' '}
                        <span className="font-semibold text-gray-600">R${tier.value.acompanhante}</span>
                      </p>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="px-8 pb-8">
                  <button
                    onClick={() =>
                      document.querySelector('#contato')?.scrollIntoView({ behavior: 'smooth' })
                    }
                    className="font-body w-full rounded-2xl py-4 text-sm font-bold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: color }}
                  >
                    Reservar agora
                  </button>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Disclaimers */}
        {disclaimers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2"
          >
            {disclaimers.map((d) => (
              <div
                key={d.id}
                className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm"
              >
                <ReactMarkdown>{d.value}</ReactMarkdown>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}
