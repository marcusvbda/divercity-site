import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@/generated/prisma/client'

const MAX_INT = 2147483647
const MAX_PAGE = Math.floor(MAX_INT / 100)

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).max(MAX_PAGE).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(15),
})

export const idSchema = z.coerce.number().int().min(1).max(MAX_INT)

const PASSPORT_ROLES = ['child', 'companion'] as const
type PassportRole = (typeof PASSPORT_ROLES)[number]

const PASSPORT_ROLE_LABELS: Record<PassportRole, string> = {
  child: 'Criança',
  companion: 'Acompanhante',
}

export const PRICE_TYPES = ['salao', 'passaportes'] as const

export const priceIdSchema = z
  .string()
  .trim()
  .regex(/^(\d{1,10}|[A-Za-z0-9_-]+:(child|companion))$/)
  .refine((value) => {
    if (value.includes(':')) return true
    const numeric = Number(value)
    return numeric >= 1 && numeric <= MAX_INT
  })

export const priceFiltersSchema = z.object({
  id: priceIdSchema.optional(),
  name: z.string().trim().min(1).optional(),
  key: z.string().trim().min(1).optional(),
  type: z.enum(PRICE_TYPES).optional(),
})

export type PriceFilters = z.infer<typeof priceFiltersSchema>

export type PriceRecord = {
  id: string
  key: string | null
  name: string
  weekdayPrice: string
  weekendPrice: string
  type: (typeof PRICE_TYPES)[number]
}

const priceSelect = {
  id: true,
  key: true,
  name: true,
  weekdayPrice: true,
  weekendPrice: true,
} satisfies Prisma.ServiceSelect

type PriceRow = Prisma.ServiceGetPayload<{ select: typeof priceSelect }>

const passportSelect = {
  id: true,
  key: true,
  name: true,
  weekdayChildPrice: true,
  weekendChildPrice: true,
  weekdayCompanionPrice: true,
  weekendCompanionPrice: true,
} satisfies Prisma.PassportTypeSelect

type PassportRow = Prisma.PassportTypeGetPayload<{ select: typeof passportSelect }>

function serializePrice(row: PriceRow): PriceRecord {
  return {
    id: String(row.id),
    key: row.key,
    name: row.name,
    weekdayPrice: row.weekdayPrice.toFixed(2),
    weekendPrice: row.weekendPrice.toFixed(2),
    type: 'salao',
  }
}

function serializePassport(row: PassportRow, role: PassportRole): PriceRecord {
  const isChild = role === 'child'
  return {
    id: `${row.id}:${role}`,
    key: row.key ? `${row.key}_${role}` : null,
    name: `${row.name} - ${PASSPORT_ROLE_LABELS[role]}`,
    weekdayPrice: (isChild ? row.weekdayChildPrice : row.weekdayCompanionPrice).toFixed(2),
    weekendPrice: (isChild ? row.weekendChildPrice : row.weekendCompanionPrice).toFixed(2),
    type: 'passaportes',
  }
}

function serializePassportRow(row: PassportRow): PriceRecord[] {
  return PASSPORT_ROLES.map((role) => serializePassport(row, role))
}

function matchesPriceFilters(record: PriceRecord, filters: PriceFilters): boolean {
  if (filters.id !== undefined && record.id !== filters.id) return false
  if (filters.key && record.key !== filters.key) return false
  if (filters.name && !record.name.toLowerCase().includes(filters.name.toLowerCase())) return false
  return true
}

export const hourFiltersSchema = z.object({
  id: idSchema.optional(),
  key: z.string().trim().min(1).optional(),
  label: z.string().trim().min(1).optional(),
})

export type HourFilters = z.infer<typeof hourFiltersSchema>

export type HourRecord = {
  id: number
  key: string | null
  label: string
  opening: number
  close: number
}

const hourSelect = {
  id: true,
  key: true,
  label: true,
  opening: true,
  close: true,
} satisfies Prisma.BusinessHourSelect

function buildHourWhere(filters: HourFilters): Prisma.BusinessHourWhereInput {
  const where: Prisma.BusinessHourWhereInput = {}
  if (filters.id !== undefined) where.id = filters.id
  if (filters.key) where.key = filters.key
  if (filters.label) where.label = { contains: filters.label, mode: 'insensitive' }
  return where
}

export type ContentEntityField = {
  name: string
  type: 'integer' | 'string'
  nullable: boolean
  description: string
  enum?: readonly string[]
}

export type ContentEntity<TFilters = unknown, TRecord = unknown, TId = unknown> = {
  name: string
  description: string
  listDescription: string
  filtersSchema: z.ZodType<TFilters>
  idSchema: z.ZodType
  parseId: (raw: string) => TId | null
  fields: ContentEntityField[]
  list: (
    filters: TFilters,
    page: number,
    perPage: number
  ) => Promise<{ data: TRecord[]; total: number }>
  find: (id: TId) => Promise<TRecord | null>
}

