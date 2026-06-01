// Server-only — never import this in 'use client' components
// STRAPI_API_TOKEN is a server-side secret, never sent to the browser

const STRAPI_URL = process.env.STRAPI_URL ?? 'http://localhost:1337'
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN ?? ''

export interface StrapiResponse<T> {
  data: T
  meta?: {
    pagination?: { page: number; pageSize: number; pageCount: number; total: number }
  }
}

/**
 * Faz fetch no Strapi CMS autenticado.
 * Lança erro em caso de falha — sem fallback silencioso.
 */
export async function fetchCMS<T>(
  path: string,
  options?: RequestInit & { next?: { revalidate?: number } }
): Promise<T> {
  const url = `${STRAPI_URL}/api${path}`

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${STRAPI_TOKEN}`,
      ...(options?.headers ?? {}),
    },
    next: options?.next ?? { revalidate: 3600 },
  })

  if (!res.ok) {
    throw new Error(`[CMS] ${res.status} ${res.statusText} — ${path}`)
  }

  const json: StrapiResponse<T> = await res.json()
  return json.data
}

// ---- Typed helpers ----

export async function getCMSConfig() {
  return fetchCMS<CMSConfiguracaoSite>(
    '/configuracao-site?populate[festas_features]=true&populate[festas_imagens]=true&populate[beneficios_destaque]=true'
  )
}

export async function getCMSSiteMetadata() {
  return fetchCMS<CMSSiteMetadata>('/site-metadata')
}

export async function getCMSAtracoes() {
  return fetchCMS<CMSAtracao[]>(
    '/atracoes?sort=ordem:asc&populate[imagem]=true&filters[publishedAt][$notNull]=true&pagination[pageSize]=20'
  )
}

export async function getCMSBeneficios() {
  return fetchCMS<CMSBeneficio[]>(
    '/beneficios?sort=ordem:asc&filters[publishedAt][$notNull]=true&pagination[pageSize]=20'
  )
}

export async function getCMSPrecos() {
  return fetchCMS<CMSPreco[]>(
    '/precos?sort=ordem:asc&populate[tiers]=true&filters[publishedAt][$notNull]=true&pagination[pageSize]=20'
  )
}

export async function getCMSPriceDisclaimers() {
  return fetchCMS<CMSPriceDisclaimer[]>(
    '/price-disclaimers?sort=ordem:asc&populate[linhas]=true&filters[publishedAt][$notNull]=true&pagination[pageSize]=20'
  )
}

export async function getCMSDepoimentos() {
  return fetchCMS<CMSDepoimento[]>(
    '/depoimentos?populate[avatar]=true&filters[publishedAt][$notNull]=true&pagination[pageSize]=10'
  )
}

// ---- TypeScript interfaces ----

export interface CMSFeatureItem {
  id: number
  texto: string
}

export interface CMSBeneficioDestaque {
  id: number
  iconeName: string
  titulo: string
  descricao: string
  cor: string
}

export interface CMSConfiguracaoSite {
  id: number
  documentId: string
  whatsapp_number: string
  instagram_url: string
  instagram_access_token?: string
  google_places_api_key?: string
  google_place_id?: string
  endereco: string
  horario_semana: string
  horario_feriado: string
  google_maps_url: string
  waze_url: string
  hero_titulo: string
  hero_subtitulo: string
  festas_features: CMSFeatureItem[]
  festas_imagens: Array<{ id: number; url: string; width?: number; height?: number; alternativeText?: string | null }>
  hero_cta_primario?: string
  hero_cta_secundario?: string
  atracoes_badge?: string
  atracoes_titulo?: string
  atracoes_subtitulo?: string
  beneficios_destaque?: CMSBeneficioDestaque[]
  festas_badge?: string
  festas_titulo?: string
  festas_titulo_destaque?: string
  festas_descricao?: string
  festas_cta_orcamento?: string
  festas_cta_precos?: string
  precos_badge?: string
  precos_titulo?: string
  precos_subtitulo?: string
  contato_badge?: string
  contato_titulo?: string
  contato_subtitulo?: string
  contato_cta?: string
  por_que_badge?: string
  por_que_titulo?: string
  por_que_titulo_destaque?: string
  por_que_subtitulo?: string
  footer_copyright?: string
}

export interface CMSSiteMetadata {
  id: number
  documentId: string
  titulo: string
  descricao: string
  keywords?: string
  og_titulo?: string
  og_descricao?: string
  og_imagem?: { url: string; width: number; height: number } | null
}

export interface CMSAtracao {
  id: number
  documentId: string
  nome: string
  descricao: string
  cor: string
  ordem: number
  imagem?: { url: string; width: number; height: number } | null
}

export interface CMSBeneficio {
  id: number
  documentId: string
  titulo: string
  descricao: string
  iconeName: string
  gradiente: string
  ordem: number
}

export interface CMSTier {
  id: number
  label: string
  valor: number
  acompanhante: number
}

export interface CMSPreco {
  id: number
  documentId: string
  titulo: string
  subtitulo?: string
  cor: string
  ordem: number
  tiers: CMSTier[]
}

export interface CMSLinha {
  id: number
  texto: string
}

export interface CMSPriceDisclaimer {
  id: number
  documentId: string
  emoji: string
  titulo: string
  ordem: number
  linhas: CMSLinha[]
}

export interface CMSDepoimento {
  id: number
  documentId: string
  nome: string
  estrelas: number
  texto: string
  avatar?: { url: string } | null
}
