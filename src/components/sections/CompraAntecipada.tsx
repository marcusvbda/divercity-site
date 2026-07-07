'use client'

import { motion } from 'framer-motion'
import { Ticket, Lock, QrCode, Clock, Star } from 'lucide-react'
import Link from 'next/link'

const ICON_MAP: Record<string, React.ElementType> = {
  Ticket,
  Lock,
  QrCode,
  Clock,
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
}

type FeatureItem = {
  id: number
  value: { label?: string | null; iconName?: string | null; color?: string | null }
}

type CtaValue = { label?: string | null; href?: string | null }

export default function CompraAntecipada({ advancePurchaseSection }: any) {
  const title      = advancePurchaseSection?.Section?.title?.value      ?? ''
  const subtitle   = advancePurchaseSection?.Section?.subtitle?.value   ?? ''
  const features: FeatureItem[] = advancePurchaseSection?.Content?.features ?? []
  const disclaimer = advancePurchaseSection?.Content?.disclaimer?.value ?? ''
  const cta: CtaValue = advancePurchaseSection?.Actions?.cta?.value ?? {}

  return (
    <section className="section-padding bg-white">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="bg-brand-purple/5 items-center gap-10 rounded-3xl p-8 md:p-12"
        >
          <div>
            <h2 className="font-heading mb-2 text-3xl font-bold text-gray-800 md:text-4xl">
              {title}
            </h2>
            <p className="font-body mb-8 text-lg text-gray-500">
              {subtitle}
            </p>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="mb-6 grid w-full grid-cols-2 gap-4 rounded-2xl bg-white p-6 shadow-sm sm:grid-cols-4"
            >
              {features.map((item) => {
                const Icon = ICON_MAP[item.value.iconName ?? ''] ?? Star
                const color = item.value.color ?? '#12C7C8'
                return (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    className="flex flex-col items-center gap-2 text-center"
                  >
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-full"
                      style={{ backgroundColor: color + '1a' }}
                    >
                      <Icon size={20} style={{ color }} />
                    </div>
                    <span className="font-body text-xs font-medium text-gray-600">
                      {item.value.label}
                    </span>
                  </motion.div>
                )
              })}
            </motion.div>

            <div className="flex w-full flex-col items-center md:items-end">
              <p className="font-body mb-6 text-xs text-gray-400">
                {disclaimer}
              </p>

              <Link href={cta.href ?? 'compra-antecipada'}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="font-body bg-brand-pink inline-flex items-center gap-2 rounded-full px-8 py-4 text-lg font-bold text-white transition-opacity hover:opacity-90"
                >
                  <Ticket size={20} />
                  {cta.label}
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
