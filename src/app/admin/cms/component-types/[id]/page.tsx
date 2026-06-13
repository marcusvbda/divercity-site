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
    <div className="p-6 md:p-8">
      <div className="mb-8 flex items-center gap-2">
        <ComponentIcon className="text-muted-foreground size-5" />
        <h1 className="text-xl font-semibold">{contentType.name}</h1>
      </div>

      <ComponentCards components={contentType.components} />
    </div>
  )
}
