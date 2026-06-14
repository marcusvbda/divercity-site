'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TipTapEditor } from '@/components/ui/tiptap-editor'
import type { ContractTemplateInput } from '@/lib/schemas/parties'
import { isDefaultVariable } from '@/lib/contract-defaults'

type VariableItem = { key: string; variable: string; label: string }
type ContractVariables = { cliente: VariableItem[]; festa: VariableItem[] }

type Props = {
  defaultValues?: Partial<ContractTemplateInput>
  onSubmit: (data: ContractTemplateInput) => void
  isLoading?: boolean
}

export function TemplateForm({ defaultValues, onSubmit, isLoading }: Props) {
  const [name, setName] = useState(defaultValues?.name ?? '')
  const [body, setBody] = useState(defaultValues?.body ?? '')
  const [errors, setErrors] = useState<{ name?: string; body?: string }>({})

  const { data: contractVars, isLoading: varsLoading } = useQuery<ContractVariables>({
    queryKey: ['admin', 'contract-variables'],
    queryFn: () => fetch('/api/admin/contract-variables').then(r => r.json()),
    staleTime: Infinity,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newErrors: { name?: string; body?: string } = {}
    if (!name.trim()) newErrors.name = 'Nome é obrigatório'
    if (!body.trim() || body === '<p></p>') newErrors.body = 'Conteúdo é obrigatório'
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})
    onSubmit({ name: name.trim(), body })
  }

  function copyVariable(variable: string) {
    navigator.clipboard.writeText(variable)
    toast.success(`${variable} copiado!`)
  }

  const allDetected = [...new Set((body.match(/\{\{(\w+)\}\}/g) ?? []).map(m => m.replace(/[{}]/g, '')))]
  const customVariables = allDetected.filter(v => !isDefaultVariable(v))

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Nome do modelo *</label>
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ex: Contrato Padrão de Festa"
        />
        {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}
      </div>

      <div className="rounded-lg border p-4">
        <p className="mb-1 text-sm font-semibold">Variáveis padrão disponíveis</p>
        <p className="text-muted-foreground mb-3 text-xs">
          Preenchidas automaticamente a partir dos dados cadastrados. Clique para copiar.
        </p>

        {varsLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-48" />
            <div className="grid gap-2 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
            </div>
          </div>
        ) : contractVars ? (
          <Tabs defaultValue="cliente">
            <TabsList className="mb-3">
              <TabsTrigger value="cliente">Cliente</TabsTrigger>
              <TabsTrigger value="festa">Festa</TabsTrigger>
            </TabsList>

            <TabsContent value="cliente">
              <div className="grid gap-2 sm:grid-cols-2">
                {contractVars.cliente.map(item => (
                  <button
                    key={item.key}
                    type="button"
                    className="flex flex-col items-start rounded-md border px-3 py-2 text-left transition-colors hover:bg-muted"
                    onClick={() => copyVariable(item.variable)}
                  >
                    <span className="font-mono text-xs font-medium">{item.variable}</span>
                    <span className="text-muted-foreground text-xs">{item.label}</span>
                  </button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="festa">
              <div className="grid gap-2 sm:grid-cols-2">
                {contractVars.festa.map(item => (
                  <button
                    key={item.key}
                    type="button"
                    className="flex flex-col items-start rounded-md border px-3 py-2 text-left transition-colors hover:bg-muted"
                    onClick={() => copyVariable(item.variable)}
                  >
                    <span className="font-mono text-xs font-medium">{item.variable}</span>
                    <span className="text-muted-foreground text-xs">{item.label}</span>
                  </button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Conteúdo *</label>
        <TipTapEditor content={body} onChange={setBody} />
        {errors.body && <p className="text-destructive text-xs">{errors.body}</p>}
      </div>

      {customVariables.length > 0 && (
        <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-950/20">
          <p className="mb-1 text-xs font-medium text-amber-700 dark:text-amber-400">
            Variáveis extras detectadas ({customVariables.length}) — serão preenchidas manualmente:
          </p>
          <div className="flex flex-wrap gap-1">
            {customVariables.map(v => (
              <span key={v} className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                {`{{${v}}}`}
              </span>
            ))}
          </div>
        </div>
      )}

      <Button type="submit" disabled={isLoading} className="w-fit">
        {isLoading ? 'Salvando...' : 'Salvar modelo'}
      </Button>
    </form>
  )
}
