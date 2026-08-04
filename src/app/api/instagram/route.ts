import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fetchInstagramPosts, type InstagramPost } from '@/lib/instagram'

export type { InstagramPost } from '@/lib/instagram'

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
  const instagramUrl =
    urlSetting?.value ?? 'https://www.instagram.com/divercity.park'

  if (!token) {
    return NextResponse.json(makeFallback(instagramUrl))
  }

  try {
    const posts = await fetchInstagramPosts(token)
    return NextResponse.json(posts ?? makeFallback(instagramUrl))
  } catch (err) {
    console.error('Erro ao buscar posts do Instagram:', err)
    return NextResponse.json(makeFallback(instagramUrl))
  }
}
