'use client'

import { Controller, type Control, type FieldErrors } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { TicketOrderCreateInput } from '@/lib/schemas/tickets'
import { formatPhoneInput } from './utils'

export default function GuardianFields({
  control,
  errors,
}: {
  control: Control<TicketOrderCreateInput>
  errors: FieldErrors<TicketOrderCreateInput>
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
      <h3 className="font-heading text-sm font-bold text-gray-800">Dados do responsável pela compra</h3>

      <div>
        <Label htmlFor="guardianName" className="font-body mb-1.5">
          Nome completo *
        </Label>
        <Controller
          name="guardianName"
          control={control}
          render={({ field }) => (
            <Input id="guardianName" className="rounded-xl py-5" placeholder="Seu nome completo" {...field} />
          )}
        />
        {errors.guardianName && (
          <p className="font-body mt-1 text-xs text-red-500">{errors.guardianName.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="guardianEmail" className="font-body mb-1.5">
          E-mail *
        </Label>
        <Controller
          name="guardianEmail"
          control={control}
          render={({ field }) => (
            <Input
              id="guardianEmail"
              type="email"
              className="rounded-xl py-5"
              placeholder="email@exemplo.com"
              {...field}
            />
          )}
        />
        {errors.guardianEmail && (
          <p className="font-body mt-1 text-xs text-red-500">{errors.guardianEmail.message}</p>
        )}
        <p className="font-body mt-1 text-xs text-gray-400">
          Enviaremos o comprovante e o QR Code de entrada para este e-mail.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="guardianPhone" className="font-body mb-1.5">
            Telefone *
          </Label>
          <Controller
            name="guardianPhone"
            control={control}
            render={({ field }) => (
              <Input
                id="guardianPhone"
                type="tel"
                className="rounded-xl py-5"
                placeholder="(11) 99999-9999"
                maxLength={15}
                value={formatPhoneInput(field.value ?? '')}
                onChange={(e) => field.onChange(formatPhoneInput(e.target.value))}
                onBlur={field.onBlur}
              />
            )}
          />
          {errors.guardianPhone && (
            <p className="font-body mt-1 text-xs text-red-500">{errors.guardianPhone.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="guardianWhatsapp" className="font-body mb-1.5">
            WhatsApp *
          </Label>
          <Controller
            name="guardianWhatsapp"
            control={control}
            render={({ field }) => (
              <Input
                id="guardianWhatsapp"
                type="tel"
                className="rounded-xl py-5"
                placeholder="(11) 99999-9999"
                maxLength={15}
                value={formatPhoneInput(field.value ?? '')}
                onChange={(e) => field.onChange(formatPhoneInput(e.target.value))}
                onBlur={field.onBlur}
              />
            )}
          />
          {errors.guardianWhatsapp && (
            <p className="font-body mt-1 text-xs text-red-500">{errors.guardianWhatsapp.message}</p>
          )}
        </div>
      </div>
    </div>
  )
}
