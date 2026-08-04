import { cache } from 'react'

export interface InstagramPost {
  id: string
  media_url: string
  thumbnail_url?: string
  permalink: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
}

export const INSTAGRAM_CACHE_TAG = 'instagram-posts'

export const fetchInstagramPosts = cache(
  async (token: string): Promise<InstagramPost[] | null> => {
    const fields = 'id,media_type,media_url,thumbnail_url,permalink'
    const url = `https://graph.instagram.com/me/media?fields=${fields}&limit=12&access_token=${token}`

    const res = await fetch(url, {
      cache: 'force-cache',
      next: { revalidate: false, tags: [INSTAGRAM_CACHE_TAG] },
    })

    if (res.status === 404) return null
    if (!res.ok) throw new Error(`Instagram API error: ${res.status}`)

    const data = await res.json()
    const posts: InstagramPost[] = (data.data as InstagramPost[]).filter(
      (p) =>
        p.media_type === 'IMAGE' ||
        p.media_type === 'CAROUSEL_ALBUM' ||
        p.thumbnail_url
    )

    return posts.length > 0 ? posts : null
  }
)
