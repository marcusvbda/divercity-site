'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, Copy, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/admin/ui/badge'
import { Button } from '@/components/admin/ui/button'
import { Card, CardContent } from '@/components/admin/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/admin/ui/dialog'
import { Field, FieldLabel } from '@/components/admin/ui/field'
import { Input } from '@/components/admin/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/admin/ui/table'
import { createApiToken, revokeApiToken } from './actions'

type ApiTokenItem = {
  id: string
  name: string
  tokenPrefix: string
  createdAt: string
  lastUsedAt: string | null
  revokedAt: string | null
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  })
}

export function ApiTokensContent({ tokens }: { tokens: ApiTokenItem[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState('')
  const [createdToken, setCreatedToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [revokeTarget, setRevokeTarget] = useState<ApiTokenItem | null>(null)

  function handleCreateOpenChange(open: boolean) {
    if (!open && isPending) return
    setCreateOpen(open)
    if (!open) {
      setName('')
      setCreatedToken(null)
      setCopied(false)
    }
  }

  function handleCreate(event: React.FormEvent) {
    event.preventDefault()
    startTransition(async () => {
      try {
        const created = await createApiToken(name)
        setCreatedToken(created.token)
        toast.success('Token criado')
        router.refresh()
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Erro ao criar token'
        )
      }
    })
  }

  async function handleCopy() {
    if (!createdToken) return
    try {
      await navigator.clipboard.writeText(createdToken)
      setCopied(true)
      toast.success('Token copiado')
    } catch {
      toast.error('Não foi possível copiar o token')
    }
  }

  function handleRevoke() {
    if (!revokeTarget) return
    const target = revokeTarget
    startTransition(async () => {
      try {
        await revokeApiToken(target.id)
        toast.success('Token revogado')
        setRevokeTarget(null)
        router.refresh()
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Erro ao revogar token'
        )
      }
    })
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">API tokens</h1>
          <p className="text-muted-foreground text-sm">
            Tokens de acesso à API de conteúdo.{' '}
            <Link
              href="/api-docs"
              className="text-primary underline-offset-4 hover:underline"
            >
              Documentação
            </Link>
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus />
          Novo token
        </Button>
      </div>

      <Card>
        <CardContent>
          {tokens.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              Nenhum token criado
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Prefixo</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Último uso</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tokens.map((token) => {
                  const revoked = token.revokedAt !== null
                  return (
                    <TableRow key={token.id}>
                      <TableCell className="font-medium">
                        {token.name}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {token.tokenPrefix}…
                      </TableCell>
                      <TableCell>{formatDateTime(token.createdAt)}</TableCell>
                      <TableCell>
                        {token.lastUsedAt
                          ? formatDateTime(token.lastUsedAt)
                          : 'Nunca'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={revoked ? 'secondary' : 'default'}>
                          {revoked ? 'Revogado' : 'Ativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {!revoked && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setRevokeTarget(token)}
                          >
                            Revogar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={handleCreateOpenChange}>
        <DialogContent>
          {createdToken ? (
            <>
              <DialogHeader>
                <DialogTitle>Token criado</DialogTitle>
                <DialogDescription>
                  Copie o token agora. Ele não será exibido novamente.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={createdToken}
                  className="font-mono text-xs"
                  onFocus={(event) => event.currentTarget.select()}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  aria-label="Copiar token"
                >
                  {copied ? <Check /> : <Copy />}
                </Button>
              </div>
              <DialogFooter>
                <Button onClick={() => handleCreateOpenChange(false)}>
                  Fechar
                </Button>
              </DialogFooter>
            </>
          ) : (
            <form onSubmit={handleCreate} className="grid gap-6">
              <DialogHeader>
                <DialogTitle>Novo token</DialogTitle>
                <DialogDescription>
                  Dê um nome para identificar onde o token será usado.
                </DialogDescription>
              </DialogHeader>
              <Field>
                <FieldLabel htmlFor="api-token-name">Nome</FieldLabel>
                <Input
                  id="api-token-name"
                  value={name}
                  maxLength={80}
                  autoFocus
                  onChange={(event) => setName(event.target.value)}
                />
              </Field>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => handleCreateOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending || !name.trim()}>
                  {isPending ? 'Criando…' : 'Criar token'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={revokeTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRevokeTarget(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revogar token</DialogTitle>
            <DialogDescription>
              O token &quot;{revokeTarget?.name}&quot; deixará de funcionar
              imediatamente. Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeTarget(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={handleRevoke}
            >
              {isPending ? 'Revogando…' : 'Revogar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
