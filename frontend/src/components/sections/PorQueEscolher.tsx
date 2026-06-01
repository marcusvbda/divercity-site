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
import type { CMSBeneficio } from '@/lib/cms'

const ICON_MAP: Record<string, React.ElementType> = {
  Shield,
  Users,
  PartyPopper,
  MapPin,
  UtensilsCrossed,
  HeartHandshake,
}

const BRAND_COLORS: Record<string, string> = {
  'brand-cyan':    '#12C7C8',
  'brand-purple':  '#8E4CCF',
  'brand-pink':    '#FF4F8A',
  'brand-lime':    '#9AD94B',
  'brand-yellow':  '#FFD23F',
}

/** Converte "from-brand-cyan to-brand-purple" → CSS gradient real.
 *  Se já for CSS válido (começa com #, linear-gradient, etc) usa direto. */
function resolveGradient(g: string): string {
  if (!g) return 'linear-gradient(135deg, #12C7C8, #8E4CCF)'
  if (g.startsWith('linear-gradient') || g.startsWith('#')) return g
  const m = g.match(/from-(\S+)\s+to-(\S+)/)
  if (m) {
    const from = BRAND_COLORS[m[1]] ?? '#12C7C8'
    const to   = BRAND_COLORS[m[2]] ?? '#8E4CCF'
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
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
}

interface Props {
  beneficios: CMSBeneficio[]
  badge?: string
  titulo?: string
  tituloDestaque?: string
  subtitulo?: string
}

export default function PorQueEscolher({ beneficios, badge, titulo, tituloDestaque, subtitulo }: Props) {
  return (
    <section className="section-padding bg-white">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-purple/10 text-brand-purple font-body font-semibold text-sm mb-3">
            {badge ?? 'Nossos Diferenciais'}
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            {titulo ?? 'Por que as famílias escolhem o'}{' '}
            <span className="text-brand-purple">{tituloDestaque ?? 'Divercity Park?'}</span>
          </h2>
          <p className="font-body text-gray-500 text-lg max-w-xl mx-auto">
            {subtitulo ?? 'Mais do que um parque — somos uma experiência completa para toda a família.'}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {beneficios.map((b) => {
            const Icon = ICON_MAP[b.iconeName]
            return (
              <motion.div
                key={b.titulo}
                variants={itemVariants}
                whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
                className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-md"
                  style={{ background: resolveGradient(b.gradiente) }}
                >
                  {Icon ? <Icon size={28} className="text-white" /> : <Star size={28} className="text-white" />}
                </div>
                <h3 className="font-heading text-xl font-semibold text-gray-800 mb-2">
                  {b.titulo}
                </h3>
                <p className="font-body text-gray-500 text-sm leading-relaxed">{b.descricao}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
