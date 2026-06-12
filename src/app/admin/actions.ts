'use server'

import { revalidateTag } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

async function requireSession() {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('Unauthorized')
}

export async function revalidateCMSCache(): Promise<{ revalidatedAt: string }> {
  await requireSession()
  revalidateTag('cms', {})
  return { revalidatedAt: new Date().toISOString() }
}

export async function revalidateCMSType(typeName: string): Promise<{ revalidatedAt: string }> {
  await requireSession()
  revalidateTag(`cms:${typeName}`, {})
  return { revalidatedAt: new Date().toISOString() }
}
