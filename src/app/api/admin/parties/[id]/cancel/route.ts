import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const CLOSED_CONTRACT_STATUSES = ['signed', 'completed', 'cancelled']

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const party = await prisma.party.findUnique({
    where: { id: Number(id) },
    include: { contract: true },
  })
  if (!party) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.$transaction(async (tx) => {
    await tx.party.update({
      where: { id: party.id },
      data: { status: 'cancelled' },
    })

    if (party.contract && !CLOSED_CONTRACT_STATUSES.includes(party.contract.status)) {
      await tx.contract.update({
        where: { id: party.contract.id },
        data: { status: 'cancelled' },
      })
    }
  })

  const updated = await prisma.party.findUnique({
    where: { id: party.id },
    include: { customer: true, contractTemplate: true, contract: true },
  })

  return NextResponse.json(updated)
}
