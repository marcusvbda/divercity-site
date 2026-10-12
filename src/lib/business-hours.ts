import { cacheLife, cacheTag } from 'next/cache'
import { prisma } from '@/lib/prisma'

export const BUSINESS_HOURS_CACHE_TAG = 'business-hours'

export async function getBusinessHours() {
  'use cache'
  cacheTag(BUSINESS_HOURS_CACHE_TAG)
  cacheLife('max')

  return prisma.businessHour.findMany({
    orderBy: { id: 'asc' },
    select: {
      id: true,
      key: true,
      label: true,
      opening: true,
      close: true,
    },
  })
}
