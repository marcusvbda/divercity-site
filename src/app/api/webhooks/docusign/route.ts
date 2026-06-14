import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const event: string = body?.event ?? ''
  const envelopeId: string = body?.data?.envelopeId ?? ''

  if (!envelopeId) {
    return NextResponse.json({ ok: true })
  }

  if (event === 'envelope-completed') {
    const contract = await prisma.contract.findFirst({
      where: { docusignEnvelopeId: envelopeId },
      include: { party: true },
    })

    if (contract) {
      await prisma.$transaction([
        prisma.contract.update({
          where: { id: contract.id },
          data: { status: 'signed' },
        }),
        prisma.party.update({
          where: { id: contract.partyId },
          data: { status: 'confirmed' },
        }),
      ])
    }
  }

  if (event === 'envelope-voided' || event === 'envelope-declined') {
    await prisma.contract.updateMany({
      where: { docusignEnvelopeId: envelopeId },
      data: { status: 'cancelled' },
    })
  }

  return NextResponse.json({ ok: true })
}
