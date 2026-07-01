'use client'

import { motion } from 'framer-motion'
import { Ticket, Lock, QrCode, Clock } from 'lucide-react'
import Link from 'next/link'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
}

const benefits = [
  { icon: Ticket, label: 'Entrada garantida', color: '#FF4F8A' },
  { icon: Lock, label: 'Pagamento seguro', color: '#8E4CCF' },
  { icon: QrCode, label: 'QR Code na entrada', color: '#9AD94B' },
  { icon: Clock, label: 'Cancelamento flexível', color: '#FFD23F' },
]

export default function CompraAntecipada() {
  return (
    <section className="section-padding bg-white">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="bg-brand-purple/5 grid grid-cols-1 items-center gap-10 rounded-3xl p-8 md:p-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16"
        >
          <div>
            <h2 className="font-heading mb-2 text-3xl font-bold text-gray-800 md:text-4xl">
              Compre antecipadamente
            </h2>
            <p className="font-body mb-8 text-lg text-gray-500">
              Evite filas e garanta sua diversão!
            </p>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="mb-6 grid grid-cols-2 gap-4 rounded-2xl bg-white p-6 shadow-sm sm:grid-cols-4"
            >
              {benefits.map(({ icon: Icon, label, color }) => (
                <motion.div
                  key={label}
                  variants={itemVariants}
                  className="flex flex-col items-center gap-2 text-center"
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full"
                    style={{ backgroundColor: color + '1a' }}
                  >
                    <Icon size={20} style={{ color }} />
                  </div>
                  <span className="font-body text-xs font-medium text-gray-600">
                    {label}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            <p className="font-body mb-6 text-xs text-gray-400">
              *Consulte as regras no momento da compra
            </p>

            <Link href="compra-antecipada">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="font-body bg-brand-pink inline-flex items-center gap-2 rounded-full px-8 py-4 text-lg font-bold text-white transition-opacity hover:opacity-90"
              >
                <Ticket size={20} />
                Comprar agora
              </motion.button>
            </Link>
          </div>

          <div className="relative mx-auto hidden aspect-square w-full max-w-sm lg:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://placehold.co/600x600/8E4CCF/fff?text=Divercity+Park"
              alt="Criança se divertindo no Divercity Park"
              className="h-full w-full rounded-3xl object-cover shadow-lg"
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
