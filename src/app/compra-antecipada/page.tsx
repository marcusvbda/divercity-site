import Navbar from '@/components/ui/Navbar'

import Footer from '@/components/sections/Footer'
import CompraAntecipadaCheckout from '@/components/checkout/CompraAntecipadaCheckout'
import { getContentType } from '@/lib/cms'

export default async function CompraAntecipadaPage() {
  const [navBarContent, FooterContent] = await Promise.all([
    getContentType('NavBar'),
    getContentType('Footer'),
  ])

  return (
    <>
      <Navbar navbar={navBarContent} hideContent={true} />
      <main className="pt-16">
        <CompraAntecipadaCheckout />
      </main>
      <Footer config={FooterContent} />
    </>
  )
}
