import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isDefaultVariable } from '@/lib/contract-defaults'
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

  const existing = await prisma.contract.findUnique({
    where: { clientToken: hash },
    include: { party: { include: { contractTemplate: true } } },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!existing.clientLinkOpen) return NextResponse.json({ error: 'Link indisponível' }, { status: 403 })
  if (existing.status === 'signed' || existing.status === 'completed') {
    return NextResponse.json({ error: 'Contrato já assinado' }, { status: 403 })
  }
  if (existing.status === 'cancelled' || existing.party.status === 'cancelled') {
    return NextResponse.json({ error: 'Esta reserva foi cancelada' }, { status: 403 })
  }

  const extraVariables = new Set(existing.party.contractTemplate.variables.filter((v) => !isDefaultVariable(v)))
  const existingValues = (existing.fieldValues ?? {}) as Record<string, string>
  const filledKeys = new Set(existing.clientFilledKeys)
  const merged: Record<string, string> = { ...existingValues }
  const accepted: string[] = []

  for (const [key, value] of Object.entries(parsed.data)) {
    if (!extraVariables.has(key)) continue
    if (existingValues[key] && !filledKeys.has(key)) continue
    merged[key] = value
    if (value.trim() !== '') accepted.push(key)
  }

  const contract = await prisma.contract.update({
    where: { clientToken: hash },
    data: {
      fieldValues: merged,
      clientFilledKeys: [...new Set([...existing.clientFilledKeys, ...accepted])],
    },
  })
  return NextResponse.json(contract)
}
