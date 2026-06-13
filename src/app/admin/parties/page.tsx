'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PlusIcon, ListIcon, CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AdminDataTable } from '@/components/ui/admin-data-table'
import { PartyCalendar } from './PartyCalendar'
import type { Party, PartyStatus } from '@/types/parties'
import type { Column } from '@/components/ui/admin-data-table'

const STATUS_LABELS: Record<PartyStatus, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
}

const STATUS_VARIANT: Record<PartyStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'outline',
  confirmed: 'default',
  cancelled: 'destructive',
}

const columns: Column<Party>[] = [
  {
    key: 'date',
    header: 'Data',
    sortable: true,
    render: r => (
      <>
        {new Date(r.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
        <span className="text-muted-foreground ml-1 text-xs">
          {new Date(r.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </>
    ),
  },
  { key: 'customer', header: 'Cliente', render: r => <span className="font-medium">{r.customer?.name}</span> },
  { key: 'template', header: 'Template', render: r => <span className="text-muted-foreground text-sm">{r.contractTemplate?.name}</span> },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: r => (
      <Badge variant={STATUS_VARIANT[r.status]}>
        {STATUS_LABELS[r.status]}
      </Badge>
    ),
  },
]

export default function PartiesPage() {
  const [view, setView] = useState<'list' | 'calendar'>('list')

  const { data, isLoading } = useQuery<{ data: Party[] }>({
    queryKey: ['admin', 'parties', 'calendar'],
    queryFn: () => fetch('/api/admin/parties?perPage=100').then(r => r.json()),
    enabled: view === 'calendar',
  })

  const calendarParties = data?.data ?? []

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agenda</h1>
          <p className="text-muted-foreground text-sm">Festas cadastradas no Divercity Park</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border p-1">
            <Button
              variant={view === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('list')}
            >
              <ListIcon className="size-4" />
              Lista
            </Button>
            <Button
              variant={view === 'calendar' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('calendar')}
            >
              <CalendarIcon className="size-4" />
              Calendário
            </Button>
          </div>
          <Button nativeButton={false} render={<Link href="/admin/parties/new" />}>
            <PlusIcon className="size-4" />
            Nova festa
          </Button>
        </div>
      </div>

      {view === 'calendar' ? (
        <PartyCalendar parties={calendarParties} isLoading={isLoading} />
      ) : (
        <AdminDataTable<Party>
          queryKey={['admin', 'parties']}
          endpoint="/api/admin/parties"
          columns={columns}
          actions={party => (
            <Button variant="ghost" size="sm" nativeButton={false} render={<Link href={`/admin/parties/${party.id}`} />}>
              Ver
            </Button>
          )}
        />
      )}
    </div>
  )
}
