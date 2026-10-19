'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import type { Faq as FaqItem } from '@/types/faqs'

export default function FaqAccordion({ faqs }: { faqs: FaqItem[] }) {
  return (
    <Accordion className="gap-3">
      {faqs.map((faq) => (
        <AccordionItem
          key={faq.id}
          value={String(faq.id)}
          className="rounded-3xl border border-gray-100 bg-white px-5 shadow-sm md:px-7"
        >
          <AccordionTrigger className="font-heading min-h-12 items-center gap-4 py-4 text-base font-semibold text-gray-800 hover:no-underline md:text-lg">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="font-body pb-5 text-base leading-relaxed whitespace-pre-line text-gray-500">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
