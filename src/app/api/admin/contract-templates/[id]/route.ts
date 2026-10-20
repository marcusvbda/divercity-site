import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/authz'
import { deletePartiesCascade } from '@/lib/parties'
import { ContractTemplateSchema } from '@/lib/schemas/parties'
import { isDefaultVariable } from '@/lib/contract-defaults'
import { extractBodyVariables } from '@/lib/contract-render'

function extractVariables(body: string): string[] {
  const matches = body.match(/\{\{(\w+)\}\}/g) ?? []
  return [...new Set(matches.map((m) => m.replace(/[{}]/g, '')))].filter(v => !isDefaultVariable(v))
}

function pickVariableLabels(body: string, labels: Record<string, string>): Record<string, string> {
  const used = new Set(extractBodyVariables(body))
  return Object.fromEntries(
    Object.entries(labels).filter(([key, label]) => used.has(key) && label.trim() !== ''),
  )
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const template = await prisma.contractTemplate.findUnique({ where: { id: Number(id) } })
  if (!template) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(template)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const parsed = ContractTemplateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const variables = extractVariables(parsed.data.body)
  const variableTypes = parsed.data.variableTypes
    ? Object.fromEntries(
        Object.entries(parsed.data.variableTypes).filter(([key]) => variables.includes(key)),
      )
    : undefined
  const variableLabels = parsed.data.variableLabels
    ? pickVariableLabels(parsed.data.body, parsed.data.variableLabels)
    : undefined

  const template = await prisma.$transaction(async (tx) => {
    if (parsed.data.isDefault) {
      await tx.contractTemplate.updateMany({
        where: { isDefault: true, id: { not: Number(id) } },
        data: { isDefault: false },
      })
    }

    const updated = await tx.contractTemplate.update({
      where: { id: Number(id) },
      data: { ...parsed.data, variables, variableTypes, variableLabels },
    })

    const nonSignedContracts = await tx.contract.findMany({
      where: {
        status: { notIn: ['signed', 'completed', 'cancelled'] },
        party: { contractTemplateId: Number(id) },
      },
    })

    for (const contract of nonSignedContracts) {
      const existing = contract.fieldValues as Record<string, string>
      const newFieldValues: Record<string, string> = {}
      for (const v of variables) {
        newFieldValues[v] = existing[v] ?? ''
      }
      await tx.contract.update({
        where: { id: contract.id },
        data: { body: parsed.data.body, fieldValues: newFieldValues },
      })
    }

    return updated
  })

  return NextResponse.json(template)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireRole(['admin'])
  if (response) return response

  const id = Number((await params).id)
  if (!Number.isInteger(id)) return NextResponse.json({ error: 'Modelo não encontrado' }, { status: 404 })

  const result = await prisma.$transaction(async (tx) => {
    const template = await tx.contractTemplate.findUnique({ where: { id }, select: { isDefault: true } })
    if (!template) return { kind: 'not_found' as const }
    if (template.isDefault) return { kind: 'default' as const }

    const activeCount = await tx.party.count({
      where: { contractTemplateId: id, status: { not: 'cancelled' } },
    })
    if (activeCount > 0) return { kind: 'in_use' as const, count: activeCount }

    const cancelled = await tx.party.findMany({
      where: { contractTemplateId: id, status: 'cancelled' },
      select: { id: true },
    })
    const deletedParties = await deletePartiesCascade(tx, cancelled.map((p) => p.id))
    await tx.contractTemplate.delete({ where: { id } })
    return { kind: 'deleted' as const, deletedParties }
  })

  switch (result.kind) {
    case 'not_found':
      return NextResponse.json({ error: 'Modelo não encontrado' }, { status: 404 })
    case 'default':
      return NextResponse.json(
        { error: 'O modelo padrão não pode ser excluído. Marque outro modelo como padrão antes.' },
        { status: 409 },
      )
    case 'in_use':
      return NextResponse.json(
        {
          error: `Modelo em uso por ${result.count} festa(s) não cancelada(s). Cancele ou exclua essas festas antes de remover o modelo.`,
        },
        { status: 409 },
      )
    default:
      return NextResponse.json({ success: true, deletedParties: result.deletedParties })
  }
}
