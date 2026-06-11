'use client'

import { motion } from 'framer-motion'
import {
  Shield,
  Users,
  PartyPopper,
  MapPin,
  UtensilsCrossed,
  HeartHandshake,
  Star,
} from 'lucide-react'

const ICON_MAP: Record<string, React.ElementType> = {
  Shield,
  Users,
  PartyPopper,
  MapPin,
  UtensilsCrossed,
  HeartHandshake,
}

const GRADIENTS = [
  'linear-gradient(135deg, #12C7C8, #8E4CCF)',
  'linear-gradient(135deg, #8E4CCF, #FF4F8A)',
  'linear-gradient(135deg, #FF4F8A, #FFD23F)',
  'linear-gradient(135deg, #9AD94B, #12C7C8)',
  'linear-gradient(135deg, #FFD23F, #FF4F8A)',
  'linear-gradient(135deg, #12C7C8, #9AD94B)',
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
}

type BenefitItem = {
  id: number
  value: { title?: string | null; description?: string | null; iconName?: string | null }
}

export default function PorQueEscolher({ benefits }: any) {
  const badge    = benefits?.Section?.badge?.value    ?? ''
  const title    = benefits?.Section?.title?.value    ?? ''
  const subtitle = benefits?.Section?.subtitle?.value ?? ''
  const list: BenefitItem[] = benefits?.Content?.Benefit ?? []

  return (
    <section className="section-padding bg-white">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <span className="bg-brand-purple/10 text-brand-purple font-body mb-3 inline-block rounded-full px-4 py-1.5 text-sm font-semibold">
            {badge}
          </span>
          <h2 className="font-heading mb-4 text-4xl font-bold text-gray-800 md:text-5xl">
            {title}
          </h2>
          <p className="font-body mx-auto max-w-xl text-lg text-gray-500">
            {subtitle}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {list.map((item, idx) => {
            const Icon = ICON_MAP[item.value.iconName ?? ''] ?? Star
            return (
              <motion.div
                key={item.id}
                variants={itemVariants}
                whileHover={{
                  y: -6,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                }}
                className="rounded-3xl border border-gray-100 bg-white p-7 shadow-sm"
              >
                <div
                  className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl shadow-md"
                  style={{ background: GRADIENTS[idx % GRADIENTS.length] }}
                >
                  <Icon size={28} className="text-white" />
                </div>
                <h3 className="font-heading mb-2 text-xl font-semibold text-gray-800">
                  {item.value.title}
                </h3>
                <p className="font-body text-sm leading-relaxed text-gray-500">
                  {item.value.description}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
