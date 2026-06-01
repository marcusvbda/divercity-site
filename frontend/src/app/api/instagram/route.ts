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

const FALLBACK_POSTS = [
  'https://placehold.co/400x400/12C7C8/ffffff?text=Post+1',
  'https://placehold.co/400x400/8E4CCF/ffffff?text=Post+2',
  'https://placehold.co/400x400/FF4F8A/ffffff?text=Post+3',
  'https://placehold.co/400x400/9AD94B/ffffff?text=Post+4',
  'https://placehold.co/400x400/FFD23F/333333?text=Post+5',
  'https://placehold.co/400x400/12C7C8/ffffff?text=Post+6',
  'https://placehold.co/400x400/8E4CCF/ffffff?text=Post+7',
  'https://placehold.co/400x400/FF4F8A/ffffff?text=Post+8',
]

function makeFallback(instagramUrl: string): InstagramPost[] {
  return FALLBACK_POSTS.map((url, i) => ({
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
  const instagramUrl = config.instagram_url ?? 'https://www.instagram.com/divercity.park'

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
      (p) => p.media_type === 'IMAGE' || p.media_type === 'CAROUSEL_ALBUM' || p.thumbnail_url
    )

    return NextResponse.json(posts.length > 0 ? posts : makeFallback(instagramUrl))
  } catch (err) {
    console.error('Erro ao buscar posts do Instagram:', err)
    return NextResponse.json(makeFallback(instagramUrl))
  }
}
