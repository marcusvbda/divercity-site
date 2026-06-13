import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PartySchema } from '@/lib/schemas/parties'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const party = await prisma.party.findUnique({
    where: { id: Number(id) },
    include: { customer: true, contractTemplate: true, contract: true },
  })
  if (!party) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(party)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const parsed = PartySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const newStart = new Date(parsed.data.date)
  const newEnd = parsed.data.dateEnd
    ? new Date(parsed.data.dateEnd)
    : new Date(newStart.getTime() + 4 * 60 * 60 * 1000)

  const confirmedParties = await prisma.party.findMany({
    where: { status: 'confirmed', id: { not: Number(id) } },
    select: { id: true, date: true, dateEnd: true },
  })
  const conflict = confirmedParties.some(p => {
    const pStart = new Date(p.date)
    const pEnd = p.dateEnd ? new Date(p.dateEnd) : new Date(pStart.getTime() + 4 * 60 * 60 * 1000)
    return newStart < pEnd && newEnd > pStart
  })
  if (conflict) {
    return NextResponse.json({ error: 'Conflito com festa já confirmada neste horário' }, { status: 409 })
  }

  const party = await prisma.party.update({
    where: { id: Number(id) },
    data: parsed.data,
    include: { customer: true, contractTemplate: true, contract: true },
  })
  return NextResponse.json(party)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.party.delete({ where: { id: Number(id) } })
  return NextResponse.json({ success: true })
}
