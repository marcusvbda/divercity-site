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

const STRAPI_URL = process.env.STRAPI_URL ?? 'http://localhost:1337'

/** Converte URL relativa do Strapi (/uploads/...) em absoluta */
function absoluteUrl(url: string | undefined | null): string | null {
  if (!url) return null
  if (url.startsWith('http')) return url
  return `${STRAPI_URL}${url}`
}

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
    imagem: a.imagem
      ? { ...a.imagem, url: absoluteUrl(a.imagem.url) ?? '' }
      : null,
  }))

  const configNormalized = {
    ...config,
    navbar_logo: config.navbar_logo
      ? {
          ...config.navbar_logo,
          url: absoluteUrl(config.navbar_logo.url) ?? '',
        }
      : null,
    hero_bg: config.hero_bg
      ? {
          ...config.hero_bg,
          url: absoluteUrl(config.hero_bg.url) ?? '',
        }
      : null,
    hero_image: config.hero_image
      ? {
          ...config.hero_image,
          url: absoluteUrl(config.hero_image.url) ?? '',
        }
      : null,
  }

  // Normaliza URLs das imagens das festas — filtra itens sem URL válida
  const festasImagens = (config.festas_imagens ?? [])
    .map((img) => ({ ...img, url: absoluteUrl(img.url) ?? '' }))
    .filter((img) => img.url.length > 0)

  return (
    <>
      <Navbar
        logo={
          configNormalized?.navbar_logo?.url ??
          'https://placehold.co/600x400/1a1a2e/ffffff?text=logo'
        }
      />
      <main>
        <Hero
          titulo={configNormalized.hero_titulo}
          subtitulo={configNormalized.hero_subtitulo}
          ctaPrimario={configNormalized.hero_cta_primario ?? 'Reservar Festa'}
          ctaSecundario={configNormalized.hero_cta_secundario ?? 'Ver Atrações'}
          bgImage={
            configNormalized?.hero_bg?.url ??
            'https://placehold.co/600x400/1a1a2e/ffffff?text=hero-bg'
          }
          image={
            configNormalized?.hero_image?.url ??
            'https://placehold.co/600x400/1a1a2e/ffffff?text=hero-image'
          }
        />
        <Benefits
          beneficiosDestaque={configNormalized.beneficios_destaque ?? []}
        />
        <Atracoes
          atracoes={atracoesNormalized}
          badge={configNormalized.atracoes_badge}
          titulo={configNormalized.atracoes_titulo}
          subtitulo={configNormalized.atracoes_subtitulo}
        />
        <PorQueEscolher
          beneficios={beneficios}
          badge={configNormalized.por_que_badge}
          titulo={configNormalized.por_que_titulo}
          tituloDestaque={configNormalized.por_que_titulo_destaque}
          subtitulo={configNormalized.por_que_subtitulo}
        />
        <Festas
          features={configNormalized.festas_features}
          imagens={festasImagens}
          badge={configNormalized.festas_badge}
          titulo={configNormalized.festas_titulo}
          tituloDestaque={configNormalized.festas_titulo_destaque}
          descricao={configNormalized.festas_descricao}
          ctaOrcamento={configNormalized.festas_cta_orcamento}
          ctaPrecos={configNormalized.festas_cta_precos}
        />
        <Precos
          precos={precos}
          disclaimers={disclaimers}
          badge={configNormalized.precos_badge}
          titulo={configNormalized.precos_titulo}
          subtitulo={configNormalized.precos_subtitulo}
        />
        <Galeria />
        <Depoimentos />
        <Contato
          config={configNormalized}
          badge={configNormalized.contato_badge}
          titulo={configNormalized.contato_titulo}
          subtitulo={configNormalized.contato_subtitulo}
          ctaLabel={configNormalized.contato_cta}
        />
      </main>
      <Footer
        config={configNormalized}
        copyright={configNormalized.footer_copyright}
      />
    </>
  )
}
