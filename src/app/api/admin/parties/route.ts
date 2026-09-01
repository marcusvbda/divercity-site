import { NextRequest, NextResponse } from 'next/server'
import type { Prisma } from '@/generated/prisma/client'
import { prisma } from '@/lib/prisma'
import { PartySchema } from '@/lib/schemas/parties'

export async function GET(req: NextRequest) {
  const page = Number(req.nextUrl.searchParams.get('page') ?? '1')
  const perPage = Math.min(Number(req.nextUrl.searchParams.get('perPage') ?? '15'), 100)
  const status = req.nextUrl.searchParams.get('status')
  const customerName = req.nextUrl.searchParams.get('customerName')
  const dateParam = req.nextUrl.searchParams.get('date')
  const sort = req.nextUrl.searchParams.get('sort') ?? 'date'
  const dir = (req.nextUrl.searchParams.get('dir') ?? 'asc') as 'asc' | 'desc'

  const allowedSort: Record<string, boolean> = { date: true, status: true }
  const orderBy = allowedSort[sort] ? { [sort]: dir } : { date: 'asc' as const }

  const conditions: Prisma.PartyWhereInput[] = []
  if (status) conditions.push({ status: status as 'pending' | 'confirmed' | 'cancelled' })
  if (customerName) conditions.push({ customer: { name: { contains: customerName, mode: 'insensitive' } } })
  if (dateParam) {
    const dayStart = new Date(`${dateParam}T00:00:00.000Z`)
    if (!Number.isNaN(dayStart.getTime())) {
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
      conditions.push({ date: { gte: dayStart, lt: dayEnd } })
    }
  }
  const where: Prisma.PartyWhereInput | undefined = conditions.length > 0 ? { AND: conditions } : undefined

  const [data, total] = await Promise.all([
    prisma.party.findMany({
      where,
      include: { customer: true, contractTemplate: true, contract: true },
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.party.count({ where }),
  ])

  return NextResponse.json({
    data,
    pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = PartySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const newStart = new Date(parsed.data.date)
  const newEnd = parsed.data.dateEnd
    ? new Date(parsed.data.dateEnd)
    : new Date(newStart.getTime() + 4 * 60 * 60 * 1000)

  const blockingParties = await prisma.party.findMany({
    where: { status: { not: 'cancelled' } },
    select: { id: true, date: true, dateEnd: true },
  })
  const conflict = blockingParties.some(p => {
    const pStart = new Date(p.date)
    const pEnd = p.dateEnd ? new Date(p.dateEnd) : new Date(pStart.getTime() + 4 * 60 * 60 * 1000)
    return newStart < pEnd && newEnd > pStart
  })
  if (conflict) {
    return NextResponse.json({ error: 'Conflito com outra festa já agendada neste horário' }, { status: 409 })
  }

  const template = await prisma.contractTemplate.findUnique({
    where: { id: parsed.data.contractTemplateId },
  })
  if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 })

  const fieldValues: Record<string, string> = {}
  template.variables.forEach((v) => {
    fieldValues[v] = ''
  })

  const party = await prisma.$transaction(async (tx) => {
    const newParty = await tx.party.create({ data: parsed.data })
    await tx.contract.create({
      data: {
        partyId: newParty.id,
        body: template.body,
        fieldValues,
        status: 'draft',
      },
    })
    return tx.party.findUnique({
      where: { id: newParty.id },
      include: { customer: true, contractTemplate: true, contract: true },
    })
  })

  return NextResponse.json(party, { status: 201 })
}
