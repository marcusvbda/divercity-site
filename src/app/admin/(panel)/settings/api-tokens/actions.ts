'use server'

import { z } from 'zod'
import { getAuthenticatedSession } from '@/lib/authz'
import { generateApiToken } from '@/lib/content-api/tokens'
import { prisma } from '@/lib/prisma'

const createApiTokenSchema = z.object({
  name: z.string().trim().min(1, 'Informe um nome').max(80, 'Nome muito longo (máx. 80 caracteres)'),
})

export type CreatedApiToken = {
  id: string
  name: string
  token: string
}

async function requireAdmin() {
  const session = await getAuthenticatedSession()
  if (!session) throw new Error('Não autenticado')
  if (session.user.role !== 'admin') throw new Error('Acesso negado')
}

export async function createApiToken(name: string): Promise<CreatedApiToken> {
  await requireAdmin()

  const parsed = createApiTokenSchema.safeParse({ name })
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Nome inválido')
  }

  const { token, tokenHash, tokenPrefix } = generateApiToken()

  const created = await prisma.apiToken.create({
    data: { name: parsed.data.name, tokenHash, tokenPrefix },
    select: { id: true, name: true },
  })

  return { id: created.id, name: created.name, token }
}

export async function revokeApiToken(id: string): Promise<void> {
  await requireAdmin()

  if (typeof id !== 'string' || !id) throw new Error('Token inválido')

  const existing = await prisma.apiToken.findUnique({ where: { id }, select: { id: true } })
  if (!existing) throw new Error('Token não encontrado')

  await prisma.apiToken.updateMany({
    where: { id, revokedAt: null },
    data: { revokedAt: new Date() },
  })
}
