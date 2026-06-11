import Navbar from '@/components/ui/Navbar'
import Hero from '@/components/sections/Hero'
import PorQueEscolher from '@/components/sections/PorQueEscolher'
import Festas from '@/components/sections/Festas'
import Precos from '@/components/sections/Precos'
import Galeria from '@/components/sections/Galeria'
import Depoimentos from '@/components/sections/Depoimentos'
import Contato from '@/components/sections/Contato'
import Atracoes from '@/components/sections/Atracoes'

import Footer from '@/components/sections/Footer'
import { getContentType } from '@/lib/cms'

export default async function Home() {
  const [navBarContent, heroContent, attractionsContent] = await Promise.all([
    getContentType('NavBar'),
    getContentType('Hero'),
    getContentType('Attractions'),
  ])

  return (
    <>
      <Navbar navbar={navBarContent} />
      <main>
        <Hero hero={heroContent} />
        <Atracoes attractions={attractionsContent} />
        {/* <PorQueEscolher
          beneficios={beneficios}
          benefitSection={config?.benefitSection ?? {}}
        /> */}
        {/* <Festas partySection={config?.partySection ?? {}} /> */}
        {/* <Precos precos={precos} priceSection={config?.priceSection} /> */}
        <Galeria />
        <Depoimentos />
        {/* <Contato
          config={config}
          contactSection={config?.contactSection ?? {}}
        /> */}
      </main>
      {/* <Footer config={config} /> */}
    </>
  )
}
