import { NextResponse } from 'next/server'
import { getCMSConfig } from '@/lib/cms'

export interface InstagramPost {
  id: string
  media_url: string
  thumbnail_url?: string
  permalink: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
}

export const revalidate = 3600

const FALLBACK_POSTS: any = []

function makeFallback(instagramUrl: string): InstagramPost[] {
  return FALLBACK_POSTS.map((url: any, i: any) => ({
    id: String(i),
    media_url: url,
    permalink: instagramUrl,
    media_type: 'IMAGE',
  }))
}

export async function GET() {
  // Token do Instagram vem do CMS, não do .env
  const config = await getCMSConfig()
  const token = config.instagram_access_token
  const instagramUrl =
    config.instagram_url ?? 'https://www.instagram.com/divercity.park'

  if (!token) {
    return NextResponse.json(makeFallback(instagramUrl))
  }

  try {
    const fields = 'id,media_type,media_url,thumbnail_url,permalink'
    const url = `https://graph.instagram.com/me/media?fields=${fields}&limit=12&access_token=${token}`
    const res = await fetch(url, { next: { revalidate: 3600 } })

    if (!res.ok) throw new Error(`Instagram API error: ${res.status}`)

    const data = await res.json()
    const posts: InstagramPost[] = (data.data as InstagramPost[]).filter(
      (p) =>
        p.media_type === 'IMAGE' ||
        p.media_type === 'CAROUSEL_ALBUM' ||
        p.thumbnail_url
    )

    return NextResponse.json(
      posts.length > 0 ? posts : makeFallback(instagramUrl)
    )
  } catch (err) {
    console.error('Erro ao buscar posts do Instagram:', err)
    return NextResponse.json(makeFallback(instagramUrl))
  }
}
