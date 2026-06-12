'use client'

import { useState } from 'react'
import { revalidateCMSCache, revalidateCMSType } from '../actions'
import {
  RefreshCcwIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  DatabaseIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type ContentType = { id: number; name: string }

const PALETTE = [
  { icon: 'bg-brand-cyan/10', text: 'text-brand-cyan' },
  { icon: 'bg-brand-purple/10', text: 'text-brand-purple' },
  { icon: 'bg-brand-pink/10', text: 'text-brand-pink' },
  { icon: 'bg-brand-lime/10', text: 'text-brand-lime' },
  { icon: 'bg-brand-yellow/10', text: 'text-brand-yellow' },
]

type CardStatus = 'idle' | 'loading' | 'success' | 'error'

export default function CMSContent({
  contentTypes,
}: {
  contentTypes: ContentType[]
}) {
  const [allStatus, setAllStatus] = useState<CardStatus>('idle')
  const [cardStatus, setCardStatus] = useState<Record<string, CardStatus>>({})
  const [lastRevalidated, setLastRevalidated] = useState<
    Record<string, string>
  >({})

  function formatTime(iso: string) {
    return new Date(iso).toLocaleString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  async function handleRevalidateAll() {
    setAllStatus('loading')
    try {
      await revalidateCMSCache()
      const now = new Date().toISOString()
      const allCleared = Object.fromEntries(
        contentTypes.map((t) => [t.name, 'success' as CardStatus])
      )
      const allTimes = Object.fromEntries(
        contentTypes.map((t) => [t.name, now])
      )
      setCardStatus(allCleared)
      setLastRevalidated(allTimes)
      setAllStatus('success')
    } catch {
      setAllStatus('error')
    }
  }

  async function handleRevalidateType(name: string) {
    setCardStatus((prev) => ({ ...prev, [name]: 'loading' }))
    try {
      const { revalidatedAt } = await revalidateCMSType(name)
      setCardStatus((prev) => ({ ...prev, [name]: 'success' }))
      setLastRevalidated((prev) => ({ ...prev, [name]: revalidatedAt }))
    } catch {
      setCardStatus((prev) => ({ ...prev, [name]: 'error' }))
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <DatabaseIcon className="text-muted-foreground size-5" />
          <div>
            <h1 className="text-xl font-semibold">Seções do CMS</h1>
            <p className="text-muted-foreground text-sm">
              Conteúdo carregado dinamicamente do banco de dados
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {allStatus === 'success' && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
              <CheckCircleIcon className="size-4" />
              Todos limpos!
            </span>
          )}
          {allStatus === 'error' && (
            <span className="text-destructive text-sm">
              Erro. Tente novamente.
            </span>
          )}
          <Badge variant="secondary" className="ml-2 shrink-0">
            {contentTypes.length} seções
          </Badge>
          <Button
            onClick={handleRevalidateAll}
            disabled={allStatus === 'loading'}
            variant="outline"
            size="sm"
          >
            <RefreshCcwIcon
              className={cn(
                'size-4',
                allStatus === 'loading' && 'animate-spin'
              )}
            />
            {allStatus === 'loading' ? 'Limpando...' : 'Limpar todos'}
          </Button>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
        <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-amber-600" />
        <p className="text-xs text-amber-800">
          <strong>Atenção:</strong> Alterações feitas no CMS só ficam visíveis
          no site público após a limpeza do cache da seção correspondente. O
          conteúdo atualizado será servido na próxima requisição ao site.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {contentTypes.map((type, i) => {
          const palette = PALETTE[i % PALETTE.length]
          const status = cardStatus[type.name] ?? 'idle'
          const revalidatedAt = lastRevalidated[type.name]

          return (
            <div
              key={type.id}
              className="bg-card flex flex-col gap-4 rounded-xl border p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      'flex size-9 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold',
                      palette.icon,
                      palette.text
                    )}
                  >
                    {type.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm leading-tight font-semibold">
                      {type.name}
                    </p>
                    <p className="text-muted-foreground font-mono text-xs">
                      cms:{type.name}
                    </p>
                  </div>
                </div>
                {status === 'success' && (
                  <CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-green-500" />
                )}
              </div>

              {revalidatedAt && (
                <p className="text-muted-foreground text-xs">
                  Limpo às {formatTime(revalidatedAt)}
                </p>
              )}

              <Button
                size="sm"
                variant={status === 'success' ? 'outline' : 'default'}
                disabled={status === 'loading'}
                onClick={() => handleRevalidateType(type.name)}
                className={cn(
                  'mt-auto w-full',
                  status !== 'success' &&
                    'bg-brand-cyan hover:bg-brand-cyan/90 text-white'
                )}
              >
                <RefreshCcwIcon
                  className={cn(
                    'size-3.5',
                    status === 'loading' && 'animate-spin'
                  )}
                />
                {status === 'loading'
                  ? 'Limpando...'
                  : status === 'success'
                    ? 'Limpar novamente'
                    : 'Limpar cache'}
              </Button>

              {status === 'error' && (
                <p className="text-destructive text-center text-xs">
                  Erro. Tente novamente.
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
