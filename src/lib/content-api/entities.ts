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

export const priceFiltersSchema = z.object({
  id: idSchema.optional(),
  name: z.string().trim().min(1).optional(),
  key: z.string().trim().min(1).optional(),
})

export type PriceFilters = z.infer<typeof priceFiltersSchema>

export type PriceRecord = {
  id: number
  key: string | null
  name: string
  weekdayPrice: string
  weekendPrice: string
}

const priceSelect = {
  id: true,
  key: true,
  name: true,
  weekdayPrice: true,
  weekendPrice: true,
} satisfies Prisma.ServiceSelect

type PriceRow = Prisma.ServiceGetPayload<{ select: typeof priceSelect }>

function serializePrice(row: PriceRow): PriceRecord {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    weekdayPrice: row.weekdayPrice.toFixed(2),
    weekendPrice: row.weekendPrice.toFixed(2),
  }
}

function buildPriceWhere(filters: PriceFilters): Prisma.ServiceWhereInput {
  const where: Prisma.ServiceWhereInput = {}
  if (filters.id !== undefined) where.id = filters.id
  if (filters.name) where.name = { contains: filters.name, mode: 'insensitive' }
  if (filters.key) where.key = filters.key
  return where
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
}

export type ContentEntity<TFilters = unknown, TRecord = unknown> = {
  name: string
  description: string
  listDescription: string
  filtersSchema: z.ZodType<TFilters>
  parseId: (raw: string) => number | null
  fields: ContentEntityField[]
  list: (
    filters: TFilters,
    page: number,
    perPage: number
  ) => Promise<{ data: TRecord[]; total: number }>
  find: (id: number) => Promise<TRecord | null>
}

const pricesEntity: ContentEntity<PriceFilters, PriceRecord> = {
  name: 'prices',
  description: 'Preços dos serviços do salão de festas',
  listDescription: 'Lista paginada, ordenada por nome.',
  filtersSchema: priceFiltersSchema,
  parseId: (raw) => {
    const parsed = idSchema.safeParse(raw)
    return parsed.success ? parsed.data : null
  },
  fields: [
    { name: 'id', type: 'integer', nullable: false, description: 'Identificador do serviço' },
    { name: 'key', type: 'string', nullable: true, description: 'Chave (tag) do serviço' },
    { name: 'name', type: 'string', nullable: false, description: 'Nome do serviço' },
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
  ],
  list: async (filters, page, perPage) => {
    const where = buildPriceWhere(filters)
    const [rows, total] = await Promise.all([
      prisma.service.findMany({
        where,
        select: priceSelect,
        orderBy: { name: 'asc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.service.count({ where }),
    ])
    return { data: rows.map(serializePrice), total }
  },
  find: async (id) => {
    const row = await prisma.service.findUnique({ where: { id }, select: priceSelect })
    return row ? serializePrice(row) : null
  },
}

const hoursEntity: ContentEntity<HourFilters, HourRecord> = {
  name: 'hours',
  description: 'Horários de funcionamento do parque',
  listDescription: 'Lista paginada, ordenada por id.',
  filtersSchema: hourFiltersSchema,
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
