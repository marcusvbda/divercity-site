import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiToken } from '@/lib/content-api/tokens'
import { resolveContentEntity } from '@/lib/content-api/entities'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ entity: string; id: string }> }
) {
  const apiToken = await authenticateApiToken(req)
  if (!apiToken) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
  }

  const { entity: entityName, id: rawId } = await params
  const entity = resolveContentEntity(entityName)
  if (!entity) {
    return NextResponse.json({ error: 'Entidade não encontrada' }, { status: 404 })
  }

  const id = entity.parseId(rawId)
  if (id === null) {
    return NextResponse.json({ error: 'Id inválido' }, { status: 400 })
  }

  const record = await entity.find(id)
  if (!record) {
    return NextResponse.json({ error: 'Registro não encontrado' }, { status: 404 })
  }

  return NextResponse.json({ data: record })
}
