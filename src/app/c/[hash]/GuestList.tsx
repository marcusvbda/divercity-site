'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Guest, GuestType } from '@/types/parties'

type Props = { hash: string }

type GuestsResponse = { guests: Guest[]; total: number; limit: number }

export function GuestList({ hash }: Props) {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [type, setType] = useState<GuestType>('child')
  const [formError, setFormError] = useState<string | null>(null)

  const queryKey = ['client', 'contract', hash, 'guests']

  const { data, isLoading } = useQuery<GuestsResponse>({
    queryKey,
    queryFn: () =>
      fetch(`/api/client/contract/${hash}/guests`).then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error ?? 'Erro ao carregar convidados')
        return r.json()
      }),
  })

  const addMutation = useMutation({
    mutationFn: (payload: { name: string; type: GuestType }) =>
      fetch(`/api/client/contract/${hash}/guests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then(async (r) => {
        const json = await r.json()
        if (!r.ok) {
          const message =
            typeof json?.error === 'string'
              ? json.error
              : (json?.error?.fieldErrors?.name?.[0] ?? 'Erro ao adicionar convidado')
          throw new Error(message)
        }
        return json as Guest
      }),
    onSuccess: () => {
      setName('')
      setFormError(null)
      queryClient.invalidateQueries({ queryKey })
    },
    onError: (err: Error) => setFormError(err.message),
  })

  const removeMutation = useMutation({
    mutationFn: (guestId: number) =>
      fetch(`/api/client/contract/${hash}/guests/${guestId}`, { method: 'DELETE' }).then(
        async (r) => {
          if (!r.ok) throw new Error((await r.json()).error ?? 'Erro ao remover convidado')
          return r.json()
        },
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  if (isLoading) {
    return (
      <div className="mt-8 rounded-lg border p-6">
        <p className="text-muted-foreground text-sm">Carregando lista de convidados...</p>
      </div>
    )
  }

  if (!data) return null

  const { guests, total, limit } = data
  const isFull = total >= limit
  const isNearLimit = total >= limit - 5

  const children = guests.filter((g) => g.type === 'child')
  const adults = guests.filter((g) => g.type === 'adult')

  function handleAdd() {
    if (!name.trim()) {
      setFormError('Informe o nome do convidado')
      return
    }
    addMutation.mutate({ name: name.trim(), type })
  }

  return (
    <div className="mt-8 rounded-lg border p-6">
      <h2 className="text-lg font-bold">Lista de Convidados</h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Cadastre aqui as crianças e adultos que participarão da festa.
      </p>

      <div
        className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
          isNearLimit
            ? 'border-red-300 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950/20 dark:text-red-400'
            : 'text-muted-foreground border-border bg-muted/30'
        }`}
      >
        <p className="font-semibold">
          Total: {total} / {limit} participantes
        </p>
        <p className="mt-0.5 text-xs">
          Crianças utilizarão os brinquedos e precisarão de passaporte. Adultos participarão da
          festa, mas não utilizarão os brinquedos.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold">Crianças ({children.length})</h3>
          {children.length === 0 ? (
            <p className="text-muted-foreground mt-2 text-xs">Nenhuma criança cadastrada.</p>
          ) : (
            <ul className="mt-2 flex flex-col gap-2">
              {children.map((guest) => (
                <GuestRow
                  key={guest.id}
                  guest={guest}
                  onRemove={() => removeMutation.mutate(guest.id)}
                  isRemoving={removeMutation.isPending && removeMutation.variables === guest.id}
                />
              ))}
            </ul>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold">Adultos ({adults.length})</h3>
          {adults.length === 0 ? (
            <p className="text-muted-foreground mt-2 text-xs">Nenhum adulto cadastrado.</p>
          ) : (
            <ul className="mt-2 flex flex-col gap-2">
              {adults.map((guest) => (
                <GuestRow
                  key={guest.id}
                  guest={guest}
                  onRemove={() => removeMutation.mutate(guest.id)}
                  isRemoving={removeMutation.isPending && removeMutation.variables === guest.id}
                />
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-6 border-t pt-6">
        {isFull ? (
          <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-400">
            Limite de 50 participantes atingido.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Nome do convidado</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome completo"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Tipo</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setType('child')}
                  className={`flex-1 rounded-md border px-3 py-2 text-sm ${
                    type === 'child'
                      ? 'border-primary bg-primary/10 font-semibold'
                      : 'border-border'
                  }`}
                >
                  Criança
                </button>
                <button
                  type="button"
                  onClick={() => setType('adult')}
                  className={`flex-1 rounded-md border px-3 py-2 text-sm ${
                    type === 'adult'
                      ? 'border-primary bg-primary/10 font-semibold'
                      : 'border-border'
                  }`}
                >
                  Adulto
                </button>
              </div>
            </div>

            {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}

            <Button onClick={handleAdd} disabled={addMutation.isPending}>
              {addMutation.isPending ? 'Adicionando...' : 'Adicionar convidado'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function GuestRow({
  guest,
  onRemove,
  isRemoving,
}: {
  guest: Guest
  onRemove: () => void
  isRemoving: boolean
}) {
  return (
    <li className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm">
      <div className="flex items-center gap-2">
        <span>{guest.name}</span>
        <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
          {guest.type === 'child' ? 'Criança' : 'Adulto'}
        </span>
      </div>
      <button
        type="button"
        onClick={onRemove}
        disabled={isRemoving}
        className="text-xs text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
      >
        {isRemoving ? 'Removendo...' : 'Remover'}
      </button>
    </li>
  )
}
