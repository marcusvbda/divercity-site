import Navbar from '@/components/ui/Navbar'

import Footer from '@/components/sections/Footer'
import { getContentType } from '@/lib/cms'

export default async function CompraAntecipadaPage() {
  const [navBarContent, FooterContent] = await Promise.all([
    getContentType('NavBar'),
    getContentType('Footer'),
  ])

  return (
    <>
      <Navbar navbar={navBarContent} showMenus={false} />
      <main>content here</main>
      <Footer config={FooterContent} />
    </>
  )
}
