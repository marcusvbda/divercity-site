import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const ivId = parseInt(id)
  if (isNaN(ivId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const { value } = await req.json()

  const updated = await prisma.componentInstanceFieldValue.update({
    where: { id: ivId },
    data: { value: String(value ?? '') },
  })

  return NextResponse.json(updated)
}
