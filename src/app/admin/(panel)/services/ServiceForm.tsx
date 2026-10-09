'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/admin/ui/badge'
import { Button } from '@/components/admin/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/admin/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/admin/ui/field'
import { Input } from '@/components/admin/ui/input'
import type { ServiceInput } from '@/lib/schemas/parties'

type Props = {
  title: string
  description?: string
  serviceKey?: string | null
  defaultValues?: Partial<ServiceInput>
  onSubmit: (data: ServiceInput) => void
  isLoading?: boolean
}

export function ServiceForm({ title, description, serviceKey, defaultValues, onSubmit, isLoading }: Props) {
  const [name, setName] = useState(defaultValues?.name ?? '')
  const [weekdayPrice, setWeekdayPrice] = useState(String(defaultValues?.weekdayPrice ?? ''))
  const [weekendPrice, setWeekendPrice] = useState(String(defaultValues?.weekendPrice ?? ''))
  const [errors, setErrors] = useState<{ name?: string; weekdayPrice?: string; weekendPrice?: string }>({})

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newErrors: typeof errors = {}
    if (!name.trim()) newErrors.name = 'Nome é obrigatório'
    const weekday = Number(weekdayPrice)
    const weekend = Number(weekendPrice)
    if (weekdayPrice === '' || Number.isNaN(weekday) || weekday < 0) {
      newErrors.weekdayPrice = 'Valor inválido'
    }
    if (weekendPrice === '' || Number.isNaN(weekend) || weekend < 0) {
      newErrors.weekendPrice = 'Valor inválido'
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})
    onSubmit({ name: name.trim(), weekdayPrice: weekday, weekendPrice: weekend })
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
            {serviceKey && (
              <Field>
                <FieldLabel>Chave do sistema</FieldLabel>
                <div>
                  <Badge variant="secondary" className="font-mono">{serviceKey}</Badge>
                </div>
              </Field>
            )}

            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">Nome do serviço</FieldLabel>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Salão de Festas (3 horas)"
                aria-invalid={!!errors.name}
              />
              {errors.name && <FieldError>{errors.name}</FieldError>}
            </Field>

            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
              <Field data-invalid={!!errors.weekdayPrice}>
                <FieldLabel htmlFor="weekdayPrice">Preço dia de semana (R$)</FieldLabel>
                <Input
                  id="weekdayPrice"
                  type="number"
                  min={0}
                  step="0.01"
                  value={weekdayPrice}
                  onChange={(e) => setWeekdayPrice(e.target.value)}
                  aria-invalid={!!errors.weekdayPrice}
                />
                {errors.weekdayPrice && <FieldError>{errors.weekdayPrice}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.weekendPrice}>
                <FieldLabel htmlFor="weekendPrice">Preço fim de semana (R$)</FieldLabel>
                <Input
                  id="weekendPrice"
                  type="number"
                  min={0}
                  step="0.01"
                  value={weekendPrice}
                  onChange={(e) => setWeekendPrice(e.target.value)}
                  aria-invalid={!!errors.weekendPrice}
                />
                {errors.weekendPrice && <FieldError>{errors.weekendPrice}</FieldError>}
              </Field>
            </div>
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button variant="outline" nativeButton={false} render={<Link href="/admin/services" />}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar serviço'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
