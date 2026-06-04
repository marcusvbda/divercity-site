import { z } from 'zod'

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Email obrigatório')
    .email('Email inválido'),
  password: z
    .string()
    .min(6, 'Mínimo 6 caracteres'),
})

export type LoginFormData = z.infer<typeof loginSchema>
