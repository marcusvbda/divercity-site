import { z } from 'zod'

export const FAQ_QUESTION_MAX_LENGTH = 500
export const FAQ_ANSWER_MAX_LENGTH = 2000

export const FaqCreateSchema = z
  .object({
    question: z
      .string()
      .trim()
      .min(1, 'Pergunta é obrigatória')
      .max(FAQ_QUESTION_MAX_LENGTH, `Pergunta deve ter no máximo ${FAQ_QUESTION_MAX_LENGTH} caracteres`),
    answer: z
      .string()
      .trim()
      .max(FAQ_ANSWER_MAX_LENGTH, `Resposta deve ter no máximo ${FAQ_ANSWER_MAX_LENGTH} caracteres`)
      .default(''),
  })
  .strict()

export const FaqUpdateSchema = z
  .object({
    answer: z
      .string()
      .trim()
      .max(FAQ_ANSWER_MAX_LENGTH, `Resposta deve ter no máximo ${FAQ_ANSWER_MAX_LENGTH} caracteres`),
    published: z.boolean(),
  })
  .strict()
  .refine((data) => !data.published || data.answer !== '', {
    message: 'Para apagar a resposta, despublique a FAQ antes',
    path: ['answer'],
  })

export type FaqCreateInput = z.infer<typeof FaqCreateSchema>
export type FaqUpdateInput = z.infer<typeof FaqUpdateSchema>
