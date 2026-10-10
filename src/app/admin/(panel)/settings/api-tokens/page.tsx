import { prisma } from '@/lib/prisma'
import { ApiTokensContent } from './ApiTokensContent'

export default async function ApiTokensPage() {
  const rows = await prisma.apiToken.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      tokenPrefix: true,
      createdAt: true,
      lastUsedAt: true,
      revokedAt: true,
    },
  })

  const tokens = rows.map((row) => ({
    id: row.id,
    name: row.name,
    tokenPrefix: row.tokenPrefix,
    createdAt: row.createdAt.toISOString(),
    lastUsedAt: row.lastUsedAt?.toISOString() ?? null,
    revokedAt: row.revokedAt?.toISOString() ?? null,
  }))

  return <ApiTokensContent tokens={tokens} />
}
