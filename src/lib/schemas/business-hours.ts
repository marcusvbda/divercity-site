import { z } from 'zod'

export const BusinessHourSchema = z
  .object({
    label: z.string().trim().min(1, 'Rótulo é obrigatório'),
    opening: z.number().int().min(0).max(23),
    close: z.number().int().min(1).max(24),
  })
  .refine((data) => data.close > data.opening, {
    message: 'Fechamento deve ser depois da abertura',
    path: ['close'],
  })

export type BusinessHourInput = z.infer<typeof BusinessHourSchema>