const pricesEntity: ContentEntity<PriceFilters, PriceRecord, string> = {
  name: 'prices',
  description: 'Preços do salão de festas e dos passaportes',
  listDescription:
    'Lista paginada: serviços do salão (por nome) e depois passaportes ativos (criança e acompanhante).',
  filtersSchema: priceFiltersSchema,
  idSchema: priceIdSchema,
  parseId: (raw) => {
    const parsed = priceIdSchema.safeParse(raw)
    return parsed.success ? parsed.data : null
  },
  fields: [
    {
      name: 'id',
      type: 'string',
      nullable: false,
      description:
        'Identificador do item: número para o salão (ex.: "12") ou "<passaporte>:child" / "<passaporte>:companion"',
    },
    {
      name: 'key',
      type: 'string',
      nullable: true,
      description: 'Chave (tag) do item; passaportes recebem o sufixo _child ou _companion',
    },
    { name: 'name', type: 'string', nullable: false, description: 'Nome do item' },
    {
      name: 'weekdayPrice',
      type: 'string',
      nullable: false,
      description: 'Preço em dias úteis, em decimal (ex.: "80.00")',
    },
    {
      name: 'weekendPrice',
      type: 'string',
      nullable: false,
      description: 'Preço em fins de semana, em decimal (ex.: "100.00")',
    },
    {
      name: 'type',
      type: 'string',
      nullable: false,
      description: 'Origem do item: "salao" (salão de festas) ou "passaportes"',
      enum: PRICE_TYPES,
    },
  ],
  list: async (filters, page, perPage) => {
    const includeSalon = filters.type !== 'passaportes'
    const includePassports = filters.type !== 'salao'
    const [services, passports] = await Promise.all([
      includeSalon
        ? prisma.service.findMany({ select: priceSelect, orderBy: { name: 'asc' } })
        : Promise.resolve([]),
      includePassports
        ? prisma.passportType.findMany({
            where: { active: true },
            select: passportSelect,
            orderBy: [{ sort: 'asc' }, { durationMinutes: 'asc' }],
          })
        : Promise.resolve([]),
    ])
    const records = [...services.map(serializePrice), ...passports.flatMap(serializePassportRow)]
    const filtered = records.filter((record) => matchesPriceFilters(record, filters))
    const start = (page - 1) * perPage
    return { data: filtered.slice(start, start + perPage), total: filtered.length }
  },
  find: async (id) => {
    const separator = id.indexOf(':')
    if (separator === -1) {
      const row = await prisma.service.findUnique({
        where: { id: Number(id) },
        select: priceSelect,
      })
      return row ? serializePrice(row) : null
    }
    const passportId = id.slice(0, separator)
    const role = id.slice(separator + 1) as PassportRole
    const row = await prisma.passportType.findFirst({
      where: { id: passportId, active: true },
      select: passportSelect,
    })
    return row ? serializePassport(row, role) : null
  },
}

const hoursEntity: ContentEntity<HourFilters, HourRecord, number> = {
  name: 'hours',
  description: 'Horários de funcionamento do parque',
  listDescription: 'Lista paginada, ordenada por id.',
  filtersSchema: hourFiltersSchema,
  idSchema,
  parseId: (raw) => {
    const parsed = idSchema.safeParse(raw)
    return parsed.success ? parsed.data : null
  },
  fields: [
    { name: 'id', type: 'integer', nullable: false, description: 'Identificador do horário' },
    { name: 'key', type: 'string', nullable: true, description: 'Chave (tag) do horário' },
    { name: 'label', type: 'string', nullable: false, description: 'Rótulo do horário' },
    {
      name: 'opening',
      type: 'integer',
      nullable: false,
      description: 'Hora de abertura, em hora cheia (ex.: 10)',
    },
    {
      name: 'close',
      type: 'integer',
      nullable: false,
      description: 'Hora de fechamento, em hora cheia (ex.: 22)',
    },
  ],
  list: async (filters, page, perPage) => {
    const where = buildHourWhere(filters)
    const [rows, total] = await Promise.all([
      prisma.businessHour.findMany({
        where,
        select: hourSelect,
        orderBy: { id: 'asc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.businessHour.count({ where }),
    ])
    return { data: rows, total }
  },
  find: async (id) => {
    return prisma.businessHour.findUnique({ where: { id }, select: hourSelect })
  },
}

export const CONTENT_ENTITIES = {
  prices: pricesEntity,
  hours: hoursEntity,
}

export type ContentEntityName = keyof typeof CONTENT_ENTITIES

export function resolveContentEntity(name: string): ContentEntity | null {
  if (!Object.prototype.hasOwnProperty.call(CONTENT_ENTITIES, name)) return null
  return CONTENT_ENTITIES[name as ContentEntityName] as unknown as ContentEntity
}
