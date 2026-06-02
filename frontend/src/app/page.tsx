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
import {
  getCMSConfig,
  getCMSAtracoes,
  getCMSBeneficios,
  getCMSPrecos,
} from '@/lib/cms'

export default async function Home() {
  const [config, atracoes, beneficios, precos] = await Promise.all([
    getCMSConfig(),
    getCMSAtracoes(),
    getCMSBeneficios(),
    getCMSPrecos(),
  ])

  return (
    <>
      <Navbar navbar={config?.navbar ?? {}} />
      <main>
        <Hero hero={config?.hero ?? {}} />
        <Atracoes
          attractionSection={config?.attractionSection ?? {}}
          atracoes={atracoes}
        />
        <PorQueEscolher
          beneficios={beneficios}
          benefitSection={config?.benefitSection ?? {}}
        />
        <Festas partySection={config?.partySection ?? {}} />
        <Precos precos={precos} priceSection={config?.priceSection} />
        <Galeria />
        <Depoimentos />
        <Contato
          config={config}
          contactSection={config?.contactSection ?? {}}
        />
      </main>
      <Footer config={config} />
    </>
  )
}
