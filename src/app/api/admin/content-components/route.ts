import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const components = await prisma.contentComponent.findMany({
    orderBy: [{ contentTypeId: 'asc' }, { id: 'asc' }],
    select: {
      id: true,
      name: true,
      contentTypeId: true,
      contentType: { select: { name: true } },
    },
  })

  return NextResponse.json(components)
}
