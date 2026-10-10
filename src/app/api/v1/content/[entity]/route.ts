import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateApiToken } from '@/lib/content-api/tokens'
import { paginationSchema, resolveContentEntity } from '@/lib/content-api/entities'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ entity: string }> }
) {
  const apiToken = await authenticateApiToken(req)
  if (!apiToken) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
  }

  const { entity: entityName } = await params
  const entity = resolveContentEntity(entityName)
  if (!entity) {
    return NextResponse.json({ error: 'Entidade não encontrada' }, { status: 404 })
  }

  const query = Object.fromEntries(req.nextUrl.searchParams)
  const filters = entity.filtersSchema.safeParse(query)
  if (!filters.success) {
    return NextResponse.json(
      { error: 'Parâmetros inválidos', details: z.flattenError(filters.error) },
      { status: 400 }
    )
  }

  const pagination = paginationSchema.safeParse(query)
  if (!pagination.success) {
    return NextResponse.json(
      { error: 'Parâmetros inválidos', details: z.flattenError(pagination.error) },
      { status: 400 }
    )
  }

  const { page, perPage } = pagination.data
  const { data, total } = await entity.list(filters.data, page, perPage)

  return NextResponse.json({
    data,
    pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
  })
}
