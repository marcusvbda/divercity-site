import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSigningSession } from '@/lib/docusign'
import { buildDefaultValues } from '@/lib/contract-defaults'

export async function POST(req: NextRequest, { params }: { params: Promise<{ hash: string }> }) {
  const { hash } = await params

  const contract = await prisma.contract.findUnique({
    where: { clientToken: hash },
    include: { party: { include: { customer: true, contractTemplate: true } } },
  })

  if (!contract || !contract.clientLinkOpen) {
    return NextResponse.json({ error: 'Contrato não encontrado' }, { status: 404 })
  }
  if (contract.status === 'signed') {
    return NextResponse.json({ error: 'Contrato já assinado' }, { status: 400 })
  }
  if (!contract.party.customer.email) {
    return NextResponse.json({ error: 'Cliente sem e-mail cadastrado' }, { status: 422 })
  }

  const { party } = contract
  const { customer } = party

  const defaultValues = buildDefaultValues(party as unknown as Parameters<typeof buildDefaultValues>[0])
  const userValues = contract.fieldValues as Record<string, string>
  const mergedValues = { ...defaultValues, ...userValues }

  const contractHtml = contract.body.replace(/\{\{(\w+)\}\}/g, (_m, key) => mergedValues[key] ?? '')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!
  const returnUrl = `${appUrl}/c/${hash}?ds_event=signing_complete`

  const { envelopeId, signingUrl } = await createSigningSession({
    signerName: customer.name,
    signerEmail: customer.email!,
    clientUserId: hash,
    contractHtml,
    contractTitle: party.contractTemplate.name,
    returnUrl,
  })

  await prisma.contract.update({
    where: { id: contract.id },
    data: { docusignEnvelopeId: envelopeId, status: 'in_review' },
  })

  return NextResponse.json({ url: signingUrl })
}
