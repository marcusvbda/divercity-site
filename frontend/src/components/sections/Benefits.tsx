'use client'

import { motion } from 'framer-motion'
import { UserCheck, Timer, PartyPopper } from 'lucide-react'

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
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
}

interface Props {
  beneficiosDestaque: any[]
}

export default function Benefits({ beneficiosDestaque }: Props) {
  return (
    <section className="bg-white px-4 py-16 md:px-8 md:py-20 lg:px-16">
      <div className="container-max">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {beneficiosDestaque.map((b) => {
            const Icon = ICON_MAP[b.iconeName]
            return (
              <motion.div
                key={b.id}
                variants={itemVariants}
                whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                className="flex cursor-default flex-col items-center rounded-3xl border p-8 text-center"
                style={{
                  backgroundColor: b.cor + '10',
                  borderColor: b.cor + '30',
                }}
              >
                <div
                  className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: b.cor + '20' }}
                >
                  {Icon && <Icon size={32} style={{ color: b.cor }} />}
                </div>
                <h3 className="font-heading mb-3 text-xl font-semibold text-gray-800">
                  {b.titulo}
                </h3>
                <p className="font-body text-sm leading-relaxed text-gray-600">
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
