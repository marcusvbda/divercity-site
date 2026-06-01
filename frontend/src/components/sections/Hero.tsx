'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

const FLOATING_ELEMENTS = [
  { color: '#12C7C8', size: 80, left: '8%', top: '20%', delay: 0, duration: 3 },
  {
    color: '#8E4CCF',
    size: 60,
    left: '88%',
    top: '15%',
    delay: 0.5,
    duration: 4,
  },
  {
    color: '#FF4F8A',
    size: 100,
    left: '5%',
    top: '70%',
    delay: 1,
    duration: 3.5,
  },
  {
    color: '#9AD94B',
    size: 50,
    left: '92%',
    top: '65%',
    delay: 0.8,
    duration: 2.8,
  },
  {
    color: '#FFD23F',
    size: 70,
    left: '80%',
    top: '45%',
    delay: 0.3,
    duration: 4.2,
  },
  {
    color: '#12C7C8',
    size: 40,
    left: '15%',
    top: '50%',
    delay: 1.2,
    duration: 3.2,
  },
]

interface Props {
  titulo: string
  subtitulo: string
  ctaPrimario?: string
  ctaSecundario?: string
  bgImage?: string
  image?: string
}

export default function Hero({
  titulo,
  subtitulo,
  ctaPrimario,
  ctaSecundario,
  bgImage,
  image,
}: Props) {
  const scrollTo = (href: string) =>
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section
      id="inicio"
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        {}

        <div className="relative h-screen">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bgImage}
            alt="Divercity Park - Parque Indoor"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/75" />
      </div>

      {/* Floating decorative elements */}
      {FLOATING_ELEMENTS.map((el, i) => (
        <motion.div
          key={i}
          className="pointer-events-none absolute rounded-full opacity-25 blur-sm"
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
      <div className="container-max relative z-10 px-4 text-center md:px-8">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-8 flex justify-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt="Divercity Park"
            className="h-48 w-48 drop-shadow-2xl md:h-48 md:w-48"
          />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          className="font-heading mb-6 text-5xl leading-tight font-bold text-white md:text-7xl lg:text-8xl"
        >
          {titulo}
        </motion.h1>

        {/* Supporting text */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
          className="font-body mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-white/85 md:text-xl"
        >
          {subtitulo}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: 'easeOut' }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => scrollTo('#festas')}
            className="bg-brand-pink font-body rounded-full px-8 py-4 text-lg font-bold text-white shadow-lg shadow-pink-500/40 transition-colors hover:bg-pink-600"
          >
            {ctaPrimario ?? 'Reservar Festa'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => scrollTo('#atracoes')}
            className="font-body hover:text-brand-purple rounded-full border-2 border-white px-8 py-4 text-lg font-bold text-white transition-all hover:bg-white"
          >
            {ctaSecundario ?? 'Ver Atrações'}
          </motion.button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
      >
        <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-white/60 pt-1.5">
          <div className="h-3 w-1.5 rounded-full bg-white/80" />
        </div>
      </motion.div>
    </section>
  )
}
