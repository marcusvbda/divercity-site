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
  getCMSPriceDisclaimers,
} from '@/lib/cms'

export default async function Home() {
  const [config, atracoes, beneficios, precos, disclaimers] = await Promise.all(
    [
      getCMSConfig(),
      getCMSAtracoes(),
      getCMSBeneficios(),
      getCMSPrecos(),
      getCMSPriceDisclaimers(),
    ]
  )

  console.log(config.partySection)

  // // Normaliza URLs das imagens das festas — filtra itens sem URL válida
  // const festasImagens = (config.festas_imagens ?? [])
  //   .map((img: any) => ({ ...img, url: absoluteUrl(img.url) ?? '' }))
  //   .filter((img: any) => img.url.length > 0)

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
        {/*   <Precos
          precos={precos}
          disclaimers={disclaimers}
          badge={config.precos_badge}
          titulo={config.precos_titulo}
          subtitulo={config.precos_subtitulo}
        />
        <Galeria />
        <Depoimentos />
        <Contato
          config={config}
          badge={config.contato_badge}
          titulo={config.contato_titulo}
          subtitulo={config.contato_subtitulo}
          ctaLabel={config.contato_cta}
        /> */}
      </main>
      <Footer config={config} copyright={config.footer_copyright} />
    </>
  )
}
