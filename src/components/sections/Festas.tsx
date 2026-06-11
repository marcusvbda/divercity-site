'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import ImageModal from '@/components/ui/ImageModal'
import CtaButton from '../ui/cta'

type FeatureItem = { id: number; value: string }
type ImageItem   = { id: number; value: string }

export default function Festas({ partySection }: any) {
  const [selectedImg, setSelectedImg] = useState<string | null>(null)

  const badge       = partySection?.Section?.badge?.value       ?? ''
  const title       = partySection?.Section?.title?.value       ?? ''
  const description = partySection?.Section?.description?.value ?? ''
  const features: FeatureItem[] = partySection?.Section?.features ?? []
  const images: ImageItem[]     = partySection?.Media?.images    ?? []
  const ctaBudget   = partySection?.CTAs?.ctaBudget?.value      ?? null
  const ctaPrices   = partySection?.CTAs?.ctaPrices?.value      ?? null

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
              <p className="font-body mb-6 text-lg leading-relaxed text-gray-600">
                {description}
              </p>

              <ul className="mb-8 space-y-3">
                {features.map((f) => (
                  <li key={f.id} className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-brand-lime mt-0.5 shrink-0" />
                    <span className="font-body text-sm text-gray-700">{f.value}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-4 sm:flex-row">
                {ctaBudget && (
                  <CtaButton cta={ctaBudget} className="px-8! py-4! text-lg!">
                    {ctaBudget.label}
                  </CtaButton>
                )}
                {ctaPrices && (
                  <CtaButton cta={ctaPrices} className="px-8! py-4! text-lg!">
                    {ctaPrices.label}
                  </CtaButton>
                )}
              </div>
            </motion.div>

            {/* Right: Image grid */}
            {images.length > 0 && (
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
                  onClick={() => setSelectedImg(images[0].value)}
                  className="col-span-2 h-52 cursor-pointer overflow-hidden rounded-2xl bg-gray-200 shadow-md"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={images[0].value}
                    alt="Decoração de festa"
                    className="h-full w-full object-cover"
                  />
                </motion.div>
                {/* Remaining images side by side */}
                {images.slice(1).map((img, i) => (
                  <motion.div
                    key={img.id}
                    whileHover={{ scale: 1.03 }}
                    onClick={() => setSelectedImg(img.value)}
                    className="h-36 cursor-pointer overflow-hidden rounded-2xl bg-gray-200 shadow-md"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.value}
                      alt={`Festa ${i + 2}`}
                      className="h-full w-full object-cover"
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
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
