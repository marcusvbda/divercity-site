'use client'

import Link from 'next/link'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/admin/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/admin/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/admin/ui/field'
import { Input } from '@/components/admin/ui/input'
import { CustomerSchema, type CustomerInput } from '@/lib/schemas/parties'

function formatPhone(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

function formatCPF(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

type Props = {
  title: string
  description?: string
  defaultValues?: Partial<CustomerInput>
  onSubmit: (data: CustomerInput) => void
  isLoading?: boolean
}

export function CustomerForm({ title, description, defaultValues, onSubmit, isLoading }: Props) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<CustomerInput>({
    resolver: zodResolver(CustomerSchema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">Nome *</FieldLabel>
              <Input id="name" {...register('name')} placeholder="Nome completo" aria-invalid={!!errors.name} />
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>

            <Field data-invalid={!!errors.cpf}>
              <FieldLabel htmlFor="cpf">CPF *</FieldLabel>
              <Controller
                name="cpf"
                control={control}
                render={({ field }) => (
                  <Input
                    id="cpf"
                    placeholder="000.000.000-00"
                    maxLength={14}
                    aria-invalid={!!errors.cpf}
                    value={formatCPF(field.value ?? '')}
                    onChange={e => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    onBlur={field.onBlur}
                  />
                )}
              />
              {errors.cpf && <FieldError>{errors.cpf.message}</FieldError>}
            </Field>

            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" type="email" {...register('email')} placeholder="email@exemplo.com" aria-invalid={!!errors.email} />
              {errors.email && <FieldError>{errors.email.message}</FieldError>}
            </Field>

            <Field data-invalid={!!errors.phone}>
              <FieldLabel htmlFor="phone">Telefone</FieldLabel>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <Input
                    id="phone"
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                    aria-invalid={!!errors.phone}
                    value={formatPhone(field.value ?? '')}
                    onChange={e => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    onBlur={field.onBlur}
                  />
                )}
              />
              {errors.phone && <FieldError>{errors.phone.message}</FieldError>}
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button variant="outline" nativeButton={false} render={<Link href="/admin/customers" />}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
