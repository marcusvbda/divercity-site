'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/admin/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/admin/ui/card'
import { Checkbox } from '@/components/admin/ui/checkbox'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/admin/ui/field'
import { Input } from '@/components/admin/ui/input'
import type { PassportTypeInput } from '@/lib/schemas/tickets'

type Props = {
  title: string
  description?: string
  defaultValues?: Partial<PassportTypeInput>
  onSubmit: (data: PassportTypeInput) => void
  isLoading?: boolean
  isFixed?: boolean
}

type PriceFieldName =
  | 'weekdayChildPrice'
  | 'weekendChildPrice'
  | 'weekdayCompanionPrice'
  | 'weekendCompanionPrice'

const priceFields: { name: PriceFieldName; label: string }[] = [
  { name: 'weekdayChildPrice', label: 'Criança — segunda a quinta (R$)' },
  { name: 'weekendChildPrice', label: 'Criança — sexta a domingo e feriados (R$)' },
  { name: 'weekdayCompanionPrice', label: 'Acompanhante — segunda a quinta (R$)' },
  { name: 'weekendCompanionPrice', label: 'Acompanhante — sexta a domingo e feriados (R$)' },
]

export function PassportTypeForm({ title, description, defaultValues, onSubmit, isLoading, isFixed }: Props) {
  const [name, setName] = useState(defaultValues?.name ?? '')
  const [durationMinutes, setDurationMinutes] = useState(String(defaultValues?.durationMinutes ?? ''))
  const [prices, setPrices] = useState<Record<PriceFieldName, string>>({
    weekdayChildPrice: String(defaultValues?.weekdayChildPrice ?? ''),
    weekendChildPrice: String(defaultValues?.weekendChildPrice ?? ''),
    weekdayCompanionPrice: String(defaultValues?.weekdayCompanionPrice ?? ''),
    weekendCompanionPrice: String(defaultValues?.weekendCompanionPrice ?? ''),
  })
  const [active, setActive] = useState(defaultValues?.active ?? true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const values = {
      durationMinutes: Number(durationMinutes),
      weekdayChildPrice: Number(prices.weekdayChildPrice),
      weekendChildPrice: Number(prices.weekendChildPrice),
      weekdayCompanionPrice: Number(prices.weekdayCompanionPrice),
      weekendCompanionPrice: Number(prices.weekendCompanionPrice),
    }
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = 'Nome é obrigatório'
    for (const [key, value] of Object.entries(values)) {
      if (Number.isNaN(value) || value < 0) newErrors[key] = 'Valor inválido'
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})
    onSubmit({ name: name.trim(), active, ...values })
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
            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="name">Nome</FieldLabel>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: 2 Horas"
                  aria-invalid={!!errors.name}
                />
                {errors.name && <FieldError>{errors.name}</FieldError>}
              </Field>
              <Field data-invalid={!!errors.durationMinutes}>
                <FieldLabel htmlFor="durationMinutes">Duração (minutos)</FieldLabel>
                <Input
                  id="durationMinutes"
                  type="number"
                  min={0}
                  step="1"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  disabled={isFixed}
                  aria-invalid={!!errors.durationMinutes}
                />
                {errors.durationMinutes && <FieldError>{errors.durationMinutes}</FieldError>}
                {isFixed && (
                  <FieldDescription>
                    Passaporte fixo do sistema: não pode ser desativado nem ter a duração alterada.
                  </FieldDescription>
                )}
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
              {priceFields.map(({ name: fieldName, label }) => (
                <Field key={fieldName} data-invalid={!!errors[fieldName]}>
                  <FieldLabel htmlFor={fieldName}>{label}</FieldLabel>
                  <Input
                    id={fieldName}
                    type="number"
                    min={0}
                    step="0.01"
                    value={prices[fieldName]}
                    onChange={(e) => setPrices((prev) => ({ ...prev, [fieldName]: e.target.value }))}
                    aria-invalid={!!errors[fieldName]}
                  />
                  {errors[fieldName] && <FieldError>{errors[fieldName]}</FieldError>}
                </Field>
              ))}
            </div>

            <Field orientation="horizontal">
              <Checkbox
                id="active"
                checked={active}
                onCheckedChange={(v) => setActive(v === true)}
                disabled={isFixed}
              />
              <FieldLabel htmlFor="active" className="font-normal">
                Ativo (disponível para compra no site)
              </FieldLabel>
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button variant="outline" nativeButton={false} render={<Link href="/admin/services?tab=passaportes" />}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar tipo de passaporte'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
