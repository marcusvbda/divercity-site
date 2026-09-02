'use client'

import { Controller, type Control, type FieldErrors } from 'react-hook-form'
import { Trash2 } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { TicketOrderCreateInput } from '@/lib/schemas/tickets'
import PassportTypeSelector from './PassportTypeCard'
import type { PassportTypeDto, VisitDayType } from './types'

export default function ExtraCompanionCard({
  index,
  displayNumber,
  control,
  errors,
  passportTypes,
  visitDayType,
  onRemove,
}: {
  index: number
  displayNumber: number
  control: Control<TicketOrderCreateInput>
  errors: FieldErrors<TicketOrderCreateInput>
  passportTypes: PassportTypeDto[]
  visitDayType: VisitDayType
  onRemove: () => void
}) {
  const companionErrors = errors.companions?.[index]

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-sm font-bold text-gray-800">Acompanhante {displayNumber}</h3>
        <button
          type="button"
          onClick={onRemove}
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
          aria-label={`Remover acompanhante ${displayNumber}`}
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`companion-${index}-name`} className="font-body mb-1.5">
            Nome *
          </Label>
          <Controller
            name={`companions.${index}.name`}
            control={control}
            render={({ field }) => (
              <Input id={`companion-${index}-name`} className="rounded-xl py-5" placeholder="Nome completo" {...field} />
            )}
          />
          {companionErrors?.name && (
            <p className="font-body mt-1 text-xs text-red-500">{companionErrors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor={`companion-${index}-phone`} className="font-body mb-1.5">
            Telefone (opcional)
          </Label>
          <Controller
            name={`companions.${index}.phone`}
            control={control}
            render={({ field }) => (
              <Input
                id={`companion-${index}-phone`}
                type="tel"
                className="rounded-xl py-5"
                placeholder="(11) 99999-9999"
                {...field}
              />
            )}
          />
        </div>
      </div>

      <div>
        <Label className="font-body mb-1.5">Duração do ingresso *</Label>
        <Controller
          name={`companions.${index}.passportTypeId`}
          control={control}
          render={({ field }) => (
            <PassportTypeSelector
              passportTypes={passportTypes}
              visitDayType={visitDayType}
              value={field.value}
              onChange={field.onChange}
              priceKind="companion"
              name={`Duração do acompanhante ${displayNumber}`}
            />
          )}
        />
        {companionErrors?.passportTypeId && (
          <p className="font-body mt-1 text-xs text-red-500">{companionErrors.passportTypeId.message}</p>
        )}
        <p className="font-body mt-2 text-xs text-gray-400">
          Este ingresso dá direito apenas à entrada no parque — não inclui acesso aos brinquedos.
        </p>
      </div>
    </div>
  )
}
