import { prisma } from '@/lib/prisma'
import CMSContent from './CMSContent'

export default async function CMSPage() {
  const contentTypes = await prisma.contentType.findMany({
    select: { id: true, name: true },
    orderBy: { id: 'asc' },
  })

  return <CMSContent contentTypes={contentTypes} />
}
