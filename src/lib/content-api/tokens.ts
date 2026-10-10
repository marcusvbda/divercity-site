import { createHash, randomBytes } from 'node:crypto'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

const TOKEN_PREFIX = 'dvc_'

export function hashApiToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export function generateApiToken() {
  const secret = randomBytes(32).toString('base64url')
  const token = `${TOKEN_PREFIX}${secret}`
  return {
    token,
    tokenHash: hashApiToken(token),
    tokenPrefix: secret.slice(0, 8),
  }
}

export async function authenticateApiToken(req: NextRequest) {
  const header = req.headers.get('authorization')
  if (!header) return null

  const match = /^Bearer\s+(\S+)$/i.exec(header.trim())
  if (!match) return null

  const apiToken = await prisma.apiToken.findUnique({
    where: { tokenHash: hashApiToken(match[1]), revokedAt: null },
    select: { id: true, revokedAt: true },
  })
  if (!apiToken) return null

  prisma.apiToken
    .update({ where: { id: apiToken.id }, data: { lastUsedAt: new Date() } })
    .catch(() => {})

  return apiToken
}
