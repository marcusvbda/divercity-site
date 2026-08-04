import { cache } from 'react'

export interface GoogleReviewRaw {
  id: string
  author_name: string
  rating: number
  text: string
  time: number
  profile_photo_url: string
}

export const GOOGLE_REVIEWS_CACHE_TAG = 'google-reviews'

async function findPlaceId(
  apiKey: string,
  configPlaceId?: string
): Promise<string | null> {
  if (configPlaceId) return configPlaceId

  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=Divercity+Park+Maringá&inputtype=textquery&fields=place_id&key=${apiKey}`
  const res = await fetch(url, {
    cache: 'force-cache',
    next: { revalidate: false, tags: [GOOGLE_REVIEWS_CACHE_TAG] },
  })

  if (!res.ok) throw new Error(`Places findplacefromtext error: ${res.status}`)

  const data = await res.json()
  return data?.candidates?.[0]?.place_id ?? null
}

export const fetchGoogleReviews = cache(
  async (
    apiKey: string,
    configPlaceId?: string
  ): Promise<GoogleReviewRaw[] | null> => {
    const placeId = await findPlaceId(apiKey, configPlaceId)
    if (!placeId) return null

    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&language=pt-BR&reviews_sort=newest&key=${apiKey}`
    const res = await fetch(detailsUrl, {
      cache: 'force-cache',
      next: { revalidate: false, tags: [GOOGLE_REVIEWS_CACHE_TAG] },
    })

    if (!res.ok) throw new Error(`Places details error: ${res.status}`)

    const data = await res.json()
    const reviews: GoogleReviewRaw[] = (data?.result?.reviews ?? []).map(
      (r: Record<string, unknown>, i: number) => ({
        id: String(i),
        author_name: r.author_name as string,
        rating: r.rating as number,
        text: r.text as string,
        time: r.time as number,
        profile_photo_url: r.profile_photo_url as string,
      })
    )

    return reviews.length > 0 ? reviews : null
  }
)
