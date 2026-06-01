import { NextResponse } from 'next/server'
import { getCMSConfig, getCMSDepoimentos } from '@/lib/cms'

export const revalidate = 3600

export interface GoogleReview {
  id: string
  author_name: string
  rating: number
  text: string
  time: number
  profile_photo_url: string
  relative_time_description: string
}

/** Converte depoimentos do Strapi para o formato GoogleReview */
async function getDepoimentosAsFallback(): Promise<GoogleReview[]> {
  const depoimentos = await getCMSDepoimentos()
  return depoimentos.map((d) => ({
    id: String(d.id),
    author_name: d.nome,
    rating: d.estrelas,
    text: d.texto,
    time: Date.now() / 1000,
    profile_photo_url:
      d.avatar?.url ??
      `https://placehold.co/80x80/8E4CCF/ffffff?text=${encodeURIComponent(d.nome[0])}`,
    relative_time_description: '',
  }))
}

async function findPlaceId(apiKey: string, configPlaceId?: string): Promise<string | null> {
  if (configPlaceId) return configPlaceId

  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=Divercity+Park+Maringá&inputtype=textquery&fields=place_id&key=${apiKey}`
  const res = await fetch(url, { next: { revalidate: 86400 } })
  if (!res.ok) return null
  const data = await res.json()
  return data?.candidates?.[0]?.place_id ?? null
}

export async function GET() {
  // Credenciais do Google vêm do CMS, não do .env
  const config = await getCMSConfig()
  const apiKey = config.google_places_api_key
  const configPlaceId = config.google_place_id

  if (!apiKey) {
    // Sem token Google → usa depoimentos do CMS
    const fallback = await getDepoimentosAsFallback()
    return NextResponse.json(fallback)
  }

  try {
    const placeId = await findPlaceId(apiKey, configPlaceId)
    if (!placeId) {
      const fallback = await getDepoimentosAsFallback()
      return NextResponse.json(fallback)
    }

    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&language=pt-BR&reviews_sort=newest&key=${apiKey}`
    const res = await fetch(detailsUrl, { next: { revalidate: 3600 } })

    if (!res.ok) throw new Error(`Places API error: ${res.status}`)

    const data = await res.json()
    const allReviews: GoogleReview[] = (data?.result?.reviews ?? []).map(
      (r: Record<string, unknown>, i: number) => ({
        id: String(i),
        author_name: r.author_name as string,
        rating: r.rating as number,
        text: r.text as string,
        time: r.time as number,
        profile_photo_url: r.profile_photo_url as string,
        relative_time_description: r.relative_time_description as string,
      })
    )

    // Apenas reviews > 4 estrelas
    const filtered = allReviews.filter((r) => r.rating > 4)

    if (filtered.length > 0) return NextResponse.json(filtered)

    // Google não retornou nada útil → fallback do CMS
    const fallback = await getDepoimentosAsFallback()
    return NextResponse.json(fallback)
  } catch (err) {
    console.error('Erro ao buscar reviews do Google:', err)
    const fallback = await getDepoimentosAsFallback()
    return NextResponse.json(fallback)
  }
}
