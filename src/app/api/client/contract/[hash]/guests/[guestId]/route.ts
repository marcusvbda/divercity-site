import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ hash: string; guestId: string }> },
) {
  const { hash, guestId } = await params

  const contract = await prisma.contract.findUnique({ where: { clientToken: hash } })
  if (!contract) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const id = Number(guestId)
  const guest = Number.isInteger(id) ? await prisma.guest.findUnique({ where: { id } }) : null
  if (!guest || guest.partyId !== contract.partyId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (contract.status !== 'signed' && contract.status !== 'completed') {
    return NextResponse.json(
      { error: 'Lista de convidados disponível após a assinatura do contrato' },
      { status: 403 },
    )
  }

  await prisma.guest.delete({ where: { id: guest.id } })
  return NextResponse.json({ success: true })
}
