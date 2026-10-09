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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/admin/ui/select'
import { Skeleton } from '@/components/admin/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/admin/ui/tabs'
import { TipTapEditor } from '@/components/admin/tiptap-editor'
import type { ContractTemplateInput } from '@/lib/schemas/parties'
import { getDefaultVariableLabel, isDefaultVariable } from '@/lib/contract-defaults'
import { CONTRACT_VARIABLE_TYPE_LABELS, extractBodyVariables } from '@/lib/contract-render'
import type { ContractVariableType } from '@/types/parties'

type VariableItem = { key: string; variable: string; label: string }
type ContractVariables = { cliente: VariableItem[]; festa: VariableItem[]; contrato: VariableItem[] }

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
  const [variableTypes, setVariableTypes] = useState<Record<string, ContractVariableType>>(
    defaultValues?.variableTypes ?? {}
  )
  const [variableLabels, setVariableLabels] = useState<Record<string, string>>(
    defaultValues?.variableLabels ?? {}
  )
  const [errors, setErrors] = useState<{ name?: string; body?: string }>({})

  const { data: contractVars, isLoading: varsLoading } = useQuery<ContractVariables>({
    queryKey: ['admin', 'contract-variables'],
    queryFn: () => fetch('/api/admin/contract-variables').then(r => r.json()),
    staleTime: Infinity,
  })

  const allDetected = extractBodyVariables(body)
  const customVariables = allDetected.filter(v => !isDefaultVariable(v))

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
    const usedTypes = Object.fromEntries(
      customVariables.map(v => [v, variableTypes[v] ?? 'text'] as const)
    )
    const usedLabels = Object.fromEntries(
      allDetected
        .map(v => [v, (variableLabels[v] ?? '').trim()] as const)
        .filter(([, label]) => label !== '')
    )
    onSubmit({ name: name.trim(), body, isDefault, variableTypes: usedTypes, variableLabels: usedLabels })
  }

  function copyVariable(variable: string) {
    navigator.clipboard.writeText(variable)
    toast.success(`${variable} copiado!`)
  }

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
                    <TabsTrigger value="contrato">Contrato</TabsTrigger>
                  </TabsList>
                  <TabsContent value="cliente">{renderVariables(contractVars.cliente)}</TabsContent>
                  <TabsContent value="festa">{renderVariables(contractVars.festa)}</TabsContent>
                  <TabsContent value="contrato">{renderVariables(contractVars.contrato ?? [])}</TabsContent>
                </Tabs>
              ) : null}
            </Field>

            <Field data-invalid={!!errors.body}>
              <FieldLabel>Conteúdo *</FieldLabel>
              <TipTapEditor
                content={body}
                onChange={setBody}
                onInsertVariable={(varName, type) =>
                  setVariableTypes(prev => ({ ...prev, [varName]: type }))
                }
              />
              {errors.body && <FieldError>{errors.body}</FieldError>}
            </Field>

            {allDetected.length > 0 && (
              <Alert>
                <AlertTitle>
                  Rótulos dos campos ({allDetected.length}) — exibidos no formulário de preenchimento.
                  {customVariables.length > 0 && ` ${customVariables.length} extra(s) serão preenchidas manualmente.`}
                </AlertTitle>
                <AlertDescription>
                  <div className="mt-2 flex flex-col gap-3">
                    {allDetected.map(v => {
                      const isCustom = !isDefaultVariable(v)
                      return (
                        <div key={v} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                          <button
                            type="button"
                            title="Clique para copiar"
                            className="w-fit shrink-0 cursor-pointer sm:w-56 sm:text-left"
                            onClick={() => copyVariable(`{{${v}}}`)}
                          >
                            <Badge variant="secondary" className="hover:bg-secondary/70 font-mono">
                              {`{{${v}}}`}
                            </Badge>
                          </button>
                          <Input
                            value={variableLabels[v] ?? ''}
                            onChange={e => setVariableLabels(prev => ({ ...prev, [v]: e.target.value }))}
                            placeholder={getDefaultVariableLabel(v)}
                            maxLength={80}
                            aria-label={`Rótulo de ${v}`}
                          />
                          {isCustom && (
                            <Select
                              value={variableTypes[v] ?? 'text'}
                              onValueChange={t =>
                                t && setVariableTypes(prev => ({ ...prev, [v]: t as ContractVariableType }))
                              }
                            >
                              <SelectTrigger size="sm" className="w-32 shrink-0" aria-label={`Tipo de ${v}`}>
                                <SelectValue>{CONTRACT_VARIABLE_TYPE_LABELS[variableTypes[v] ?? 'text']}</SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {(Object.keys(CONTRACT_VARIABLE_TYPE_LABELS) as ContractVariableType[]).map(t => (
                                  <SelectItem key={t} value={t}>
                                    {CONTRACT_VARIABLE_TYPE_LABELS[t]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      )
                    })}
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
