import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { componentFieldId, templateComponentId, subFields } = await req.json()

  if (!componentFieldId || !templateComponentId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const result = await prisma.$transaction(async (tx) => {
    const templateFields = await tx.componentField.findMany({
      where: { contentComponentId: templateComponentId },
      orderBy: { id: 'asc' },
      select: { id: true },
    })

    const instance = await tx.componentInstance.create({
      data: { templateComponentId },
    })

    const fieldMap: Record<number, string> = {}
    if (Array.isArray(subFields)) {
      for (const sf of subFields) fieldMap[sf.fieldId] = sf.value ?? ''
    }

    await tx.componentInstanceFieldValue.createMany({
      data: templateFields.map((tf) => ({
        instanceId: instance.id,
        fieldId: tf.id,
        value: fieldMap[tf.id] ?? '',
      })),
    })

    return tx.componentFieldValue.create({
      data: { componentFieldId, instanceId: instance.id },
    })
  })

  return NextResponse.json(result, { status: 201 })
}
