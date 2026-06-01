import { NextResponse } from 'next/server'

export const revalidate = 3600 // Cache 1 hora

export interface GoogleReview {
  id: string
  author_name: string
  rating: number
  text: string
  time: number
  profile_photo_url: string
  relative_time_description: string
}

// Fallback estático para quando a API key não está configurada
const FALLBACK_REVIEWS: GoogleReview[] = [
  {
    id: '1',
    author_name: 'Fernanda',
    rating: 5,
    text: 'Festa incrível! Meu filho adorou cada detalhe. A equipe foi super atenciosa e tudo ficou perfeito. Com certeza voltaremos!',
    time: Date.now() / 1000,
    profile_photo_url: 'https://placehold.co/80x80/FF4F8A/ffffff?text=F',
    relative_time_description: 'há 2 semanas',
  },
  {
    id: '2',
    author_name: 'Ricardo',
    rating: 5,
    text: 'Melhor parque indoor da região! As crianças ficaram horas se divertindo nas atrações. Estrutura impecável e equipe muito profissional.',
    time: Date.now() / 1000,
    profile_photo_url: 'https://placehold.co/80x80/8E4CCF/ffffff?text=R',
    relative_time_description: 'há 1 mês',
  },
  {
    id: '3',
    author_name: 'Adriana',
    rating: 5,
    text: 'Atendimento excepcional desde o primeiro contato. A festa do meu filho foi um sonho. Recomendo para todos os pais!',
    time: Date.now() / 1000,
    profile_photo_url: 'https://placehold.co/80x80/12C7C8/ffffff?text=A',
    relative_time_description: 'há 3 semanas',
  },
]

async function findPlaceId(apiKey: string): Promise<string | null> {
  // Se já tiver o Place ID configurado, usa direto
  if (process.env.GOOGLE_PLACE_ID) return process.env.GOOGLE_PLACE_ID

  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=Divercity+Park+Maringá&inputtype=textquery&fields=place_id&key=${apiKey}`
  const res = await fetch(url, { next: { revalidate: 86400 } }) // cache 24h
  if (!res.ok) return null
  const data = await res.json()
  return data?.candidates?.[0]?.place_id ?? null
}

export async function GET() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY

  if (!apiKey) {
    return NextResponse.json(FALLBACK_REVIEWS)
  }

  try {
    const placeId = await findPlaceId(apiKey)
    if (!placeId) return NextResponse.json(FALLBACK_REVIEWS)

    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&language=pt-BR&reviews_sort=newest&key=${apiKey}`
    const res = await fetch(detailsUrl, { next: { revalidate: 3600 } })

    if (!res.ok) throw new Error(`Places API error: ${res.status}`)

    const data = await res.json()
    const allReviews: GoogleReview[] = (data?.result?.reviews ?? []).map(
      (r: GoogleReview & { author_name: string; time: number }, i: number) => ({
        id: String(i),
        author_name: r.author_name,
        rating: r.rating,
        text: r.text,
        time: r.time,
        profile_photo_url: r.profile_photo_url,
        relative_time_description: r.relative_time_description,
      })
    )

    // Filtra apenas reviews com mais de 4 estrelas
    const filtered = allReviews.filter((r) => r.rating > 4)

    return NextResponse.json(filtered.length > 0 ? filtered : FALLBACK_REVIEWS)
  } catch (err) {
    console.error('Erro ao buscar reviews do Google:', err)
    return NextResponse.json(FALLBACK_REVIEWS)
  }
}
