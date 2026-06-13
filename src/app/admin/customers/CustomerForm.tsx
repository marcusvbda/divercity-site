'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  defaultValues?: Partial<CustomerInput>
  onSubmit: (data: CustomerInput) => void
  isLoading?: boolean
}

export function CustomerForm({ defaultValues, onSubmit, isLoading }: Props) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<CustomerInput>({
    resolver: zodResolver(CustomerSchema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nome *</Label>
        <Input id="name" {...register('name')} placeholder="Nome completo" />
        {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cpf">CPF *</Label>
        <Controller
          name="cpf"
          control={control}
          render={({ field }) => (
            <Input
              id="cpf"
              placeholder="000.000.000-00"
              maxLength={14}
              value={formatCPF(field.value ?? '')}
              onChange={e => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 11))}
              onBlur={field.onBlur}
            />
          )}
        />
        {errors.cpf && <p className="text-destructive text-xs">{errors.cpf.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register('email')} placeholder="email@exemplo.com" />
        {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Telefone</Label>
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <Input
              id="phone"
              placeholder="(11) 99999-9999"
              maxLength={15}
              value={formatPhone(field.value ?? '')}
              onChange={e => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 11))}
              onBlur={field.onBlur}
            />
          )}
        />
        {errors.phone && <p className="text-destructive text-xs">{errors.phone.message}</p>}
      </div>

      <Button type="submit" disabled={isLoading} className="w-fit">
        {isLoading ? 'Salvando...' : 'Salvar'}
      </Button>
    </form>
  )
}
