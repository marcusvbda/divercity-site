import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ServiceSchema } from '@/lib/schemas/parties'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const service = await prisma.service.findUnique({ where: { id: Number(id) } })
  if (!service) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(service)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const parsed = ServiceSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const service = await prisma.service.update({
    where: { id: Number(id) },
    data: parsed.data,
  })
  return NextResponse.json(service)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const service = await prisma.service.findUnique({ where: { id: Number(id) } })
  if (!service) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (service.key) {
    return NextResponse.json(
      { error: 'Este serviço é utilizado pelo sistema e não pode ser removido, apenas editado.' },
      { status: 403 }
    )
  }

  await prisma.service.delete({ where: { id: Number(id) } })
  return NextResponse.json({ success: true })
}
