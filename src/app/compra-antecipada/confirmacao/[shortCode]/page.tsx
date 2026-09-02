import type { Metadata } from 'next'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/sections/Footer'
import ConfirmationView from '@/components/checkout/ConfirmationView'
import { getContentType } from '@/lib/cms'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function CompraAntecipadaConfirmacaoPage({
  params,
}: {
  params: Promise<{ shortCode: string }>
}) {
  const { shortCode } = await params
  const [navBarContent, footerContent] = await Promise.all([
    getContentType('NavBar'),
    getContentType('Footer'),
  ])

  return (
    <>
      <Navbar navbar={navBarContent}>
        <div className="flex w-full items-center gap-2">
          <span className="bg-brand-lime h-2 w-2 rotate-45 md:h-2.5 md:w-2.5" />
          <p className="font-heading text-sm leading-tight font-bold text-gray-900 md:text-lg">
            Confirmação da compra
          </p>
        </div>
      </Navbar>
      <main className="bg-gray-50 pt-24 pb-16">
        <div className="container-max px-4">
          <ConfirmationView shortCode={shortCode} />
        </div>
      </main>
      <Footer config={footerContent} />
    </>
  )
}
