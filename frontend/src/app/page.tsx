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
import {
  getCMSConfig,
  getCMSAtracoes,
  getCMSBeneficios,
  getCMSPrecos,
  getCMSPriceDisclaimers,
} from '@/lib/cms'
import { absoluteUrl } from '@/lib/helpers'

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

  // Normaliza URLs das imagens das atrações
  const atracoesNormalized = atracoes.map((a) => ({
    ...a,
    // imagem: a.imagem
    //   ? { ...a.imagem, url: absoluteUrl(a.imagem.url) ?? '' }
    //   : null,
  }))

  // Normaliza URLs das imagens das festas — filtra itens sem URL válida
  const festasImagens = (config.festas_imagens ?? [])
    .map((img: any) => ({ ...img, url: absoluteUrl(img.url) ?? '' }))
    .filter((img: any) => img.url.length > 0)

  return (
    <>
      <Navbar navbar={config?.navbar ?? {}} />
      <main>
        <Hero
          hero={config?.hero ?? {}}
          titulo={config.hero_titulo}
          subtitulo={config.hero_subtitulo}
          ctaPrimario={config.hero_cta_primario ?? 'Reservar Festa'}
          ctaSecundario={config.hero_cta_secundario ?? 'Ver Atrações'}
          bgImage={
            config?.hero_bg?.url ??
            'https://placehold.co/600x400/1a1a2e/ffffff?text=hero-bg'
          }
          image={
            config?.hero_image?.url ??
            'https://placehold.co/600x400/1a1a2e/ffffff?text=hero-image'
          }
        />
        <Benefits beneficiosDestaque={config.beneficios_destaque ?? []} />
        <Atracoes
          atracoes={atracoesNormalized}
          badge={config.atracoes_badge}
          titulo={config.atracoes_titulo}
          subtitulo={config.atracoes_subtitulo}
        />
        <PorQueEscolher
          beneficios={beneficios}
          badge={config.por_que_badge}
          titulo={config.por_que_titulo}
          tituloDestaque={config.por_que_titulo_destaque}
          subtitulo={config.por_que_subtitulo}
        />
        <Festas
          features={config.festas_features}
          imagens={festasImagens}
          badge={config.festas_badge}
          titulo={config.festas_titulo}
          tituloDestaque={config.festas_titulo_destaque}
          descricao={config.festas_descricao}
          ctaOrcamento={config.festas_cta_orcamento}
          ctaPrecos={config.festas_cta_precos}
        />
        <Precos
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
        />
      </main>
      <Footer config={config} copyright={config.footer_copyright} />
    </>
  )
}
