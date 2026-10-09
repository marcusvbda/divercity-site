import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ComponentIcon } from 'lucide-react'
import { ComponentCards } from './ComponentCards'

type Props = { params: Promise<{ id: string }> }

export default async function ComponentTypePage({ params }: Props) {
  const { id } = await params
  const typeId = parseInt(id)

  if (isNaN(typeId)) notFound()

  const contentType = await prisma.contentType.findUnique({
    where: { id: typeId },
    include: { components: { orderBy: { id: 'asc' }, select: { id: true, name: true } } },
  })

  if (!contentType) notFound()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-2">
        <ComponentIcon className="text-muted-foreground size-5" />
        <h1 className="text-2xl font-semibold">{contentType.name}</h1>
      </div>

      <ComponentCards components={contentType.components} />
    </div>
  )
}
