'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import type { PassportTypeInput } from '@/lib/schemas/tickets'

type Props = {
  defaultValues?: Partial<PassportTypeInput>
  onSubmit: (data: PassportTypeInput) => void
  isLoading?: boolean
}

export function PassportTypeForm({ defaultValues, onSubmit, isLoading }: Props) {
  const [name, setName] = useState(defaultValues?.name ?? '')
  const [durationMinutes, setDurationMinutes] = useState(String(defaultValues?.durationMinutes ?? ''))
  const [weekdayChildPrice, setWeekdayChildPrice] = useState(String(defaultValues?.weekdayChildPrice ?? ''))
  const [weekendChildPrice, setWeekendChildPrice] = useState(String(defaultValues?.weekendChildPrice ?? ''))
  const [weekdayCompanionPrice, setWeekdayCompanionPrice] = useState(
    String(defaultValues?.weekdayCompanionPrice ?? '')
  )
  const [weekendCompanionPrice, setWeekendCompanionPrice] = useState(
    String(defaultValues?.weekendCompanionPrice ?? '')
  )
  const [active, setActive] = useState(defaultValues?.active ?? true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const values = {
      durationMinutes: Number(durationMinutes),
      weekdayChildPrice: Number(weekdayChildPrice),
      weekendChildPrice: Number(weekendChildPrice),
      weekdayCompanionPrice: Number(weekdayCompanionPrice),
      weekendCompanionPrice: Number(weekendCompanionPrice),
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
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: 2 Horas"
          />
          {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="durationMinutes">Duração (minutos)</Label>
          <Input
            id="durationMinutes"
            type="number"
            min={0}
            step="1"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
          />
          {errors.durationMinutes && <p className="text-destructive text-xs">{errors.durationMinutes}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="weekdayChildPrice">Criança — dia de semana (R$)</Label>
          <Input
            id="weekdayChildPrice"
            type="number"
            min={0}
            step="0.01"
            value={weekdayChildPrice}
            onChange={(e) => setWeekdayChildPrice(e.target.value)}
          />
          {errors.weekdayChildPrice && <p className="text-destructive text-xs">{errors.weekdayChildPrice}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="weekendChildPrice">Criança — fim de semana/feriado (R$)</Label>
          <Input
            id="weekendChildPrice"
            type="number"
            min={0}
            step="0.01"
            value={weekendChildPrice}
            onChange={(e) => setWeekendChildPrice(e.target.value)}
          />
          {errors.weekendChildPrice && <p className="text-destructive text-xs">{errors.weekendChildPrice}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="weekdayCompanionPrice">Acompanhante — dia de semana (R$)</Label>
          <Input
            id="weekdayCompanionPrice"
            type="number"
            min={0}
            step="0.01"
            value={weekdayCompanionPrice}
            onChange={(e) => setWeekdayCompanionPrice(e.target.value)}
          />
          {errors.weekdayCompanionPrice && (
            <p className="text-destructive text-xs">{errors.weekdayCompanionPrice}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="weekendCompanionPrice">Acompanhante — fim de semana/feriado (R$)</Label>
          <Input
            id="weekendCompanionPrice"
            type="number"
            min={0}
            step="0.01"
            value={weekendCompanionPrice}
            onChange={(e) => setWeekendCompanionPrice(e.target.value)}
          />
          {errors.weekendCompanionPrice && (
            <p className="text-destructive text-xs">{errors.weekendCompanionPrice}</p>
          )}
        </div>
      </div>

      <label className="flex w-fit items-center gap-2">
        <Checkbox checked={active} onCheckedChange={(v) => setActive(v === true)} />
        <span className="text-sm">Ativo (disponível para compra no site)</span>
      </label>

      <Button type="submit" className="w-fit" disabled={isLoading}>
        {isLoading ? 'Salvando...' : 'Salvar tipo de passaporte'}
      </Button>
    </form>
  )
}
