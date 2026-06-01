import Navbar from '@/components/ui/Navbar'
import Hero from '@/components/sections/Hero'
import Benefits from '@/components/sections/Benefits'
import Atracoes from '@/components/sections/Atracoes'
import PorQueEscolher from '@/components/sections/PorQueEscolher'
import Festas from '@/components/sections/Festas'
import Precos from '@/components/sections/Precos'
import Galeria from '@/components/sections/Galeria'
import Depoimentos from '@/components/sections/Depoimentos'
import Contato from '@/components/sections/Contato'
import Footer from '@/components/sections/Footer'

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Benefits />
        <Atracoes />
        <PorQueEscolher />
        <Festas />
        <Precos />
        <Galeria />
        <Depoimentos />
        <Contato />
      </main>
      <Footer />
    </>
  )
}
