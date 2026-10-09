'use client'

import { useState } from 'react'
import { revalidateCMSCache, revalidateCMSType } from '../actions'
import {
  RefreshCcwIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  DatabaseIcon,
} from 'lucide-react'
import { Button } from '@/components/admin/ui/button'
import { Badge } from '@/components/admin/ui/badge'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/admin/ui/alert'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/admin/ui/card'
import { cn } from '@/lib/utils'

type ContentType = { id: number; name: string }

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
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <DatabaseIcon className="text-muted-foreground size-5" />
          <div>
            <h1 className="text-2xl font-semibold">Seções do CMS</h1>
            <p className="text-muted-foreground text-sm">
              Conteúdo carregado dinamicamente do banco de dados
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {allStatus === 'success' && (
            <span className="text-primary flex items-center gap-1.5 text-sm font-medium">
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

      <Alert>
        <AlertTriangleIcon />
        <AlertTitle>Atenção</AlertTitle>
        <AlertDescription>
          Alterações feitas no CMS só ficam visíveis no site público após a
          limpeza do cache da seção correspondente. O conteúdo atualizado será
          servido na próxima requisição ao site.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {contentTypes.map((type) => {
          const status = cardStatus[type.name] ?? 'idle'
          const revalidatedAt = lastRevalidated[type.name]

          return (
            <Card key={type.id}>
              <CardHeader>
                <div className="flex items-center gap-2.5">
                  <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold">
                    {type.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="truncate">{type.name}</CardTitle>
                    <CardDescription className="font-mono text-xs">
                      cms:{type.name}
                    </CardDescription>
                  </div>
                </div>
                {status === 'success' && (
                  <CheckCircleIcon className="text-primary size-4 shrink-0" />
                )}
              </CardHeader>
              <CardContent className="mt-auto flex flex-col gap-3">
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
                  className="w-full"
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
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
