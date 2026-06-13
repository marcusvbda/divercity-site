'use client'

import { useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PartyForm } from '../PartyForm'
import type { PartyFormData } from '../PartyForm'
import { PartyContractTab } from './PartyContractTab'
import type { Party } from '@/types/parties'

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
      <div>
        <h1 className="text-2xl font-bold">Festa — {party?.customer?.name}</h1>
        <p className="text-muted-foreground text-sm">
          {party?.date && new Date(party.date).toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'long', year: 'numeric',
          })}
        </p>
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
