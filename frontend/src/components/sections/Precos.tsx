'use client'

import { motion } from 'framer-motion'
import { PRECOS, PRICE_DISCLAIMERS } from '@/lib/data'

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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-yellow/20 text-yellow-700 font-body font-semibold text-sm mb-3">
            Passaportes
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Preços
          </h2>
          <p className="font-body text-gray-500 text-lg max-w-xl mx-auto">
            Escolha o passaporte ideal para o seu dia de diversão.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto"
        >
          {PRECOS.map((group) => (
            <motion.div
              key={group.titulo}
              variants={itemVariants}
              whileHover={{ y: -6 }}
              className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
            >
              {/* Header */}
              <div className="p-6 text-center" style={{ backgroundColor: group.cor + '15', borderBottom: `3px solid ${group.cor}` }}>
                <h3 className="font-heading text-xl font-bold mb-1" style={{ color: group.cor }}>
                  {group.titulo}
                </h3>
                {group.subtitulo && (
                  <p className="font-body text-sm text-gray-500">({group.subtitulo})</p>
                )}
              </div>

              {/* Tiers */}
              <div className="p-6 space-y-5">
                {group.tiers.map((tier, ti) => (
                  <div key={ti} className="flex flex-col gap-1 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="flex items-baseline justify-between">
                      <span
                        className="font-heading text-4xl font-bold"
                        style={{ color: group.cor }}
                      >
                        R${tier.valor}
                      </span>
                      <span className="font-body text-gray-400 text-sm">/{tier.label}</span>
                    </div>
                    <p className="font-body text-gray-500 text-xs">
                      Acompanhante{' '}
                      <span className="font-semibold text-gray-700">paga R${tier.acompanhante}</span>
                    </p>
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

        {/* Disclaimers */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto"
        >
          {PRICE_DISCLAIMERS.map((d) => (
            <div
              key={d.titulo}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <h4 className="font-heading text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>{d.emoji}</span>
                {d.titulo}
              </h4>
              <ul className="space-y-3">
                {d.linhas.map((linha, i) => (
                  <li key={i} className="font-body text-gray-600 text-sm leading-relaxed">
                    {linha}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
