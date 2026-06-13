import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Ctx = { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const fvId = parseInt(id)
  if (isNaN(fvId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const { value } = await req.json()

  const updated = await prisma.componentFieldValue.update({
    where: { id: fvId },
    data: { value: String(value ?? '') },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const fvId = parseInt(id)
  if (isNaN(fvId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const fv = await prisma.componentFieldValue.findUnique({ where: { id: fvId } })
  if (!fv) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.$transaction(async (tx) => {
    if (fv.instanceId) await tx.componentInstance.delete({ where: { id: fv.instanceId } })
    await tx.componentFieldValue.delete({ where: { id: fvId } })
  })

  return NextResponse.json({ ok: true })
}
