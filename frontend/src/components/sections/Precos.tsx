'use client'

import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
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
          className="text-center mb-14"
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

        {/* Pricing cards — 2 colunas, largura total */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {PRECOS.map((group) => (
            <motion.div
              key={group.titulo}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-shadow flex flex-col"
            >
              {/* Card header */}
              <div
                className="px-8 py-6 text-center"
                style={{ backgroundColor: group.cor + '18', borderBottom: `3px solid ${group.cor}` }}
              >
                <h3
                  className="font-heading text-2xl font-bold"
                  style={{ color: group.cor }}
                >
                  {group.titulo}
                </h3>
                {group.subtitulo && (
                  <p className="font-body text-sm text-gray-500 mt-1">({group.subtitulo})</p>
                )}
              </div>

              {/* Tiers grid — 2 colunas dentro do card */}
              <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                {group.tiers.map((tier, ti) => (
                  <div
                    key={ti}
                    className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 flex flex-col gap-1 hover:border-gray-200 transition-colors"
                  >
                    {/* Duração */}
                    <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                      <Clock size={13} />
                      <span className="font-body text-xs font-medium">{tier.label}</span>
                    </div>
                    {/* Preço */}
                    <span
                      className="font-heading text-4xl font-bold leading-none"
                      style={{ color: group.cor }}
                    >
                      R${tier.valor}
                    </span>
                    {/* Acompanhante */}
                    <p className="font-body text-gray-400 text-xs mt-1">
                      Acompanhante{' '}
                      <span className="font-semibold text-gray-600">R${tier.acompanhante}</span>
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
                  className="w-full py-4 rounded-2xl font-body font-bold text-sm text-white transition-opacity hover:opacity-90"
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
          className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {PRICE_DISCLAIMERS.map((d) => (
            <div
              key={d.titulo}
              className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100"
            >
              <h4 className="font-heading text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
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
