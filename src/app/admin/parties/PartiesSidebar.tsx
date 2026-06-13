'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { CalendarIcon, ListIcon } from 'lucide-react'
import { AdminSubSidebar } from '@/components/ui/admin-sub-sidebar'
import { NavSkeleton } from '@/components/ui/nav-skeleton'
import type { Party } from '@/types/parties'

export function PartiesSidebar() {
  const params = useParams()
  const partyId = params?.id as string | undefined

  const { data: party, isLoading } = useQuery<Party>({
    queryKey: ['admin', 'parties', partyId],
    queryFn: () => fetch(`/api/admin/parties/${partyId}`).then((r) => r.json()),
    enabled: !!partyId,
  })

  const partyLabel = party
    ? `${party.customer?.name?.split(' ')[0]} · ${new Date(party.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`
    : null

  const partyExtra = partyId ? (
    <>
      <div className="mx-2 my-1 border-t" />
      {isLoading ? (
        <NavSkeleton count={1} className="mx-1 h-8 bg-gray-300/20" varyWidth />
      ) : partyLabel ? (
        <div className="px-3 py-1">
          <p className="text-muted-foreground truncate text-xs font-medium">{partyLabel}</p>
        </div>
      ) : null}
    </>
  ) : undefined

  return (
    <AdminSubSidebar
      sections={[
        {
          label: 'Festas',
          items: [
            { title: 'Agenda', href: '/admin/parties', icon: CalendarIcon, exact: true },
          ],
          extra: partyExtra,
        },
        {
          label: 'Modelos de Contrato',
          items: [
            { title: 'Modelos', href: '/admin/contract-templates', icon: ListIcon },
          ],
        },
      ]}
    />
  )
}
