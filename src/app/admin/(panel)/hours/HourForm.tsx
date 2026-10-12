'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/admin/ui/badge'
import { Button } from '@/components/admin/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/admin/ui/card'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/admin/ui/field'
import { Input } from '@/components/admin/ui/input'

export type HourFormValues = {
  label: string
  opening: number
  close: number
}

type Props = {
  title: string
  description?: string
  hourKey?: string | null
  defaultValues?: Partial<HourFormValues>
  onSubmit: (data: HourFormValues) => void
  isLoading?: boolean
}

export function HourForm({
  title,
  description,
  hourKey,
  defaultValues,
  onSubmit,
  isLoading,
}: Props) {
  const [label, setLabel] = useState(defaultValues?.label ?? '')
  const [opening, setOpening] = useState(String(defaultValues?.opening ?? ''))
  const [close, setClose] = useState(String(defaultValues?.close ?? ''))
  const [errors, setErrors] = useState<{
    label?: string
    opening?: string
    close?: string
  }>({})

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newErrors: typeof errors = {}
    const openingNum = Number(opening)
    const closeNum = Number(close)
    if (!label.trim()) newErrors.label = 'Rótulo é obrigatório'
    if (
      opening === '' ||
      !Number.isInteger(openingNum) ||
      openingNum < 0 ||
      openingNum > 23
    ) {
      newErrors.opening = 'Informe um horário entre 0 e 23'
    }
    if (
      close === '' ||
      !Number.isInteger(closeNum) ||
      closeNum < 1 ||
      closeNum > 24
    ) {
      newErrors.close = 'Informe um horário entre 1 e 24'
    } else if (!newErrors.opening && closeNum <= openingNum) {
      newErrors.close = 'Fechamento deve ser depois da abertura'
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})
    onSubmit({ label: label.trim(), opening: openingNum, close: closeNum })
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
            {hourKey && (
              <Field>
                <FieldLabel>Chave do sistema</FieldLabel>
                <div>
                  <Badge variant="secondary" className="font-mono">
                    {hourKey}
                  </Badge>
                </div>
              </Field>
            )}

            <Field data-invalid={!!errors.label}>
              <FieldLabel htmlFor="label">Rótulo</FieldLabel>
              <Input
                id="label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                aria-invalid={!!errors.label}
              />
              {errors.label && <FieldError>{errors.label}</FieldError>}
            </Field>

            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
              <Field data-invalid={!!errors.opening}>
                <FieldLabel htmlFor="opening">
                  Abertura (hora, 0 a 23)
                </FieldLabel>
                <Input
                  id="opening"
                  type="number"
                  min={0}
                  max={23}
                  step={1}
                  value={opening}
                  onChange={(e) => setOpening(e.target.value)}
                  aria-invalid={!!errors.opening}
                />
                {errors.opening && <FieldError>{errors.opening}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.close}>
                <FieldLabel htmlFor="close">
                  Fechamento (hora, 1 a 24)
                </FieldLabel>
                <Input
                  id="close"
                  type="number"
                  min={1}
                  max={24}
                  step={1}
                  value={close}
                  onChange={(e) => setClose(e.target.value)}
                  aria-invalid={!!errors.close}
                />
                {errors.close && <FieldError>{errors.close}</FieldError>}
              </Field>
            </div>
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/admin/hours" />}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar horário'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
