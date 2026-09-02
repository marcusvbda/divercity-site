'use client'

import { Controller, type Control, type FieldErrors } from 'react-hook-form'
import { Trash2, UserRound, UserRoundX, ShieldAlert, Info } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { TicketOrderCreateInput } from '@/lib/schemas/tickets'
import PassportTypeSelector from './PassportTypeCard'
import type { PassportTypeDto, VisitDayType } from './types'
import { ageInMonthsLocal, formatAge, isCompanionEligibleLocal, todayInputMax } from './utils'

export default function ChildEntryCard({
  index,
  control,
  errors,
  passportTypes,
  visitDayType,
  companion,
  onCompanionChange,
  onHasCompanionChange,
  onRemove,
  canRemove,
}: {
  index: number
  control: Control<TicketOrderCreateInput>
  errors: FieldErrors<TicketOrderCreateInput>
  passportTypes: PassportTypeDto[]
  visitDayType: VisitDayType
  companion: { name?: string; phone?: string } | null
  onCompanionChange: (data: { name: string; phone?: string }) => void
  onHasCompanionChange: (value: boolean | undefined) => void
  onRemove: () => void
  canRemove: boolean
}) {
  const childErrors = errors.children?.[index]

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-sm font-bold text-gray-800">Criança {index + 1}</h3>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
            aria-label={`Remover criança ${index + 1}`}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`child-${index}-name`} className="font-body mb-1.5">
            Nome da criança *
          </Label>
          <Controller
            name={`children.${index}.name`}
            control={control}
            render={({ field }) => (
              <Input
                id={`child-${index}-name`}
                className="rounded-xl py-5"
                placeholder="Nome completo"
                autoComplete="off"
                {...field}
              />
            )}
          />
          {childErrors?.name && (
            <p className="font-body mt-1 text-xs text-red-500">{childErrors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor={`child-${index}-birthDate`} className="font-body mb-1.5">
            Data de nascimento *
          </Label>
          <Controller
            name={`children.${index}.birthDate`}
            control={control}
            render={({ field }) => (
              <Input
                id={`child-${index}-birthDate`}
                type="date"
                max={todayInputMax()}
                className="rounded-xl py-5"
                {...field}
              />
            )}
          />
          {childErrors?.birthDate && (
            <p className="font-body mt-1 text-xs text-red-500">{childErrors.birthDate.message}</p>
          )}
        </div>
      </div>

      <Controller
        name={`children.${index}.birthDate`}
        control={control}
        render={({ field }) => {
          const ageMonths = field.value ? ageInMonthsLocal(field.value) : null
          return ageMonths !== null ? (
            <p className="font-body -mt-2 text-xs text-gray-400">Idade: {formatAge(ageMonths)}</p>
          ) : (
            <></>
          )
        }}
      />

      <div>
        <Label className="font-body mb-1.5">Tipo de passaporte *</Label>
        <Controller
          name={`children.${index}.passportTypeId`}
          control={control}
          render={({ field }) => (
            <PassportTypeSelector
              passportTypes={passportTypes}
              visitDayType={visitDayType}
              value={field.value}
              onChange={field.onChange}
              priceKind="child"
              name={`Tipo de passaporte da criança ${index + 1}`}
            />
          )}
        />
        {childErrors?.passportTypeId && (
          <p className="font-body mt-1 text-xs text-red-500">{childErrors.passportTypeId.message}</p>
        )}
      </div>

      <Controller
        name={`children.${index}.isPNE`}
        control={control}
        render={({ field }) => (
          <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4 py-3">
            <Checkbox checked={field.value} onCheckedChange={(c) => field.onChange(c === true)} />
            <span className="font-body flex-1 text-sm text-gray-700">
              Esta criança é PNE (pessoa com necessidades especiais)
            </span>
            <span className="font-body text-xs font-semibold text-brand-purple">-50%</span>
          </label>
        )}
      />

      <Controller
        name={`children.${index}.birthDate`}
        control={control}
        render={({ field: birthField }) => {
          if (!birthField.value || !isCompanionEligibleLocal(birthField.value)) return <></>

          return (
            <div className="flex flex-col gap-3 rounded-xl bg-brand-cyan/5 p-4">
              <div className="flex items-start gap-2">
                <Info size={16} className="mt-0.5 shrink-0 text-brand-cyan" />
                <p className="font-body text-xs text-gray-600">
                  Crianças de até 4 anos têm direito a{' '}
                  <strong>1 acompanhante gratuito maior de 18 anos</strong>. Essa criança ficará com ou
                  sem acompanhante dentro do parque?
                </p>
              </div>

              <Controller
                name={`children.${index}.hasCompanion`}
                control={control}
                render={({ field: hasCompanionField }) => (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => onHasCompanionChange(true)}
                      className={cn(
                        'font-body flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors',
                        hasCompanionField.value === true
                          ? 'border-brand-cyan bg-brand-cyan text-white'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      )}
                    >
                      <UserRound size={16} />
                      Com acompanhante
                    </button>
                    <button
                      type="button"
                      onClick={() => onHasCompanionChange(false)}
                      className={cn(
                        'font-body flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors',
                        hasCompanionField.value === false
                          ? 'border-brand-purple bg-brand-purple text-white'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      )}
                    >
                      <UserRoundX size={16} />
                      Sem acompanhante
                    </button>
                  </div>
                )}
              />

              <Controller
                name={`children.${index}.hasCompanion`}
                control={control}
                render={({ field: hasCompanionField }) => {
                  if (hasCompanionField.value === true) {
                    return (
                      <div className="flex flex-col gap-3 rounded-xl border border-brand-cyan/30 bg-white p-3">
                        <p className="font-body text-xs text-gray-500">
                          O acompanhante deverá ter <strong>mais de 18 anos</strong> e apresentar
                          documento na entrada. Este ingresso é <strong>gratuito</strong>.
                        </p>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div>
                            <Label htmlFor={`child-${index}-companion-name`} className="font-body mb-1.5">
                              Nome do acompanhante *
                            </Label>
                            <Input
                              id={`child-${index}-companion-name`}
                              className="rounded-xl py-5"
                              placeholder="Nome completo"
                              value={companion?.name ?? ''}
                              onChange={(e) =>
                                onCompanionChange({ name: e.target.value, phone: companion?.phone })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor={`child-${index}-companion-phone`} className="font-body mb-1.5">
                              Telefone (opcional)
                            </Label>
                            <Input
                              id={`child-${index}-companion-phone`}
                              type="tel"
                              className="rounded-xl py-5"
                              placeholder="(11) 99999-9999"
                              value={companion?.phone ?? ''}
                              onChange={(e) =>
                                onCompanionChange({ name: companion?.name ?? '', phone: e.target.value })
                              }
                            />
                          </div>
                        </div>
                      </div>
                    )
                  }

                  if (hasCompanionField.value === false) {
                    return (
                      <div className="flex flex-col gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3">
                        <div className="flex items-start gap-2">
                          <ShieldAlert size={16} className="mt-0.5 shrink-0 text-amber-600" />
                          <p className="font-body text-xs text-amber-800">
                            A criança entrará <strong>sozinha, sem acompanhante</strong>. Usaremos o
                            telefone e o WhatsApp do responsável (informados mais adiante) para contato,
                            caso necessário.
                          </p>
                        </div>
                        <Controller
                          name={`children.${index}.unaccompaniedTermsAccepted`}
                          control={control}
                          render={({ field: termsField }) => (
                            <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-amber-300 bg-white px-3 py-2.5">
                              <Checkbox
                                checked={termsField.value === true}
                                onCheckedChange={(c) => termsField.onChange(c === true)}
                              />
                              <span className="font-body text-xs text-gray-700">
                                Li e aceito o <strong>Termo de Responsabilidade</strong>: estou ciente e
                                autorizo que esta criança entre e permaneça no parque sem a companhia de
                                um responsável ou acompanhante maior de idade, e autorizo o contato pelo
                                meu telefone/WhatsApp caso necessário.
                              </span>
                            </label>
                          )}
                        />
                      </div>
                    )
                  }

                  return <></>
                }}
              />
            </div>
          )
        }}
      />
    </div>
  )
}
