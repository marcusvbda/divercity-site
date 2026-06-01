'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

const FLOATING_ELEMENTS = [
  { color: '#12C7C8', size: 80, left: '8%', top: '20%', delay: 0, duration: 3 },
  { color: '#8E4CCF', size: 60, left: '88%', top: '15%', delay: 0.5, duration: 4 },
  { color: '#FF4F8A', size: 100, left: '5%', top: '70%', delay: 1, duration: 3.5 },
  { color: '#9AD94B', size: 50, left: '92%', top: '65%', delay: 0.8, duration: 2.8 },
  { color: '#FFD23F', size: 70, left: '80%', top: '45%', delay: 0.3, duration: 4.2 },
  { color: '#12C7C8', size: 40, left: '15%', top: '50%', delay: 1.2, duration: 3.2 },
]

export default function Hero() {
  const scrollTo = (href: string) =>
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://placehold.co/1920x1080/1a1a2e/12C7C8?text=Divercity+Park"
          alt="Divercity Park - Parque Indoor"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/75" />
      </div>

      {/* Floating decorative elements */}
      {FLOATING_ELEMENTS.map((el, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full opacity-25 blur-sm pointer-events-none"
          style={{
            backgroundColor: el.color,
            width: el.size,
            height: el.size,
            left: el.left,
            top: el.top,
          }}
          animate={{ y: [0, -20, 0] }}
          transition={{
            duration: el.duration,
            delay: el.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 container-max px-4 md:px-8 text-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex justify-center mb-8"
        >
          <Image
            src="/logo-ball.png"
            alt="Divercity Park"
            width={160}
            height={160}
            className="w-28 h-28 md:w-40 md:h-40 drop-shadow-2xl"
            priority
          />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight"
        >
          Diversão para{' '}
          <span className="text-brand-cyan">toda a família</span>
        </motion.h1>

        {/* Supporting text */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
          className="font-body text-lg md:text-xl text-white/85 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Mais de 10 atrações incríveis, festas personalizadas inesquecíveis e um ambiente
          seguro e acolhedor para toda a família criar memórias juntos.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => scrollTo('#festas')}
            className="px-8 py-4 rounded-full bg-brand-pink text-white font-body font-bold text-lg shadow-lg shadow-pink-500/40 hover:bg-pink-600 transition-colors"
          >
            Reservar Festa
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => scrollTo('#atracoes')}
            className="px-8 py-4 rounded-full border-2 border-white text-white font-body font-bold text-lg hover:bg-white hover:text-brand-purple transition-all"
          >
            Ver Atrações
          </motion.button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/60 flex items-start justify-center pt-1.5">
          <div className="w-1.5 h-3 rounded-full bg-white/80" />
        </div>
      </motion.div>
    </section>
  )
}
