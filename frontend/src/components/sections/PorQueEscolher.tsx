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

const BRAND_COLORS: Record<string, string> = {
  'brand-cyan': '#12C7C8',
  'brand-purple': '#8E4CCF',
  'brand-pink': '#FF4F8A',
  'brand-lime': '#9AD94B',
  'brand-yellow': '#FFD23F',
}

/** Converte "from-brand-cyan to-brand-purple" → CSS gradient real.
 *  Se já for CSS válido (começa com #, linear-gradient, etc) usa direto. */
function resolveGradient(g: string): string {
  if (!g) return 'linear-gradient(135deg, #12C7C8, #8E4CCF)'
  if (g.startsWith('linear-gradient') || g.startsWith('#')) return g
  const m = g.match(/from-(\S+)\s+to-(\S+)/)
  if (m) {
    const from = BRAND_COLORS[m[1]] ?? '#12C7C8'
    const to = BRAND_COLORS[m[2]] ?? '#8E4CCF'
    return `linear-gradient(135deg, ${from}, ${to})`
  }
  return 'linear-gradient(135deg, #12C7C8, #8E4CCF)'
}

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

export default function PorQueEscolher({ beneficios, benefitSection }: any) {
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
            {benefitSection?.badge}
          </span>
          <h2 className="font-heading mb-4 text-4xl font-bold text-gray-800 md:text-5xl">
            {benefitSection?.title}
          </h2>
          <p className="font-body mx-auto max-w-xl text-lg text-gray-500">
            {benefitSection?.subtitle}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {beneficios.map((b: any) => {
            const Icon = ICON_MAP[b.iconeName]
            return (
              <motion.div
                key={b.titulo}
                variants={itemVariants}
                whileHover={{
                  y: -6,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                }}
                className="rounded-3xl border border-gray-100 bg-white p-7 shadow-sm"
              >
                <div
                  className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl shadow-md"
                  style={{ background: resolveGradient(b.gradiente) }}
                >
                  {Icon ? (
                    <Icon size={28} className="text-white" />
                  ) : (
                    <Star size={28} className="text-white" />
                  )}
                </div>
                <h3 className="font-heading mb-2 text-xl font-semibold text-gray-800">
                  {b.titulo}
                </h3>
                <p className="font-body text-sm leading-relaxed text-gray-500">
                  {b.descricao}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
