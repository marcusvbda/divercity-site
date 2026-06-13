import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const contracts = await prisma.contract.findMany({
    include: {
      party: { include: { customer: true, contractTemplate: true } },
    },
    orderBy: { party: { date: 'asc' } },
  })
  return NextResponse.json({ data: contracts })
}
