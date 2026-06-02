// Server-only — never import this in 'use client' components
// STRAPI_API_TOKEN is a server-side secret, never sent to the browser

const STRAPI_URL = process.env.STRAPI_URL ?? 'http://localhost:1337'
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN ?? ''

export interface StrapiResponse<T> {
  data: T
  meta?: {
    pagination?: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
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
  return fetchCMS<any>(
    '/configuracao-site?populate[navbar][populate]=*&populate[hero][populate]=*'
  )
}

export async function getCMSSiteMetadata() {
  return fetchCMS<any>('/site-metadata')
}

export async function getCMSAtracoes() {
  return fetchCMS<any[]>(
    '/atracoes?sort=ordem:asc&populate[imagem]=true&filters[publishedAt][$notNull]=true&pagination[pageSize]=20'
  )
}

export async function getCMSBeneficios() {
  return fetchCMS<any[]>(
    '/beneficios?sort=ordem:asc&filters[publishedAt][$notNull]=true&pagination[pageSize]=20'
  )
}

export async function getCMSPrecos() {
  return fetchCMS<any[]>(
    '/precos?sort=ordem:asc&populate[tiers]=true&filters[publishedAt][$notNull]=true&pagination[pageSize]=20'
  )
}

export async function getCMSPriceDisclaimers() {
  return fetchCMS<any[]>(
    '/price-disclaimers?sort=ordem:asc&populate[linhas]=true&filters[publishedAt][$notNull]=true&pagination[pageSize]=20'
  )
}

export async function getCMSDepoimentos() {
  return fetchCMS<any[]>(
    '/depoimentos?populate[avatar]=true&filters[publishedAt][$notNull]=true&pagination[pageSize]=10'
  )
}
