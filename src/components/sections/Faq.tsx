'use client'

import { motion } from 'framer-motion'

import FaqAccordion from '@/components/sections/FaqAccordion'
import type { Faq as FaqItem } from '@/types/faqs'

export default function Faq({ faqs }: { faqs: FaqItem[] }) {
  return (
    <section className="section-padding bg-white">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h1 className="font-heading text-4xl font-bold text-gray-800 md:text-5xl">
            Perguntas frequentes
          </h1>
        </motion.div>

        {faqs.length === 0 ? (
          <p className="font-body text-center text-lg text-gray-500">
            Nenhuma pergunta publicada ainda.
          </p>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl"
          >
            <FaqAccordion faqs={faqs} />
          </motion.div>
        )}
      </div>
    </section>
  )
}
