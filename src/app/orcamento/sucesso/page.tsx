import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/sections/Footer'
import { getContentType } from '@/lib/cms'

export const metadata: Metadata = {
  title: 'Reserva Confirmada | Divercity Park',
}

async function PartyMessage({
  searchParams,
}: {
  searchParams: Promise<{ party?: string }>
}) {
  const { party } = await searchParams

  return (
    <p className="font-body text-lg text-gray-600">
      {party
        ? `Recebemos sua reserva #${party}! Em breve entraremos em contato para os próximos passos (confirmação e assinatura do contrato).`
        : 'Recebemos sua reserva! Em breve entraremos em contato para os próximos passos (confirmação e assinatura do contrato).'}
    </p>
  )
}

export default async function OrcamentoSucessoPage({
  searchParams,
}: {
  searchParams: Promise<{ party?: string }>
}) {
  const [navBarContent, FooterContent] = await Promise.all([
    getContentType('NavBar'),
    getContentType('Footer'),
  ])

  return (
    <>
      <Navbar navbar={navBarContent} />
      <main className="pt-16">
        <section className="section-padding bg-gray-50">
          <div className="container-max">
            <div className="mx-auto flex max-w-xl flex-col items-center rounded-2xl bg-white p-8 text-center shadow-sm md:p-12">
              <div className="bg-brand-lime/10 mb-6 flex h-16 w-16 items-center justify-center rounded-full">
                <CheckCircle2 size={32} className="text-brand-lime" />
              </div>
              <h1 className="font-heading mb-4 text-3xl font-bold text-gray-800 md:text-4xl">
                Reserva recebida!
              </h1>
              <Suspense
                fallback={
                  <p className="font-body text-lg text-gray-600">
                    Recebemos sua reserva! Em breve entraremos em contato para os próximos passos
                    (confirmação e assinatura do contrato).
                  </p>
                }
              >
                <PartyMessage searchParams={searchParams} />
              </Suspense>
              <Link
                href="/"
                className="bg-brand-pink font-body mt-8 rounded-full px-8 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
              >
                Voltar para a home
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer config={FooterContent} />
    </>
  )
}
