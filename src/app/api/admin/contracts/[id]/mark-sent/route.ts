import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const existing = await prisma.contract.findUnique({ where: { id: Number(id) } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const contract = await prisma.contract.update({
    where: { id: Number(id) },
    data: { sentAt: new Date(), clientLinkOpen: true },
  })
  return NextResponse.json({ sentAt: contract.sentAt, clientLinkOpen: contract.clientLinkOpen })
}
