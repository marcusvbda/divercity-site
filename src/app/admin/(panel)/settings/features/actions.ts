'use server'

import { updateTag } from 'next/cache'
import { getAuthenticatedSession } from '@/lib/authz'
import { FEATURES, FEATURES_CACHE_TAG, type FeatureKey } from '@/lib/features'
import { prisma } from '@/lib/prisma'

export async function updateFeature(key: FeatureKey, enabled: boolean): Promise<void> {
  const session = await getAuthenticatedSession()
  if (!session) throw new Error('Não autenticado')
  if (session.user.role !== 'admin') throw new Error('Acesso negado')

  const feature = FEATURES.find((item) => item.key === key)
  if (!feature) throw new Error('Funcionalidade inválida')
  if (typeof enabled !== 'boolean') throw new Error('Valor inválido')

  await prisma.feature.upsert({
    where: { key: feature.key },
    create: { key: feature.key, name: feature.name, enabled },
    update: { enabled },
  })

  updateTag(FEATURES_CACHE_TAG)
}
