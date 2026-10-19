import { Suspense } from 'react'
import type { Metadata } from 'next'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/sections/Footer'
import Faq from '@/components/sections/Faq'
import { getContentType } from '@/lib/cms'
import { getBusinessHours } from '@/lib/business-hours'
import { getPublishedFaqsOrEmpty } from '@/lib/faqs'
import { getPageMetadata } from '@/lib/seo'

export const metadata: Metadata = getPageMetadata({
  title: 'Perguntas frequentes',
  path: '/faq',
})

async function FaqList() {
  const faqs = await getPublishedFaqsOrEmpty('faq')
  return <Faq faqs={faqs} />
}

function FaqFallback() {
  return (
    <section className="section-padding bg-white">
      <div className="container-max mx-auto max-w-3xl space-y-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-3xl bg-gray-100" />
        ))}
      </div>
    </section>
  )
}

export default async function FaqPage() {
  const [navBarContent, FooterContent, businessHours] = await Promise.all([
    getContentType('NavBar'),
    getContentType('Footer'),
    getBusinessHours(),
  ])

  return (
    <>
      <Navbar navbar={navBarContent} />
      <main className="pt-16">
        <Suspense fallback={<FaqFallback />}>
          <FaqList />
        </Suspense>
      </main>
      <Footer config={FooterContent} businessHours={businessHours} />
    </>
  )
}
