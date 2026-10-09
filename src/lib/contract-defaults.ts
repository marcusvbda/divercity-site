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
  return key.startsWith('cliente_') || key.startsWith('festa_') || key.startsWith('contrato_')
}

export const CONTRACT_PAYMENT_STATUS_LABELS: Record<'unpaid' | 'partial' | 'paid', string> = {
  unpaid: 'Não pago',
  partial: 'Parcial',
  paid: 'Pago',
}

type ContractLike = {
  value?: { toString(): string } | string | number | null
  paymentStatus?: 'unpaid' | 'partial' | 'paid' | null
  additionalInfo?: string | null
}

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function buildContractValues(contract: ContractLike): Record<string, string> {
  const amount = contract.value == null ? NaN : Number(String(contract.value))
  return {
    contrato_valor: Number.isFinite(amount) ? BRL.format(amount) : '',
    contrato_status_pagamento: contract.paymentStatus
      ? CONTRACT_PAYMENT_STATUS_LABELS[contract.paymentStatus]
      : '',
    contrato_informacoes_adicionais: contract.additionalInfo ?? '',
  }
}

const DEFAULT_VARIABLE_LABELS: Record<string, string> = {
  cliente_name: 'Nome',
  cliente_cpf: 'CPF',
  cliente_email: 'E-mail',
  cliente_phone: 'Telefone',
  festa_date: 'Data de início',
  festa_date_end: 'Data de término',
  festa_dateEnd: 'Data de término',
  festa_status: 'Status',
  festa_children_count: 'Quantidade de crianças',
  festa_childrenCount: 'Quantidade de crianças',
  festa_adults_count: 'Quantidade de adultos',
  festa_adultsCount: 'Quantidade de adultos',
  festa_total_participants: 'Total de participantes',
  festa_totalParticipants: 'Total de participantes',
  festa_payment_option: 'Opção de pagamento',
  festa_paymentOption: 'Opção de pagamento',
  festa_salon_price: 'Valor do salão',
  festa_salonPrice: 'Valor do salão',
  festa_passport_package_price: 'Valor do pacote de passaportes',
  festa_passportPackagePrice: 'Valor do pacote de passaportes',
  festa_passport_single_price: 'Valor do passaporte avulso',
  festa_passportSinglePrice: 'Valor do passaporte avulso',
  festa_passport_single_count: 'Passaportes avulsos',
  festa_passportSingleCount: 'Passaportes avulsos',
  festa_total_price: 'Valor total',
  festa_totalPrice: 'Valor total',
  festa_terms_accepted_at: 'Termos aceitos em',
  festa_termsAcceptedAt: 'Termos aceitos em',
  contrato_valor: 'Valor do contrato',
  contrato_status_pagamento: 'Status de pagamento',
  contrato_informacoes_adicionais: 'Informações adicionais',
}

export function getDefaultVariableLabel(key: string): string {
  const known = DEFAULT_VARIABLE_LABELS[key]
  if (known) return known
  const bare = key.replace(/^(cliente|festa|contrato)_/, '').replace(/_/g, ' ').trim()
  if (!bare) return key
  return bare.charAt(0).toUpperCase() + bare.slice(1)
}
