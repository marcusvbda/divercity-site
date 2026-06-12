'use client'

import { BlocksIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/data-table/DataTable'

type ContentType = { id: number; name: string }

const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Nome', sortable: true, editable: true },
  {
    key: 'name',
    label: 'Tag de Cache',
    render: (_: unknown, row: ContentType) => (
      <Badge variant="outline" className="font-mono text-xs">
        cms:{row.name}
      </Badge>
    ),
  },
]

export default function ComponentTypesPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex items-center gap-2">
        <BlocksIcon className="size-5 text-muted-foreground" />
        <h1 className="text-xl font-semibold">Tipos de Conteúdo</h1>
      </div>

      <DataTable<ContentType>
        queryKey={['admin', 'content-types']}
        endpoint="/api/admin/content-types"
        columns={columns}
        defaultSort="id"
        defaultLimit={10}
      />
    </div>
  )
}
