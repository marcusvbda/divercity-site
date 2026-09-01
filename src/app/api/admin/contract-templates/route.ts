import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ContractTemplateSchema } from '@/lib/schemas/parties'
import { isDefaultVariable } from '@/lib/contract-defaults'

function extractVariables(body: string): string[] {
  const matches = body.match(/\{\{(\w+)\}\}/g) ?? []
  return [...new Set(matches.map((m) => m.replace(/[{}]/g, '')))].filter(v => !isDefaultVariable(v))
}

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
    prisma.contractTemplate.findMany({
      where,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.contractTemplate.count({ where }),
  ])

  return NextResponse.json({
    data,
    pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = ContractTemplateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const variables = extractVariables(parsed.data.body)

  const template = await prisma.$transaction(async (tx) => {
    if (parsed.data.isDefault) {
      await tx.contractTemplate.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      })
    }
    return tx.contractTemplate.create({
      data: { ...parsed.data, variables },
    })
  })

  return NextResponse.json(template, { status: 201 })
}
