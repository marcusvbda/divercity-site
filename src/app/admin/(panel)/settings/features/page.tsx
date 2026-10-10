import { prisma } from '@/lib/prisma'
import { FEATURES } from '@/lib/features'
import { FeaturesContent } from './FeaturesContent'

export default async function FeaturesPage() {
  const rows = await prisma.feature.findMany()
  const byKey = new Map(rows.map((row) => [row.key, row]))

  const features = FEATURES.map((feature) => {
    const row = byKey.get(feature.key)
    return {
      key: feature.key,
      name: row?.name ?? feature.name,
      enabled: row?.enabled ?? feature.enabled,
    }
  })

  return <FeaturesContent features={features} />
}
