import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/sections/Footer'
import PartyStatusMessage from '@/components/orcamento/PartyStatusMessage'
import { getContentType } from '@/lib/cms'

export const metadata: Metadata = {
  title: 'Reserva Confirmada | Divercity Park',
}

async function PartyMessage({
  searchParams,
}: {
  searchParams: Promise<{ party?: string; session_id?: string }>
}) {
  const { party, session_id } = await searchParams

  return <PartyStatusMessage partyId={party} sessionId={session_id} />
}

export default async function OrcamentoSucessoPage({
  searchParams,
}: {
  searchParams: Promise<{ party?: string; session_id?: string }>
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
              <Suspense
                fallback={
                  <p className="font-body text-lg text-gray-600">Carregando status da sua reserva...</p>
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
