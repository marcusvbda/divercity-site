export const BOT_CONFIG_FIELDS = [
  'PERSONA_E_REGRAS',
  'FATOS_DO_PARQUE',
  'AVISOS_DE_HOJE',
  'FERIADOS',
  'MSG_HANDOFF_CLIENTE',
  'MSG_MIDIA',
  'MSG_CONFIRMACAO',
] as const

export type BotConfigField = (typeof BOT_CONFIG_FIELDS)[number]

export type BotConfig = Record<BotConfigField, string>
