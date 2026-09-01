import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ServiceSchema } from '@/lib/schemas/parties'

export async function GET(req: NextRequest) {
  const page = Number(req.nextUrl.searchParams.get('page') ?? '1')
  const perPage = Math.min(Number(req.nextUrl.searchParams.get('perPage') ?? '15'), 100)
  const search = req.nextUrl.searchParams.get('search') ?? ''
  const sort = req.nextUrl.searchParams.get('sort') ?? 'name'
  const dir = (req.nextUrl.searchParams.get('dir') ?? 'asc') as 'asc' | 'desc'

  const allowedSort: Record<string, boolean> = { name: true, createdAt: true }
  const orderBy = allowedSort[sort] ? { [sort]: dir } : { name: 'asc' as const }

  const where = search ? { name: { contains: search, mode: 'insensitive' as const } } : undefined

  const [data, total] = await Promise.all([
    prisma.service.findMany({
      where,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.service.count({ where }),
  ])

  return NextResponse.json({
    data,
    pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = ServiceSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const service = await prisma.service.create({ data: parsed.data })
  return NextResponse.json(service, { status: 201 })
}
