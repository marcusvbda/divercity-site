'use client'

import { useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { BanIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PartyForm } from '../PartyForm'
import type { PartyFormData } from '../PartyForm'
import { PartyContractTab } from './PartyContractTab'
import type { Party, PartyStatus } from '@/types/parties'

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

export default function EditPartyPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()

  const { data: party, isLoading } = useQuery<Party>({
    queryKey: ['admin', 'parties', id],
    queryFn: () => fetch(`/api/admin/parties/${id}`).then(r => r.json()),
  })

  const mutation = useMutation({
    mutationFn: (data: PartyFormData) =>
      fetch(`/api/admin/parties/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: (result) => {
      if (result?.id) {
        queryClient.invalidateQueries({ queryKey: ['admin', 'parties'] })
        toast.success('Festa atualizada')
      } else {
        toast.error(result?.error ?? 'Erro ao atualizar festa')
      }
    },
    onError: () => toast.error('Erro ao atualizar festa'),
  })

  const cancelMutation = useMutation({
    mutationFn: () =>
      fetch(`/api/admin/parties/${id}/cancel`, { method: 'POST' }).then(r => r.json()),
    onSuccess: (result) => {
      if (result?.id) {
        queryClient.setQueryData(['admin', 'parties', id], result)
        queryClient.invalidateQueries({ queryKey: ['admin', 'parties'] })
        toast.success('Festa cancelada')
      } else {
        toast.error(result?.error ?? 'Erro ao cancelar festa')
      }
    },
    onError: () => toast.error('Erro ao cancelar festa'),
  })

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex max-w-xl flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Festa — {party?.customer?.name}</h1>
            {party?.status && (
              <Badge variant={STATUS_VARIANT[party.status]}>{STATUS_LABELS[party.status]}</Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm">
            {party?.date && new Date(party.date).toLocaleDateString('pt-BR', {
              day: '2-digit', month: 'long', year: 'numeric',
            })}
          </p>
        </div>

        {party?.status && party.status !== 'cancelled' && (
          <Button
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive/10"
            disabled={cancelMutation.isPending}
            onClick={() => {
              if (confirm('Cancelar esta festa? Isso também cancela o contrato em andamento, se houver.')) {
                cancelMutation.mutate()
              }
            }}
          >
            <BanIcon className="size-4" />
            {cancelMutation.isPending ? 'Cancelando...' : 'Cancelar festa'}
          </Button>
        )}
      </div>

      <Tabs defaultValue="dados">
        <TabsList>
          <TabsTrigger value="dados">Dados</TabsTrigger>
          <TabsTrigger value="contrato">Contrato</TabsTrigger>
        </TabsList>

        <TabsContent value="dados" className="mt-4">
          <PartyForm
            defaultValues={party}
            onSubmit={mutation.mutate}
            isLoading={mutation.isPending}
          />
        </TabsContent>

        <TabsContent value="contrato" className="mt-4">
          <PartyContractTab partyId={id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
