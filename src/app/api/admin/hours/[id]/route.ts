import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { requireRole } from '@/lib/authz'
import { prisma } from '@/lib/prisma'
import { BusinessHourSchema } from '@/lib/schemas/business-hours'
import { BUSINESS_HOURS_CACHE_TAG } from '@/lib/business-hours'

function parseId(raw: string) {
  const id = Number(raw)
  return Number.isInteger(id) ? id : null
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireRole(['admin'])
  if (response) return response

  const id = parseId((await params).id)
  if (id === null)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const hour = await prisma.businessHour.findUnique({ where: { id } })
  if (!hour) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(hour)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireRole(['admin'])
  if (response) return response

  const id = parseId((await params).id)
  if (id === null)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const parsed = BusinessHourSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const existing = await prisma.businessHour.findUnique({ where: { id } })
  if (!existing)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const hour = await prisma.businessHour.update({
    where: { id },
    data: parsed.data,
  })
  revalidateTag(BUSINESS_HOURS_CACHE_TAG, 'max')
  return NextResponse.json(hour)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireRole(['admin'])
  if (response) return response

  const id = parseId((await params).id)
  if (id === null)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const existing = await prisma.businessHour.findUnique({ where: { id } })
  if (!existing)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (existing.key) {
    return NextResponse.json(
      {
        error:
          'Este horário é utilizado pelo sistema e não pode ser removido, apenas editado.',
      },
      { status: 403 }
    )
  }

  await prisma.businessHour.delete({ where: { id } })
  revalidateTag(BUSINESS_HOURS_CACHE_TAG, 'max')
  return NextResponse.json({ success: true })
}
