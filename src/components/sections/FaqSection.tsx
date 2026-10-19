'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

import FaqAccordion from '@/components/sections/FaqAccordion'
import type { Faq } from '@/types/faqs'

const MAX_FAQS = 6

type CMSValue = { id: number; value: string | null } | null | undefined

export default function FaqSection({
  faqSection,
  faqs,
}: {
  faqSection: any
  faqs: Faq[]
}) {
  if (faqs.length === 0) return null

  const section = (faqSection?.Section ?? {}) as Record<string, CMSValue>
  const badge = section.badge?.value ?? ''
  const title = section.title?.value ?? ''
  const subtitle = section.subtitle?.value ?? ''
  const ctaLabel = section.ctaLabel?.value ?? ''
  const hasHeader = Boolean(badge || title || subtitle)

  return (
    <section className="section-padding bg-white">
      <div className="container-max">
        {hasHeader && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            {badge && (
              <span className="bg-brand-purple/10 text-brand-purple font-body mb-3 inline-block rounded-full px-4 py-1.5 text-sm font-semibold">
                {badge}
              </span>
            )}
            {title && (
              <h2 className="font-heading mb-4 text-4xl font-bold text-gray-800 md:text-5xl">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="font-body mx-auto max-w-xl text-lg text-gray-500">
                {subtitle}
              </p>
            )}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl"
        >
          <FaqAccordion faqs={faqs.slice(0, MAX_FAQS)} />

          {faqs.length > MAX_FAQS && ctaLabel && (
            <div className="mt-8 flex justify-center">
              <Link
                href="/faq"
                className="bg-brand-purple font-body inline-flex min-h-12 w-full items-center justify-center rounded-full px-8 py-3 text-base font-bold text-white transition-all hover:scale-105 active:scale-95 sm:w-auto"
              >
                {ctaLabel}
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
