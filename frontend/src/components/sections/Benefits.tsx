'use client'

import { motion } from 'framer-motion'
import { UserCheck, Timer, PartyPopper } from 'lucide-react'
import type { CMSBeneficioDestaque } from '@/lib/cms'

const ICON_MAP: Record<string, React.ElementType> = {
  UserCheck,
  Timer,
  PartyPopper,
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
}

interface Props {
  beneficiosDestaque: CMSBeneficioDestaque[]
}

export default function Benefits({ beneficiosDestaque }: Props) {
  return (
    <section className="py-16 md:py-20 px-4 md:px-8 lg:px-16 bg-white">
      <div className="container-max">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {beneficiosDestaque.map((b) => {
            const Icon = ICON_MAP[b.iconeName]
            return (
              <motion.div
                key={b.id}
                variants={itemVariants}
                whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                className="border rounded-3xl p-8 flex flex-col items-center text-center cursor-default"
                style={{
                  backgroundColor: b.cor + '10',
                  borderColor: b.cor + '30',
                }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: b.cor + '20' }}
                >
                  {Icon && <Icon size={32} style={{ color: b.cor }} />}
                </div>
                <h3 className="font-heading text-xl font-semibold text-gray-800 mb-3">
                  {b.titulo}
                </h3>
                <p className="font-body text-gray-600 text-sm leading-relaxed">{b.descricao}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
