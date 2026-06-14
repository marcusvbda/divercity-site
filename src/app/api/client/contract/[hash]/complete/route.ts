import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getEnvelopeStatus } from '@/lib/docusign'

export async function POST(req: NextRequest, { params }: { params: Promise<{ hash: string }> }) {
  const { hash } = await params

  const contract = await prisma.contract.findUnique({
    where: { clientToken: hash },
    include: { party: true },
  })

  if (!contract) {
    return NextResponse.json({ error: 'Contrato não encontrado' }, { status: 404 })
  }

  if (contract.status === 'signed') {
    return NextResponse.json({ status: 'signed' })
  }

  if (!contract.docusignEnvelopeId) {
    return NextResponse.json({ error: 'Envelope não encontrado' }, { status: 400 })
  }

  const envelopeStatus = await getEnvelopeStatus(contract.docusignEnvelopeId)

  if (envelopeStatus === 'completed') {
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
    return NextResponse.json({ status: 'signed' })
  }

  return NextResponse.json({ status: envelopeStatus })
}
