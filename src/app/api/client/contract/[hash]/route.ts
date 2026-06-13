import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ContractFieldValuesSchema } from '@/lib/schemas/parties'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ hash: string }> }) {
  const { hash } = await params
  const contract = await prisma.contract.findUnique({
    where: { clientToken: hash },
    include: { party: { include: { customer: true, contractTemplate: true } } },
  })
  if (!contract) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(contract)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ hash: string }> }) {
  const { hash } = await params
  const body = await req.json()

  const parsed = ContractFieldValuesSchema.safeParse(body.fieldValues)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const existing = await prisma.contract.findUnique({ where: { clientToken: hash } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!existing.clientLinkOpen) return NextResponse.json({ error: 'Link indisponível' }, { status: 403 })
  if (existing.status === 'signed') return NextResponse.json({ error: 'Contrato já assinado' }, { status: 403 })

  const existingValues = existing.fieldValues as Record<string, string>
  const merged: Record<string, string> = { ...existingValues }
  for (const [key, value] of Object.entries(parsed.data)) {
    if (!existingValues[key]) {
      merged[key] = value
    }
  }

  const contract = await prisma.contract.update({
    where: { clientToken: hash },
    data: { fieldValues: merged },
  })
  return NextResponse.json(contract)
}
