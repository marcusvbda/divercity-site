'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
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
  'https://placehold.co/600x350/FF4F8A/ffffff?text=Decoração+Festa',
  'https://placehold.co/400x300/FFD23F/333333?text=Bolo+Aniversário',
  'https://placehold.co/400x300/9AD94B/ffffff?text=Crianças+Brincando',
  'https://placehold.co/400x300/8E4CCF/ffffff?text=Celebração',
]

export default function Festas() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      id="festas"
      className="section-padding relative overflow-hidden"
      style={{ backgroundColor: '#FFF8E7' }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ backgroundColor: '#FFD23F' }}
      />
      <div
        className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ backgroundColor: '#9AD94B' }}
      />

      <div className="container-max relative z-10">
        <div ref={ref} className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-brand-pink/10 text-brand-pink font-body font-semibold text-sm mb-4">
              🎂 Celebrações Especiais
            </span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-gray-800 mb-5 leading-tight">
              Festas e Aniversários{' '}
              <span className="text-brand-pink">Inesquecíveis!</span>
            </h2>
            <p className="font-body text-gray-600 text-lg leading-relaxed mb-7">
              Transformamos o aniversário do seu filho em um momento mágico. Cuidamos de cada
              detalhe para que você e sua família só precisem curtir a festa.
            </p>

            <ul className="space-y-3 mb-8">
              {PARTY_FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-brand-lime flex-shrink-0" />
                  <span className="font-body text-gray-700 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  document.querySelector('#contato')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="px-8 py-4 rounded-full bg-brand-pink text-white font-body font-bold text-base shadow-lg shadow-pink-500/30 hover:bg-pink-600 transition-colors"
              >
                Solicitar Orçamento
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  document.querySelector('#precos')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="px-8 py-4 rounded-full border-2 border-gray-800 text-gray-800 font-body font-bold text-base hover:bg-gray-800 hover:text-white transition-all"
              >
                Ver Preços
              </motion.button>
            </div>
          </motion.div>

          {/* Right: Image grid */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            className="grid grid-cols-2 gap-3"
          >
            {/* First image spans full width */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative col-span-2 h-52 rounded-2xl overflow-hidden shadow-md"
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
                className="relative h-36 rounded-2xl overflow-hidden shadow-md"
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
