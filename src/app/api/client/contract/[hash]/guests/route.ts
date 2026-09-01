import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { GuestSchema } from '@/lib/schemas/parties'

const GUEST_LIMIT = 50

export async function GET(_req: NextRequest, { params }: { params: Promise<{ hash: string }> }) {
  const { hash } = await params

  const contract = await prisma.contract.findUnique({
    where: { clientToken: hash },
    include: { party: { include: { guests: { orderBy: { createdAt: 'asc' } } } } },
  })

  if (!contract) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (contract.status !== 'signed' && contract.status !== 'completed') {
    return NextResponse.json(
      { error: 'Lista de convidados disponível após a assinatura do contrato' },
      { status: 403 },
    )
  }

  const guests = contract.party.guests
  return NextResponse.json({ guests, total: guests.length, limit: GUEST_LIMIT })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ hash: string }> }) {
  const { hash } = await params
  const body = await req.json()

  const parsed = GuestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const contract = await prisma.contract.findUnique({
    where: { clientToken: hash },
    include: { party: true },
  })

  if (!contract) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (contract.status !== 'signed' && contract.status !== 'completed') {
    return NextResponse.json(
      { error: 'Lista de convidados disponível após a assinatura do contrato' },
      { status: 403 },
    )
  }

  const count = await prisma.guest.count({ where: { partyId: contract.partyId } })
  if (count >= GUEST_LIMIT) {
    return NextResponse.json({ error: 'Limite de 50 participantes atingido' }, { status: 409 })
  }

  const guest = await prisma.guest.create({
    data: { partyId: contract.partyId, name: parsed.data.name, type: parsed.data.type },
  })

  return NextResponse.json(guest, { status: 201 })
}
