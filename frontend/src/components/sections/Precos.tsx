'use client'

import { motion } from 'framer-motion'
import { PRECOS } from '@/lib/data'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
}

export default function Precos() {
  return (
    <section id="precos" className="section-padding bg-gray-50">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-yellow/20 text-yellow-700 font-body font-semibold text-sm mb-3">
            Investimento
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Preços
          </h2>
          <p className="font-body text-gray-500 text-lg max-w-xl mx-auto">
            Escolha o melhor dia para a sua visita. Crianças menores de 2 anos não pagam.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {PRECOS.map((group) => (
            <motion.div
              key={group.titulo}
              variants={itemVariants}
              whileHover={{ y: -6 }}
              className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
            >
              {/* Header */}
              <div className="p-6 text-white" style={{ backgroundColor: group.cor }}>
                <p className="font-body text-sm font-medium opacity-80 mb-1">
                  {group.subtitulo}
                </p>
                <h3 className="font-heading text-2xl font-bold">{group.titulo}</h3>
              </div>

              {/* Tiers */}
              <div className="p-6 space-y-4">
                {group.tiers.map((tier, ti) => (
                  <div
                    key={ti}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                  >
                    <span className="font-body text-gray-600 text-sm">{tier.label}</span>
                    <span
                      className="font-heading text-2xl font-bold"
                      style={{ color: group.cor }}
                    >
                      R${tier.valor}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="px-6 pb-6">
                <button
                  onClick={() =>
                    document.querySelector('#contato')?.scrollIntoView({ behavior: 'smooth' })
                  }
                  className="w-full py-3 rounded-2xl font-body font-semibold text-sm text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: group.cor }}
                >
                  Reservar agora
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center font-body text-sm text-gray-400 mt-8"
        >
          * Crianças até 2 anos não pagam. Adultos acompanhantes têm acesso gratuito.
        </motion.p>
      </div>
    </section>
  )
}
