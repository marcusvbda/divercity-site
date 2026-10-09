'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/admin/ui/alert'
import { Badge } from '@/components/admin/ui/badge'
import { Button } from '@/components/admin/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/admin/ui/card'
import { Checkbox } from '@/components/admin/ui/checkbox'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/admin/ui/field'
import { Input } from '@/components/admin/ui/input'
import { Skeleton } from '@/components/admin/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/admin/ui/tabs'
import { TipTapEditor } from '@/components/admin/tiptap-editor'
import type { ContractTemplateInput } from '@/lib/schemas/parties'
import { isDefaultVariable } from '@/lib/contract-defaults'

type VariableItem = { key: string; variable: string; label: string }
type ContractVariables = { cliente: VariableItem[]; festa: VariableItem[] }

type Props = {
  title: string
  description?: string
  defaultValues?: Partial<ContractTemplateInput>
  onSubmit: (data: ContractTemplateInput) => void
  isLoading?: boolean
}

export function TemplateForm({ title, description, defaultValues, onSubmit, isLoading }: Props) {
  const [name, setName] = useState(defaultValues?.name ?? '')
  const [body, setBody] = useState(defaultValues?.body ?? '')
  const [isDefault, setIsDefault] = useState(defaultValues?.isDefault ?? false)
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
    onSubmit({ name: name.trim(), body, isDefault })
  }

  function copyVariable(variable: string) {
    navigator.clipboard.writeText(variable)
    toast.success(`${variable} copiado!`)
  }

  const allDetected = [...new Set((body.match(/\{\{(\w+)\}\}/g) ?? []).map(m => m.replace(/[{}]/g, '')))]
  const customVariables = allDetected.filter(v => !isDefaultVariable(v))

  function renderVariables(items: VariableItem[]) {
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map(item => (
          <Button
            key={item.key}
            type="button"
            variant="outline"
            className="h-auto flex-col items-start gap-0 px-3 py-2 text-left"
            onClick={() => copyVariable(item.variable)}
          >
            <span className="font-mono text-xs font-medium">{item.variable}</span>
            <span className="text-muted-foreground text-xs font-normal">{item.label}</span>
          </Button>
        ))}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">Nome do modelo *</FieldLabel>
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Contrato Padrão de Festa"
                aria-invalid={!!errors.name}
              />
              {errors.name && <FieldError>{errors.name}</FieldError>}
            </Field>

            <Field orientation="horizontal">
              <Checkbox id="isDefault" checked={isDefault} onCheckedChange={(checked) => setIsDefault(checked === true)} />
              <FieldLabel htmlFor="isDefault" className="font-normal">
                Definir como modelo padrão (usado no orçamento/reserva pelo site)
              </FieldLabel>
            </Field>

            <Field>
              <FieldLabel>Variáveis padrão disponíveis</FieldLabel>
              <FieldDescription>
                Preenchidas automaticamente a partir dos dados cadastrados. Clique para copiar.
              </FieldDescription>
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
                  <TabsContent value="cliente">{renderVariables(contractVars.cliente)}</TabsContent>
                  <TabsContent value="festa">{renderVariables(contractVars.festa)}</TabsContent>
                </Tabs>
              ) : null}
            </Field>

            <Field data-invalid={!!errors.body}>
              <FieldLabel>Conteúdo *</FieldLabel>
              <TipTapEditor content={body} onChange={setBody} />
              {errors.body && <FieldError>{errors.body}</FieldError>}
            </Field>

            {customVariables.length > 0 && (
              <Alert>
                <AlertTitle>
                  Variáveis extras detectadas ({customVariables.length}) — serão preenchidas manualmente:
                </AlertTitle>
                <AlertDescription>
                  <div className="flex flex-wrap gap-1">
                    {customVariables.map(v => (
                      <Badge key={v} variant="secondary" className="font-mono">
                        {`{{${v}}}`}
                      </Badge>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button variant="outline" nativeButton={false} render={<Link href="/admin/contract-templates" />}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar modelo'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
