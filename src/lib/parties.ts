import type { Prisma } from '@/generated/prisma/client'

export async function deletePartiesCascade(tx: Prisma.TransactionClient, partyIds: number[]) {
  if (partyIds.length === 0) return 0
  await tx.guest.deleteMany({ where: { partyId: { in: partyIds } } })
  await tx.contract.deleteMany({ where: { partyId: { in: partyIds } } })
  const { count } = await tx.party.deleteMany({ where: { id: { in: partyIds } } })
  return count
}
