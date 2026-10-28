import { z } from 'zod'

export const BOT_CONFIG_MAX_LENGTH = 20000

function field(label: string) {
  return z
    .string()
    .max(BOT_CONFIG_MAX_LENGTH, `${label} deve ter no máximo 20.000 caracteres`)
}

export const BotConfigSchema = z
  .object({
    PERSONA_E_REGRAS: field('Persona e regras'),
    FATOS_DO_PARQUE: field('Fatos do parque'),
    AVISOS_DE_HOJE: field('Avisos de hoje'),
    FERIADOS: field('Feriados'),
    MSG_HANDOFF_CLIENTE: field('Mensagem de handoff ao cliente'),
    MSG_MIDIA: field('Mensagem de mídia'),
    MSG_CONFIRMACAO: field('Mensagem de confirmação'),
  })
  .strict()

export type BotConfigInput = z.infer<typeof BotConfigSchema>
