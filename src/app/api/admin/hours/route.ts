import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { requireRole } from '@/lib/authz'
import { prisma } from '@/lib/prisma'
import { BusinessHourSchema } from '@/lib/schemas/business-hours'
import { BUSINESS_HOURS_CACHE_TAG } from '@/lib/business-hours'

export async function GET(req: NextRequest) {
  const { response } = await requireRole(['admin'])
  if (response) return response

  const page = Math.max(
    Number(req.nextUrl.searchParams.get('page') ?? '1') || 1,
    1
  )
  const perPage = Math.min(
    Math.max(Number(req.nextUrl.searchParams.get('perPage') ?? '15') || 15, 1),
    100
  )
  const search = req.nextUrl.searchParams.get('search') ?? ''
  const sort = req.nextUrl.searchParams.get('sort') ?? 'id'
  const dir = req.nextUrl.searchParams.get('dir') === 'desc' ? 'desc' : 'asc'

  const allowedSort: Record<string, boolean> = {
    id: true,
    label: true,
    createdAt: true,
  }
  const orderBy = allowedSort[sort] ? { [sort]: dir } : { id: 'asc' as const }

  const where = search
    ? { label: { contains: search, mode: 'insensitive' as const } }
    : undefined

  const [data, total] = await Promise.all([
    prisma.businessHour.findMany({
      where,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.businessHour.count({ where }),
  ])

  return NextResponse.json({
    data,
    pagination: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
  })
}

export async function POST(req: NextRequest) {
  const { response } = await requireRole(['admin'])
  if (response) return response

  const body = await req.json()
  const parsed = BusinessHourSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const hour = await prisma.businessHour.create({ data: parsed.data })
  revalidateTag(BUSINESS_HOURS_CACHE_TAG, 'max')
  return NextResponse.json(hour, { status: 201 })
}
