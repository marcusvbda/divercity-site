import type { Metadata } from 'next'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/sections/Footer'
import OrcamentoWizard from '@/components/orcamento/OrcamentoWizard'
import { getContentType } from '@/lib/cms'

export const metadata: Metadata = {
  title: 'Orçamento de Festa | Divercity Park',
  description:
    'Solicite o orçamento e reserve o salão de festas do Divercity Park online, com pagamento seguro.',
}

export default async function OrcamentoPage() {
  const [navBarContent, FooterContent] = await Promise.all([
    getContentType('NavBar'),
    getContentType('Footer'),
  ])

  return (
    <>
      <Navbar navbar={navBarContent} />
      <main className="pt-16">
        <OrcamentoWizard />
      </main>
      <Footer config={FooterContent} />
    </>
  )
}
