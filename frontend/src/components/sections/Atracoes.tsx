'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { ATRACOES } from '@/lib/data'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

export default function Atracoes() {
  return (
    <section id="atracoes" className="section-padding bg-gray-50">
      <div className="container-max">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-cyan/10 text-brand-cyan font-body font-semibold text-sm mb-3">
            Explore o Parque
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Nossas Atrações
          </h2>
          <p className="font-body text-gray-500 text-lg max-w-xl mx-auto">
            Mais de 10 atrações para crianças de todas as idades. Aventura, diversão e segurança
            em um só lugar.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          {ATRACOES.map((atracao) => (
            <motion.div
              key={atracao.id}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer"
            >
              <div className="relative h-52 w-full bg-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={atracao.imagem}
                  alt={atracao.nome}
                  onError={(e) => {
                    e.currentTarget.src = `https://placehold.co/600x400/1a1a2e/ffffff?text=${encodeURIComponent(atracao.nome)}`
                  }}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
              </div>
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: atracao.cor }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-heading text-white text-lg font-semibold leading-tight">
                  {atracao.nome}
                </h3>
                <p className="font-body text-white/70 text-xs mt-1 line-clamp-2">
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
              document.querySelector('#contato')?.scrollIntoView({ behavior: 'smooth' })
            }
            className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow bg-linear-to-br from-brand-purple to-brand-pink flex flex-col items-center justify-center p-8 text-center min-h-52"
          >
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ArrowRight size={24} className="text-white" />
            </div>
            <h3 className="font-heading text-white text-xl font-bold mb-2">+ mais Atrações</h3>
            <p className="font-body text-white/80 text-sm">Venha descobrir todas as nossas atrações!</p>
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
