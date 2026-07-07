'use server'

import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'

const TAG_MAP: Record<string, string> = {
  google_places_api_key: 'google-reviews',
  google_place_id: 'google-reviews',
  google_testimonials_minimum_rating: 'google-reviews',
  instagram_access_token: 'instagram-posts',
  instagram_url: 'instagram-posts',
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
  tags.forEach(revalidateTag)
}
