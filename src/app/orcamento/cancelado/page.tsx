import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/sections/Footer'
import { getContentType } from '@/lib/cms'

export const metadata: Metadata = {
  title: 'Pagamento não concluído | Divercity Park',
}

export default async function OrcamentoCanceladoPage() {
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
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                <AlertCircle size={32} className="text-red-500" />
              </div>
              <h1 className="font-heading mb-4 text-3xl font-bold text-gray-800 md:text-4xl">
                Pagamento não concluído
              </h1>
              <p className="font-body text-lg text-gray-600">
                Sua reserva continua pendente — você pode tentar novamente ou entrar em contato
                conosco.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/orcamento"
                  className="bg-brand-pink font-body rounded-full px-8 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
                >
                  Tentar novamente
                </Link>
                <Link
                  href="/#contato"
                  className="font-body border-brand-pink text-brand-pink rounded-full border-2 px-8 py-3 text-sm font-bold transition-opacity hover:opacity-90"
                >
                  Falar conosco
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer config={FooterContent} />
    </>
  )
}
