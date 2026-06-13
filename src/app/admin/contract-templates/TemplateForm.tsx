'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TipTapEditor } from '@/components/ui/tiptap-editor'
import type { ContractTemplateInput } from '@/lib/schemas/parties'

type Props = {
  defaultValues?: Partial<ContractTemplateInput>
  onSubmit: (data: ContractTemplateInput) => void
  isLoading?: boolean
}

export function TemplateForm({ defaultValues, onSubmit, isLoading }: Props) {
  const [name, setName] = useState(defaultValues?.name ?? '')
  const [body, setBody] = useState(defaultValues?.body ?? '')
  const [errors, setErrors] = useState<{ name?: string; body?: string }>({})

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

  const variables = [...new Set((body.match(/\{\{(\w+)\}\}/g) ?? []).map(m => m.replace(/[{}]/g, '')))]

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

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Conteúdo *</label>
        <TipTapEditor content={body} onChange={setBody} />
        {errors.body && <p className="text-destructive text-xs">{errors.body}</p>}
      </div>

      {variables.length > 0 && (
        <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-950/20">
          <p className="mb-1 text-xs font-medium text-amber-700 dark:text-amber-400">
            Variáveis detectadas ({variables.length}):
          </p>
          <div className="flex flex-wrap gap-1">
            {variables.map(v => (
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
