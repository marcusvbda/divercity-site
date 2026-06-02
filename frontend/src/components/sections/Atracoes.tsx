'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import ImageModal from '@/components/ui/ImageModal'
import { absoluteUrl } from '@/lib/helpers'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
}

export default function Atracoes({ attractionSection, atracoes }: any) {
  const [selected, setSelected] = useState<any>(null)

  const badge = attractionSection?.badge ?? ''
  const title = attractionSection?.title ?? ''
  const subtitle = attractionSection?.subtitle ?? ''

  return (
    <>
      <section id="atracoes" className="section-padding bg-gray-50">
        <div className="container-max">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <span className="bg-brand-cyan/10 text-brand-cyan font-body mb-3 inline-block rounded-full px-4 py-1.5 text-sm font-semibold">
              {badge}
            </span>
            <h2 className="font-heading mb-4 text-4xl font-bold text-gray-800 md:text-5xl">
              {title}
            </h2>
            <p className="font-body mx-auto max-w-xl text-lg text-gray-500">
              {subtitle}
            </p>
          </motion.div>

          {/* Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {atracoes.map((atracao: any) => (
              <motion.div
                key={atracao.id}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                onClick={() => setSelected(atracao)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl shadow-md transition-shadow hover:shadow-xl"
              >
                <div className="relative h-52 w-full bg-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={absoluteUrl(atracao?.imagem?.url) as string}
                    alt={atracao.nome}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                </div>
                <div
                  className="absolute top-0 right-0 left-0 h-1"
                  style={{ backgroundColor: atracao.cor }}
                />
                <div className="absolute right-0 bottom-0 left-0 p-4">
                  <h3 className="font-heading text-lg leading-tight font-semibold text-white">
                    {atracao.nome}
                  </h3>
                  <p className="font-body mt-1 line-clamp-2 text-xs text-white/70">
                    {atracao.descricao}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* CTA card */}
            <motion.button
              variants={itemVariants}
              whileHover={{ y: -8 }}
              onClick={() =>
                document
                  .querySelector('#contato')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }
              className="group from-brand-purple to-brand-pink relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-2xl bg-linear-to-br p-8 text-center shadow-md transition-shadow hover:shadow-xl"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 transition-transform group-hover:scale-110">
                <ArrowRight size={24} className="text-white" />
              </div>
              <h3 className="font-heading mb-2 text-xl font-bold text-white">
                + mais Atrações
              </h3>
              <p className="font-body text-sm text-white/80">
                Venha descobrir todas as nossas atrações!
              </p>
            </motion.button>
          </motion.div>
        </div>
      </section>

      {selected !== null && (
        <ImageModal
          src={absoluteUrl(selected.imagem?.url) as string}
          alt={selected.nome}
          titulo={selected.nome}
          descricao={selected.descricao}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
