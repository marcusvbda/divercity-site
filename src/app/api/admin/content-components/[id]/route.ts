import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const componentId = parseInt(id)
  if (isNaN(componentId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const component = await prisma.contentComponent.findUnique({
    where: { id: componentId },
    include: {
      fields: {
        orderBy: { id: 'asc' },
        include: {
          values: {
            include: {
              instance: {
                include: {
                  fieldValues: {
                    include: { field: { select: { id: true, name: true } } },
                    orderBy: { id: 'asc' },
                  },
                  templateComponent: {
                    include: {
                      fields: { orderBy: { id: 'asc' }, select: { id: true, name: true } },
                    },
                  },
                },
              },
            },
            orderBy: { id: 'asc' },
          },
        },
      },
    },
  })

  if (!component) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(component)
}
