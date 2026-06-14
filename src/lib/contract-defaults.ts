const BLOCKED_KEYS = new Set([
  // ids
  'id',
  // customer FKs
  'customerId', 'customer_id',
  // party FKs
  'contractTemplateId', 'contract_template_id',
  'partyId', 'party_id',
  // timestamps
  'createdAt', 'created_at',
  'updatedAt', 'updated_at',
  // relations
  'parties', 'customer', 'contractTemplate', 'contract',
])

const DATE_KEYS = new Set(['date', 'dateEnd', 'date_end'])

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`)
}

function formatValue(key: string, value: unknown): string {
  if (value == null) return ''
  if (DATE_KEYS.has(key) && (value instanceof Date || typeof value === 'string')) {
    try {
      return new Date(value as string).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    } catch { /* fall through */ }
  }
  return String(value)
}

type PartyLike = { customer: Record<string, unknown> } & Record<string, unknown>

export function buildDefaultValues(party: PartyLike): Record<string, string> {
  const result: Record<string, string> = {}

  for (const [key, value] of Object.entries(party.customer)) {
    if (BLOCKED_KEYS.has(key)) continue
    if (value == null || value === '' || typeof value === 'object') continue
    result[`cliente_${camelToSnake(key)}`] = formatValue(key, value)
  }

  for (const [key, value] of Object.entries(party)) {
    if (BLOCKED_KEYS.has(key)) continue
    if (value == null || value === '' || typeof value === 'object') continue
    result[`festa_${camelToSnake(key)}`] = formatValue(key, value)
  }

  return result
}

export function isDefaultVariable(key: string): boolean {
  return key.startsWith('cliente_') || key.startsWith('festa_')
}
