'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { CheckCircle2 } from 'lucide-react'

const PARTY_FEATURES = [
  'Decoração temática personalizada',
  'Buffet completo para crianças e adultos',
  'Animadores e recreadores especializados',
  'Acesso exclusivo às atrações do parque',
  'Sala de festas climatizada e moderna',
  'Cardápio especial de aniversário',
]

const PARTY_IMAGES = [
  '/salao-de-festas.png',
  '/dbz.png',
  '/f1.png',
  '/futebol.png',
]

export default function Festas() {
  return (
    <section
      id="festas"
      className="section-padding relative overflow-hidden"
      style={{ backgroundColor: '#FFF8E7' }}
    >
      {/* Decorative blobs */}
      <div
        className="pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full opacity-20 blur-3xl"
        style={{ backgroundColor: '#FFD23F' }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 rounded-full opacity-20 blur-3xl"
        style={{ backgroundColor: '#9AD94B' }}
      />

      <div className="container-max relative z-10">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <span className="bg-brand-pink/10 text-brand-pink font-body mb-4 inline-block rounded-full px-4 py-1.5 text-sm font-semibold">
              🎂 Celebrações Especiais
            </span>
            <h2 className="font-heading mb-5 text-4xl leading-tight font-bold text-gray-800 md:text-5xl">
              Festas e Aniversários{' '}
              <span className="text-brand-pink">Inesquecíveis!</span>
            </h2>
            <p className="font-body mb-7 text-lg leading-relaxed text-gray-600">
              Transformamos o aniversário do seu filho em um momento mágico.
              Cuidamos de cada detalhe para que você e sua família só precisem
              curtir a festa.
            </p>

            <ul className="mb-8 space-y-3">
              {PARTY_FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <CheckCircle2
                    size={20}
                    className="text-brand-lime flex-shrink-0"
                  />
                  <span className="font-body text-sm text-gray-700">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-4 sm:flex-row">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  document
                    .querySelector('#contato')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
                className="bg-brand-pink font-body rounded-full px-8 py-4 text-base font-bold text-white shadow-lg shadow-pink-500/30 transition-colors hover:bg-pink-600"
              >
                Solicitar Orçamento
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  document
                    .querySelector('#precos')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
                className="font-body rounded-full border-2 border-gray-800 px-8 py-4 text-base font-bold text-gray-800 transition-all hover:bg-gray-800 hover:text-white"
              >
                Ver Preços
              </motion.button>
            </div>
          </motion.div>

          {/* Right: Image grid */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            className="grid grid-cols-2 gap-3"
          >
            {/* First image spans full width */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative col-span-2 h-52 overflow-hidden rounded-2xl shadow-md"
            >
              <Image
                src={PARTY_IMAGES[0]}
                alt="Decoração de festa"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </motion.div>
            {/* Remaining 3 images side by side */}
            {PARTY_IMAGES.slice(1).map((src, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.03 }}
                className="relative h-36 overflow-hidden rounded-2xl shadow-md"
              >
                <Image
                  src={src}
                  alt={`Festa ${i + 2}`}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
