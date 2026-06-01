'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Star } from 'lucide-react'
import { DEPOIMENTOS } from '@/lib/data'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
}

export default function Depoimentos() {
  return (
    <section className="section-padding bg-gray-50">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-yellow/20 text-yellow-700 font-body font-semibold text-sm mb-3">
            ⭐ Avaliações
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            O que nossos clientes dizem
          </h2>
          <p className="font-body text-gray-500 text-lg max-w-xl mx-auto">
            Famílias felizes são nossa maior conquista.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {DEPOIMENTOS.map((dep) => (
            <motion.div
              key={dep.id}
              variants={itemVariants}
              whileHover={{ y: -6 }}
              className="bg-white rounded-3xl p-7 shadow-md hover:shadow-xl transition-shadow"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: dep.estrelas }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="fill-brand-yellow text-brand-yellow"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="font-body text-gray-600 text-sm leading-relaxed mb-6 italic">
                &ldquo;{dep.texto}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={dep.avatar}
                    alt={dep.nome}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-body font-semibold text-gray-800 text-sm">{dep.nome}</p>
                  <p className="font-body text-gray-400 text-xs">Cliente verificado</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
