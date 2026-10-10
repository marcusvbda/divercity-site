import Navbar from '@/components/ui/Navbar'
import Hero from '@/components/sections/Hero'
import PorQueEscolher from '@/components/sections/PorQueEscolher'
import Festas from '@/components/sections/Festas'
import Precos from '@/components/sections/Precos'
import CompraAntecipada from '@/components/sections/CompraAntecipada'
import Galeria from '@/components/sections/Galeria'
import Depoimentos from '@/components/sections/Depoimentos'
import Contato from '@/components/sections/Contato'
import Atracoes from '@/components/sections/Atracoes'

import Footer from '@/components/sections/Footer'
import { getContentType } from '@/lib/cms'
import { getActivePassportTypes } from '@/lib/passport-types'
import { isFeatureEnabled } from '@/lib/features'

export default async function Home() {
  const [
    navBarContent,
    FooterContent,
    heroContent,
    attractionsContent,
    BenefitsContent,
    PartySection,
    PriceSection,
    AdvancePurchaseSection,
    ContactSection,
    passportTypes,
    advancePurchaseEnabled,
    budgetEnabled,
    instagramCarouselEnabled,
  ] = await Promise.all([
    getContentType('NavBar'),
    getContentType('Footer'),
    getContentType('Hero'),
    getContentType('Attractions'),
    getContentType('BenefitsSection'),
    getContentType('PartySection'),
    getContentType('PriceSection'),
    getContentType('AdvancePurchaseSection'),
    getContentType('ContactSection'),
    getActivePassportTypes(),
    isFeatureEnabled('advance_purchase'),
    isFeatureEnabled('party_budget'),
    isFeatureEnabled('instagram_carousel'),
  ])

  return (
    <>
      <Navbar navbar={navBarContent} budgetEnabled={budgetEnabled} />
      <main>
        <Hero hero={heroContent} />
        <Atracoes attractions={attractionsContent} />
        <PorQueEscolher benefits={BenefitsContent} />
        <Festas partySection={PartySection} budgetEnabled={budgetEnabled} />
        <Precos priceSection={PriceSection} passportTypes={passportTypes} />
        {advancePurchaseEnabled && (
          <CompraAntecipada advancePurchaseSection={AdvancePurchaseSection} />
        )}

        {instagramCarouselEnabled && <Galeria />}
        <Depoimentos />
        <Contato contactSection={ContactSection} />
      </main>
      <Footer config={FooterContent} />
    </>
  )
}
