import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ContractTemplateSchema } from '@/lib/schemas/parties'
import { isDefaultVariable } from '@/lib/contract-defaults'

function extractVariables(body: string): string[] {
  const matches = body.match(/\{\{(\w+)\}\}/g) ?? []
  return [...new Set(matches.map((m) => m.replace(/[{}]/g, '')))].filter(v => !isDefaultVariable(v))
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

  const template = await prisma.$transaction(async (tx) => {
    if (parsed.data.isDefault) {
      await tx.contractTemplate.updateMany({
        where: { isDefault: true, id: { not: Number(id) } },
        data: { isDefault: false },
      })
    }

    const updated = await tx.contractTemplate.update({
      where: { id: Number(id) },
      data: { ...parsed.data, variables },
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
  const { id } = await params
  await prisma.contractTemplate.delete({ where: { id: Number(id) } })
  return NextResponse.json({ success: true })
}
