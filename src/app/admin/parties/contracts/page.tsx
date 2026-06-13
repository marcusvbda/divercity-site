'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import type { Contract, ContractStatus, PartyStatus } from '@/types/parties'

const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  draft: 'Rascunho',
  pending: 'Pendente',
  in_review: 'Em revisão',
  signed: 'Assinado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
}

const CONTRACT_STATUS_VARIANT: Record<ContractStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'outline',
  pending: 'secondary',
  in_review: 'secondary',
  signed: 'default',
  completed: 'default',
  cancelled: 'destructive',
}

type ContractWithParty = Contract & {
  party: {
    id: number
    date: string
    status: PartyStatus
    customer: { name: string }
    contractTemplate: { name: string }
  }
}

export default function AllContractsPage() {
  const { data, isLoading } = useQuery<{ data: ContractWithParty[] }>({
    queryKey: ['admin', 'contracts'],
    queryFn: () => fetch('/api/admin/contracts').then(r => r.json()),
  })

  const contracts = data?.data ?? []

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Todos os Contratos</h1>
        <p className="text-muted-foreground text-sm">Visão geral de todos os contratos</p>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data da festa</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Template</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Link cliente</TableHead>
              <TableHead className="w-28" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : contracts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground py-8 text-center text-sm">
                  Nenhum contrato encontrado
                </TableCell>
              </TableRow>
            ) : (
              contracts.map(contract => (
                <TableRow key={contract.id}>
                  <TableCell>
                    {new Date(contract.party.date).toLocaleDateString('pt-BR', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="font-medium">{contract.party.customer.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{contract.party.contractTemplate.name}</TableCell>
                  <TableCell>
                    <Badge variant={CONTRACT_STATUS_VARIANT[contract.status]}>
                      {CONTRACT_STATUS_LABELS[contract.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={contract.clientLinkOpen ? 'text-green-600 text-sm' : 'text-muted-foreground text-sm'}>
                      {contract.clientLinkOpen ? 'Aberto' : 'Fechado'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" nativeButton={false} render={<Link href={`/admin/parties/${contract.party.id}`} />}>
                        Festa
                      </Button>
                      <Button variant="ghost" size="sm" nativeButton={false} render={<Link href={`/admin/parties/${contract.party.id}/contract`} />}>
                        Contrato
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
