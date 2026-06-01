'use client'

import { motion } from 'framer-motion'
import { PartyPopper, Layers, Users } from 'lucide-react'

const BENEFITS = [
  {
    icon: PartyPopper,
    titulo: 'Festas Incríveis',
    descricao:
      'Festas de aniversário personalizadas com toda a decoração e estrutura para um dia inesquecível.',
    cor: '#FF4F8A',
    bg: 'bg-pink-50',
    border: 'border-pink-100',
  },
  {
    icon: Layers,
    titulo: 'Mais de 10 Atrações',
    descricao:
      'Diversão garantida para crianças de todas as idades com atrações variadas e seguras.',
    cor: '#12C7C8',
    bg: 'bg-cyan-50',
    border: 'border-cyan-100',
  },
  {
    icon: Users,
    titulo: 'Área para Pais',
    descricao:
      'Espaço confortável e acolhedor para os pais relaxarem enquanto as crianças se divertem.',
    cor: '#8E4CCF',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
}

export default function Benefits() {
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
          {BENEFITS.map((b) => {
            const Icon = b.icon
            return (
              <motion.div
                key={b.titulo}
                variants={itemVariants}
                whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                className={`${b.bg} ${b.border} border rounded-3xl p-8 flex flex-col items-center text-center cursor-default`}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: b.cor + '20' }}
                >
                  <Icon size={32} style={{ color: b.cor }} />
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
