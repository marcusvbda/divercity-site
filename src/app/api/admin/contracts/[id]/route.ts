import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { UpdateContractSchema } from '@/lib/schemas/parties'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const contract = await prisma.contract.findUnique({
    where: { id: Number(id) },
    include: { party: { include: { customer: true, contractTemplate: true } } },
  })
  if (!contract) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(contract)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const parsed = UpdateContractSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const existing = await prisma.contract.findUnique({ where: { id: Number(id) } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (existing.status === 'signed') {
    return NextResponse.json({ error: 'Contrato assinado não pode ser alterado' }, { status: 403 })
  }

  const contract = await prisma.contract.update({
    where: { id: Number(id) },
    data: {
      fieldValues: parsed.data.fieldValues,
      ...(parsed.data.status ? { status: parsed.data.status } : {}),
    },
    include: { party: { include: { customer: true, contractTemplate: true } } },
  })
  return NextResponse.json(contract)
}
