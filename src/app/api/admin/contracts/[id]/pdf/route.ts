import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getEnvelopePdf } from '@/lib/docusign'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const contract = await prisma.contract.findUnique({ where: { id: Number(id) } })
  if (!contract) return NextResponse.json({ error: 'Contrato não encontrado' }, { status: 404 })
  if (!contract.docusignEnvelopeId) {
    return NextResponse.json({ error: 'Contrato ainda não enviado ao DocuSign' }, { status: 404 })
  }

  try {
    const pdf = await getEnvelopePdf(contract.docusignEnvelopeId)
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="contrato-${contract.id}.pdf"`,
      },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Não foi possível obter o PDF no DocuSign' }, { status: 502 })
  }
}
