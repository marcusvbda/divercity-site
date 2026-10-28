import { N8nError, n8nRequest } from '@/lib/n8n'
import { BOT_CONFIG_FIELDS, type BotConfig } from '@/types/bot-config'

interface N8nPage<T> {
  data: T[]
  nextCursor?: string | null
}

type N8nBotConfigRow = { id: number } & Partial<Record<keyof BotConfig, unknown>>

export function getBotConfigTableId(): string {
  const tableId = process.env.N8N_INSTRUCOES_TABLE_ID?.trim()
  if (!tableId) throw new N8nError('not_configured')
  return tableId
}

async function getFirstRow(tableId: string): Promise<N8nBotConfigRow | null> {
  const page: N8nPage<N8nBotConfigRow> = await n8nRequest(`/data-tables/${tableId}/rows`, {
    query: { sortBy: 'createdAt:asc', limit: 1 },
  })
  return page.data[0] ?? null
}

function normalize(row: N8nBotConfigRow | null): BotConfig {
  const config = {} as BotConfig
  for (const field of BOT_CONFIG_FIELDS) {
    const value = row?.[field]
    config[field] = value === null || value === undefined ? '' : String(value)
  }
  return config
}

export async function getBotConfig(): Promise<BotConfig> {
  const tableId = getBotConfigTableId()
  return normalize(await getFirstRow(tableId))
}

export async function saveBotConfig(input: BotConfig): Promise<BotConfig> {
  const tableId = getBotConfigTableId()
  const data = Object.fromEntries(BOT_CONFIG_FIELDS.map((field) => [field, input[field]]))
  const current = await getFirstRow(tableId)

  if (current) {
    const rows = await n8nRequest<N8nBotConfigRow[]>(`/data-tables/${tableId}/rows/update`, {
      method: 'PATCH',
      body: {
        filter: { type: 'and', filters: [{ columnName: 'id', condition: 'eq', value: current.id }] },
        data,
        returnData: true,
      },
    })
    const row = rows[0]
    if (!row) throw new N8nError('unavailable', undefined, 'O n8n não retornou a configuração atualizada.')
    return normalize(row)
  }

  const rows = await n8nRequest<N8nBotConfigRow[]>(`/data-tables/${tableId}/rows`, {
    method: 'POST',
    body: { data: [data], returnType: 'all' },
  })
  const row = rows[0]
  if (!row) throw new N8nError('unavailable', undefined, 'O n8n não retornou a configuração criada.')
  return normalize(row)
}
