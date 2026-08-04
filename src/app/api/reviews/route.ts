import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fetchGoogleReviews } from '@/lib/google-reviews'

export interface GoogleReview {
  id: string
  author_name: string
  rating: number
  text: string
  time: number
  profile_photo_url: string
  relative_time_description: string
}

function relativeTime(unixTimestamp: number): string {
  const diff = Math.floor(Date.now() / 1000) - unixTimestamp
  const minutes = Math.floor(diff / 60)
  const hours = Math.floor(diff / 3600)
  const days = Math.floor(diff / 86400)
  const weeks = Math.floor(diff / (86400 * 7))
  const months = Math.floor(diff / (86400 * 30))
  const years = Math.floor(diff / (86400 * 365))

  if (minutes < 60) return `há ${minutes} minuto${minutes !== 1 ? 's' : ''}`
  if (hours < 24) return `há ${hours} hora${hours !== 1 ? 's' : ''}`
  if (days < 7) return `há ${days} dia${days !== 1 ? 's' : ''}`
  if (weeks < 5) return `há ${weeks} semana${weeks !== 1 ? 's' : ''}`
  if (months < 12) return `há ${months} mês${months !== 1 ? 'es' : ''}`
  return `há ${years} ano${years !== 1 ? 's' : ''}`
}

export async function GET() {
  const [apiKeySetting, placeIdSetting, minRatingSetting] = await Promise.all([
    prisma.setting.findUnique({ where: { key: 'google_places_api_key' } }),
    prisma.setting.findUnique({ where: { key: 'google_place_id' } }),
    prisma.setting.findUnique({
      where: { key: 'google_testimonials_minimum_rating' },
    }),
  ])

  const apiKey = apiKeySetting?.value
  const configPlaceId = placeIdSetting?.value
  const minRating = Number(minRatingSetting?.value ?? 4)

  if (!apiKey) {
    return NextResponse.json([])
  }

  try {
    const reviews = await fetchGoogleReviews(apiKey, configPlaceId)
    if (!reviews) return NextResponse.json([])

    const withRelativeTime: GoogleReview[] = reviews.map((r) => ({
      ...r,
      relative_time_description: relativeTime(r.time),
    }))

    return NextResponse.json(
      withRelativeTime.filter((r) => r.rating >= minRating)
    )
  } catch (err) {
    console.error('Erro ao buscar reviews do Google:', err)
    return NextResponse.json([])
  }
}
