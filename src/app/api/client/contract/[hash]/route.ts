import { z } from 'zod'
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

const CONTRACT_INCLUDE = { party: { include: { customer: true, contractTemplate: true } } } as const

const EmailSchema = z.string().email()
const CUSTOMER_KEYS = ['cliente_name', 'cliente_email', 'cliente_phone'] as const
const PARTY_COUNT_FIELDS = {
  festa_children_count: 'childrenCount',
  festa_adults_count: 'adultsCount',
  festa_total_participants: 'totalParticipants',
} as const

function bodyHasVariable(body: string, key: string) {
  return new RegExp(`\\{\\{\\s*${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\}\\}`).test(body)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ hash: string }> }) {
  const { hash } = await params
  const body = await req.json().catch(() => null)

  const parsed = ContractFieldValuesSchema.safeParse(body?.fieldValues)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  const existing = await prisma.contract.findUnique({
    where: { clientToken: hash },
    include: { party: { include: { customer: true, contractTemplate: true } } },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!existing.clientLinkOpen) return NextResponse.json({ error: 'Link indisponível' }, { status: 403 })
  if (existing.status === 'signed' || existing.status === 'completed') {
    return NextResponse.json({ error: 'Contrato já assinado' }, { status: 403 })
  }
  if (existing.status === 'cancelled' || existing.party.status === 'cancelled') {
    return NextResponse.json({ error: 'Esta reserva foi cancelada' }, { status: 403 })
  }

  const { party } = existing
  const extraVariables = new Set(party.contractTemplate.variables.filter((v) => !isDefaultVariable(v)))
  const existingValues = (existing.fieldValues ?? {}) as Record<string, string>
  const filledKeys = new Set(existing.clientFilledKeys)
  const merged: Record<string, string> = { ...existingValues }
  const accepted: string[] = []
  const customerData: { name?: string; email?: string; phone?: string } = {}
  const partyData: { childrenCount?: number; adultsCount?: number; totalParticipants?: number } = {}

  for (const [key, rawValue] of Object.entries(parsed.data)) {
    const value = rawValue.trim()

    if (extraVariables.has(key)) {
      if (existingValues[key] && !filledKeys.has(key)) continue
      merged[key] = rawValue
      if (value !== '') accepted.push(key)
      continue
    }

    if (value === '' || !bodyHasVariable(existing.body, key)) continue

    if ((CUSTOMER_KEYS as readonly string[]).includes(key)) {
      if (key === 'cliente_name') {
        if (!party.customer.name?.trim()) customerData.name = value
      } else if (key === 'cliente_email') {
        if (party.customer.email?.trim()) continue
        if (!EmailSchema.safeParse(value).success) {
          return NextResponse.json({ error: 'E-mail inválido' }, { status: 400 })
        }
        customerData.email = value
      } else {
        if (party.customer.phone?.trim()) continue
        const digits = value.replace(/\D/g, '')
        if (digits.length < 10 || digits.length > 13) {
          return NextResponse.json({ error: 'Telefone inválido' }, { status: 400 })
        }
        customerData.phone = digits
      }
      continue
    }

    if (Object.hasOwn(PARTY_COUNT_FIELDS, key)) {
      const field = PARTY_COUNT_FIELDS[key as keyof typeof PARTY_COUNT_FIELDS]
      if (party[field] !== null) continue
      if (!/^\d{1,6}$/.test(value)) {
        return NextResponse.json({ error: 'Informe um número inteiro maior ou igual a zero' }, { status: 400 })
      }
      partyData[field] = Number(value)
    }
  }

  const contract = await prisma.$transaction(async (tx) => {
    if (Object.keys(customerData).length > 0) {
      await tx.customer.update({ where: { id: party.customerId }, data: customerData })
    }
    if (Object.keys(partyData).length > 0) {
      await tx.party.update({ where: { id: party.id }, data: partyData })
    }
    return tx.contract.update({
      where: { clientToken: hash },
      data: {
        fieldValues: merged,
        clientFilledKeys: [...new Set([...existing.clientFilledKeys, ...accepted])],
      },
      include: CONTRACT_INCLUDE,
    })
  })
  return NextResponse.json(contract)
}
