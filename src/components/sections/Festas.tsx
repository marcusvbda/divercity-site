'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import ImageModal from '@/components/ui/ImageModal'
import { absoluteUrl } from '@/lib/helpers'
import CtaButton from '../ui/cta'

export default function Festas({ partySection }: any) {
  const partyImages =
    (partySection?.decorations ?? []).length > 0
      ? partySection?.decorations
      : []
  const [selectedImg, setSelectedImg] = useState<string | null>(null)
  const badge = partySection?.badge ?? ''
  const title = partySection?.title ?? ''
  const description = partySection?.description ?? ''
  const features = partySection?.features ?? []
  const ctaOrcamento = partySection?.ctaOrcamento ?? {}
  const ctaPrices = partySection?.ctaPrices ?? {}

  return (
    <>
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
                {badge}
              </span>
              <h2 className="font-heading mb-5 text-4xl leading-tight font-bold text-gray-800 md:text-5xl">
                {title}
              </h2>
              <p className="font-body mb-2 text-lg leading-relaxed text-gray-600">
                {description}
              </p>

              <ul className="mb-8 space-y-3">
                {(features ?? []).map((f: any) => (
                  <li key={f.id} className="flex items-center gap-3">
                    <CheckCircle2
                      size={20}
                      className="text-brand-lime flex-shrink-0"
                    />
                    <span className="font-body text-sm text-gray-700">
                      {f.texto}
                    </span>
                  </li>
                ))}
              </ul>

              <p className="font-body mb-6 text-sm leading-relaxed text-gray-500 italic">
                💳 Pagamento facilitado no Pix ou Cartão. Viva momentos
                inesquecíveis com nossas atrações, salão exclusivo e espaço
                acolhedor para os pais!
              </p>

              <div className="flex flex-col gap-4 sm:flex-row">
                {ctaOrcamento?.id && (
                  <CtaButton
                    onClick={() => scrollTo(ctaOrcamento?.href)}
                    cta={ctaOrcamento}
                    className="px-8! py-4! text-lg!"
                  >
                    {ctaOrcamento?.label}
                  </CtaButton>
                )}
                {ctaPrices?.id && (
                  <CtaButton
                    onClick={() => scrollTo(ctaPrices?.href)}
                    cta={ctaPrices}
                    className="px-8! py-4! text-lg!"
                  >
                    {ctaPrices?.label}
                  </CtaButton>
                )}
                {/* <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    document
                      .querySelector('#contato')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                  className="bg-brand-pink font-body rounded-full px-8 py-4 text-base font-bold text-white shadow-lg shadow-pink-500/30 transition-colors hover:bg-pink-600"
                >
                  {ctaOrcamento ?? 'Faça já o seu orçamento'}
                </motion.button> */}
                {/* <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    document
                      .querySelector('#precos')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                  className="font-body hover:border-brand-pink hover:text-brand-pink rounded-full border-2 border-gray-300 px-8 py-4 text-base font-bold text-gray-700 transition-all"
                >
                  {ctaPrices ?? 'Ver Preços'}
                </motion.button> */}
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
              {partyImages[0] && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onClick={() =>
                    setSelectedImg(absoluteUrl(partyImages[0].url))
                  }
                  className="col-span-2 h-52 cursor-pointer overflow-hidden rounded-2xl bg-gray-200 shadow-md"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={absoluteUrl(partyImages[0].url) as string}
                    alt={partyImages[0].alternativeText ?? 'Decoração de festa'}
                    className="h-full w-full object-cover"
                  />
                </motion.div>
              )}
              {/* Remaining images side by side */}
              {partyImages.slice(1).map((img: any, i: any) => (
                <motion.div
                  key={img.id}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => setSelectedImg(absoluteUrl(img.url) as string)}
                  className="h-36 cursor-pointer overflow-hidden rounded-2xl bg-gray-200 shadow-md"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={absoluteUrl(img.url) as string}
                    alt={img.alternativeText ?? `Festa ${i + 2}`}
                    className="h-full w-full object-cover"
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {selectedImg !== null && (
        <ImageModal
          src={selectedImg}
          alt="Foto da festa"
          onClose={() => setSelectedImg(null)}
        />
      )}
    </>
  )
}
