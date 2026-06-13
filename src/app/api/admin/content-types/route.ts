import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const VALID_SORT = ['id', 'name'] as const

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '10')))
  const rawSort = searchParams.get('sort') ?? 'id'
  const sort = (VALID_SORT as readonly string[]).includes(rawSort) ? rawSort : 'id'
  const order: 'asc' | 'desc' = searchParams.get('order') === 'desc' ? 'desc' : 'asc'
  const filter = searchParams.get('filter') ?? ''
  const editableParam = searchParams.get('editable')

  const where: Record<string, unknown> = {}
  if (filter) where.name = { contains: filter, mode: 'insensitive' }
  if (editableParam !== null) where.editable = editableParam !== 'false'

  const [data, total] = await Promise.all([
    prisma.contentType.findMany({
      where,
      orderBy: { [sort]: order },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.contentType.count({ where }),
  ])

  return NextResponse.json({
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  })
}
