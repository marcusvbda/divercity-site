import { NextResponse } from 'next/server'
import { INSTAGRAM_POSTS } from '@/lib/data'

export interface InstagramPost {
  id: string
  media_url: string
  thumbnail_url?: string
  permalink: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
}

// Cache de 1 hora para não bater na API a cada request
export const revalidate = 3600

export async function GET() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN

  if (!token) {
    // Fallback para placeholders quando o token não está configurado
    const fallback: InstagramPost[] = INSTAGRAM_POSTS.map((url, i) => ({
      id: String(i),
      media_url: url,
      permalink: 'https://www.instagram.com/divercity.park',
      media_type: 'IMAGE',
    }))
    return NextResponse.json(fallback)
  }

  try {
    const fields = 'id,media_type,media_url,thumbnail_url,permalink'
    const url = `https://graph.instagram.com/me/media?fields=${fields}&limit=12&access_token=${token}`
    const res = await fetch(url, { next: { revalidate: 3600 } })

    if (!res.ok) {
      throw new Error(`Instagram API error: ${res.status}`)
    }

    const data = await res.json()
    // Filtra apenas fotos e capas de carrossel (descarta vídeos sem thumbnail)
    const posts: InstagramPost[] = (data.data as InstagramPost[]).filter(
      (p) => p.media_type === 'IMAGE' || p.media_type === 'CAROUSEL_ALBUM' || p.thumbnail_url
    )

    return NextResponse.json(posts)
  } catch (err) {
    console.error('Erro ao buscar posts do Instagram:', err)
    // Fallback em caso de erro
    const fallback: InstagramPost[] = INSTAGRAM_POSTS.map((url, i) => ({
      id: String(i),
      media_url: url,
      permalink: 'https://www.instagram.com/divercity.park',
      media_type: 'IMAGE',
    }))
    return NextResponse.json(fallback)
  }
}
