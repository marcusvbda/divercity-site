'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ServiceInput } from '@/lib/schemas/parties'

type Props = {
  defaultValues?: Partial<ServiceInput>
  onSubmit: (data: ServiceInput) => void
  isLoading?: boolean
}

export function ServiceForm({ defaultValues, onSubmit, isLoading }: Props) {
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
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nome do serviço</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Salão de Festas (3 horas)"
        />
        {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="weekdayPrice">Preço dia de semana (R$)</Label>
          <Input
            id="weekdayPrice"
            type="number"
            min={0}
            step="0.01"
            value={weekdayPrice}
            onChange={(e) => setWeekdayPrice(e.target.value)}
          />
          {errors.weekdayPrice && <p className="text-destructive text-xs">{errors.weekdayPrice}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="weekendPrice">Preço fim de semana (R$)</Label>
          <Input
            id="weekendPrice"
            type="number"
            min={0}
            step="0.01"
            value={weekendPrice}
            onChange={(e) => setWeekendPrice(e.target.value)}
          />
          {errors.weekendPrice && <p className="text-destructive text-xs">{errors.weekendPrice}</p>}
        </div>
      </div>

      <Button type="submit" className="w-fit" disabled={isLoading}>
        {isLoading ? 'Salvando...' : 'Salvar serviço'}
      </Button>
    </form>
  )
}
