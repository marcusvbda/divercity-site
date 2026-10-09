import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/authz'
import { prisma } from '@/lib/prisma'
import { UpdateContractPaymentSchema } from '@/lib/schemas/parties'

const LOCKED_STATUSES = ['signed', 'completed', 'cancelled']

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireRole(['admin'])
  if (response) return response

  const { id } = await params
  const contractId = Number(id)
  if (!Number.isInteger(contractId)) {
    return NextResponse.json({ error: 'Contrato não encontrado' }, { status: 404 })
  }

  const body = await req.json().catch(() => null)
  const parsed = UpdateContractPaymentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const existing = await prisma.contract.findUnique({ where: { id: contractId } })
  if (!existing) return NextResponse.json({ error: 'Contrato não encontrado' }, { status: 404 })

  const nextInfo = parsed.data.additionalInfo || null
  const nextValue = parsed.data.value

  if (LOCKED_STATUSES.includes(existing.status)) {
    const sameValue =
      nextValue === null ? existing.value === null : existing.value !== null && existing.value.toNumber() === nextValue
    const sameInfo = nextInfo === (existing.additionalInfo || null)
    if (!sameValue || !sameInfo) {
      return NextResponse.json(
        { error: 'Valor e informações adicionais não podem ser alterados após a assinatura' },
        { status: 403 },
      )
    }
  }

  const contract = await prisma.contract.update({
    where: { id: contractId },
    data: {
      value: nextValue,
      additionalInfo: nextInfo,
      paymentStatus: parsed.data.paymentStatus,
    },
  })
  return NextResponse.json(contract)
}
