import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export interface InstagramPost {
  id: string
  media_url: string
  thumbnail_url?: string
  permalink: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
}

const FALLBACK_POSTS = [
  'https://placehold.co/600x600/8E4CCF/ffffff?text=Diversão+em+família',
  'https://placehold.co/600x600/FF6B9D/ffffff?text=Aniversário+incrível',
  'https://placehold.co/600x600/00C2CB/ffffff?text=Atrações+radicais',
  'https://placehold.co/600x600/FFD93D/333333?text=Crianças+felizes',
  'https://placehold.co/600x600/8E4CCF/ffffff?text=Festa+dos+sonhos',
  'https://placehold.co/600x600/FF6B9D/ffffff?text=Parque+indoor',
]

function makeFallback(instagramUrl: string): InstagramPost[] {
  return FALLBACK_POSTS.map((url, i) => ({
    id: String(i),
    media_url: url,
    permalink: instagramUrl,
    media_type: 'IMAGE' as const,
  }))
}

export async function GET() {
  const [tokenSetting, urlSetting] = await Promise.all([
    prisma.setting.findUnique({ where: { key: 'instagram_access_token' } }),
    prisma.setting.findUnique({ where: { key: 'instagram_url' } }),
  ])

  const token = tokenSetting?.value
  const instagramUrl = urlSetting?.value ?? 'https://www.instagram.com/divercity.park'

  if (!token) {
    return NextResponse.json(makeFallback(instagramUrl))
  }

  try {
    const fields = 'id,media_type,media_url,thumbnail_url,permalink'
    const url = `https://graph.instagram.com/me/media?fields=${fields}&limit=12&access_token=${token}`
    const res = await fetch(url, { next: { revalidate: 3600, tags: ['instagram-posts'] } })

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
