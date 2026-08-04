'use server'

import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { GOOGLE_REVIEWS_CACHE_TAG } from '@/lib/google-reviews'
import { INSTAGRAM_CACHE_TAG } from '@/lib/instagram'

const TAG_MAP: Record<string, string> = {
  google_places_api_key: GOOGLE_REVIEWS_CACHE_TAG,
  google_place_id: GOOGLE_REVIEWS_CACHE_TAG,
  google_testimonials_minimum_rating: GOOGLE_REVIEWS_CACHE_TAG,
  instagram_access_token: INSTAGRAM_CACHE_TAG,
  instagram_url: INSTAGRAM_CACHE_TAG,
  stripe_publishable_key: 'stripe-config',
  stripe_secret_key: 'stripe-config',
  stripe_webhook_secret: 'stripe-config',
}

export async function updateSettings(settings: { key: string; value: string }[]) {
  await Promise.all(
    settings.map(({ key, value }) =>
      prisma.setting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      })
    )
  )

  const tags = new Set(settings.map((s) => TAG_MAP[s.key]).filter(Boolean))
  tags.forEach((tag) => revalidateTag(tag, 'max'))
}
