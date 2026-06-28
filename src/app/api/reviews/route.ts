import { NextResponse } from 'next/server'

export interface GoogleReview {
  id: string
  author_name: string
  rating: number
  text: string
  time: number
  profile_photo_url: string
  relative_time_description: string
}

const GOOGLE_TESTIMONIALS_MINIMUM_RATING = Number(
  process.env.GOOGLE_TESTIMONIALS_MINIMUM_RATING ?? 4
)

async function findPlaceId(
  apiKey: string,
  configPlaceId?: string
): Promise<string | null> {
  if (configPlaceId) return configPlaceId

  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=Divercity+Park+Maringá&inputtype=textquery&fields=place_id&key=${apiKey}`
  const res = await fetch(url, { next: { revalidate: 86400 } })
  if (!res.ok) return null
  const data = await res.json()
  return data?.candidates?.[0]?.place_id ?? null
}

export async function GET() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  const configPlaceId = process.env.GOOGLE_PLACE_ID

  if (!apiKey) {
    return NextResponse.json([])
  }

  try {
    const placeId = await findPlaceId(apiKey, configPlaceId)
    if (!placeId) return NextResponse.json([])

    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&language=pt-BR&reviews_sort=newest&key=${apiKey}`
    const res = await fetch(detailsUrl, { next: { revalidate: 3600 } })
    console.log(detailsUrl)

    if (!res.ok) throw new Error(`Places API error: ${res.status}`)

    const data = await res.json()
    const reviews: GoogleReview[] = (data?.result?.reviews ?? []).map(
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

    return NextResponse.json(
      reviews.filter((r) => r.rating > GOOGLE_TESTIMONIALS_MINIMUM_RATING)
    )
  } catch (err) {
    console.error('Erro ao buscar reviews do Google:', err)
    return NextResponse.json([])
  }
}
