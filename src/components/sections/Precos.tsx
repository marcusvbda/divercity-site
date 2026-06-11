'use client'

import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

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

export default function Precos({ precos, priceSection }: any) {
  const badge = priceSection?.badge ?? ''
  const title = priceSection?.title ?? ''
  const subtitle = priceSection?.subtitle ?? ''
  const disclaimers: any = priceSection?.disclaimers ?? []

  return (
    <section id="precos" className="section-padding bg-gray-50">
      <div className="container-max">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <span className="bg-brand-yellow/20 font-body mb-3 inline-block rounded-full px-4 py-1.5 text-sm font-semibold text-yellow-700">
            {badge ?? 'Passaportes'}
          </span>
          <h2 className="font-heading mb-4 text-4xl font-bold text-gray-800 md:text-5xl">
            {title}
          </h2>
          <p className="font-body mx-auto max-w-xl text-lg text-gray-500">
            {subtitle}
          </p>
        </motion.div>

        {/* Pricing cards — 2 colunas, largura total */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 gap-8 lg:grid-cols-2"
        >
          {precos.map((group: any) => (
            <motion.div
              key={group.titulo}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-md transition-shadow hover:shadow-xl"
            >
              {/* Card header */}
              <div
                className="px-8 py-6 text-center"
                style={{
                  backgroundColor: group.cor + '18',
                  borderBottom: `3px solid ${group.cor}`,
                }}
              >
                <h3
                  className="font-heading text-2xl font-bold"
                  style={{ color: group.cor }}
                >
                  {group.titulo}
                </h3>
                {group.subtitulo && (
                  <p className="font-body mt-1 text-sm text-gray-500">
                    ({group.subtitulo})
                  </p>
                )}
              </div>

              {/* Tiers grid — 2 colunas dentro do card */}
              <div className="grid flex-1 grid-cols-1 gap-4 p-8 sm:grid-cols-2">
                {group.tiers.map((tier: any, ti: any) => (
                  <div
                    key={ti}
                    className="flex flex-col gap-1 rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 transition-colors hover:border-gray-200"
                  >
                    {/* Duração */}
                    <div className="mb-1 flex items-center gap-1.5 text-gray-400">
                      <Clock size={13} />
                      <span className="font-body text-xs font-medium">
                        {tier.label}
                      </span>
                    </div>
                    {/* Preço */}
                    <span
                      className="font-heading text-4xl leading-none font-bold"
                      style={{ color: group.cor }}
                    >
                      R${tier.valor}
                    </span>
                    {/* Acompanhante */}
                    <p className="font-body mt-1 text-xs text-gray-400">
                      Acompanhante{' '}
                      <span className="font-semibold text-gray-600">
                        R${tier.acompanhante}
                      </span>
                    </p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="px-8 pb-8">
                <button
                  onClick={() =>
                    document
                      .querySelector('#contato')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                  className="font-body w-full rounded-2xl py-4 text-sm font-bold text-white transition-opacity hover:opacity-90"
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
          className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          {disclaimers.map((d: any) => (
            <div
              key={`disclaimers-${d.id}`}
              className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm"
            >
              <ReactMarkdown>{d?.value ?? ''}</ReactMarkdown>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
