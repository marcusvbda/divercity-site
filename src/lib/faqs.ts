import { cacheLife, cacheTag } from 'next/cache'
import { connection } from 'next/server'
import { N8nError, n8nRequest } from '@/lib/n8n'
import type { Faq, FaqStatus } from '@/types/faqs'

export const FAQS_CACHE_TAG = 'faqs'

const FAQS_TABLE_NAME = 'faqs'
const ROWS_PAGE_LIMIT = 250
const MAX_BATCHES = 20

interface N8nPage<T> {
  data: T[]
  nextCursor?: string | null
}

interface N8nTable {
  id: string
  name: string
}

interface N8nFaqRow {
  id: number
  question?: string | null
  answer?: string | null
  published?: boolean | null
  createdAt: string
  updatedAt: string
}

let cachedTableId: string | null = null

export async function getFaqsTableId(): Promise<string> {
  const fromEnv = process.env.N8N_FAQS_TABLE_ID?.trim()
  if (fromEnv) return fromEnv
  if (cachedTableId) return cachedTableId

  let cursor: string | undefined
  do {
    const page: N8nPage<N8nTable> = await n8nRequest('/data-tables', {
      query: { filter: JSON.stringify({ name: FAQS_TABLE_NAME }), limit: 250, cursor },
    })
    const table = page.data.find((item) => item.name === FAQS_TABLE_NAME)
    if (table) {
      cachedTableId = table.id
      return table.id
    }
    cursor = page.nextCursor ?? undefined
  } while (cursor)

  throw new N8nError('table_not_found', 404)
}

function normalizeFaq(row: N8nFaqRow): Faq {
  return {
    id: row.id,
    question: row.question ?? '',
    answer: row.answer ?? '',
    published: row.published === true,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function idFilter(id: number) {
  return { type: 'and', filters: [{ columnName: 'id', condition: 'eq', value: id }] }
}

async function fetchRows(filter?: object): Promise<Faq[]> {
  const tableId = await getFaqsTableId()
  const rows: N8nFaqRow[] = []
  let cursor: string | undefined
  let batches = 0

  do {
    const page: N8nPage<N8nFaqRow> = await n8nRequest(`/data-tables/${tableId}/rows`, {
      query: {
        filter: filter ? JSON.stringify(filter) : undefined,
        sortBy: 'createdAt:desc',
        limit: ROWS_PAGE_LIMIT,
        cursor,
      },
    })
    rows.push(...page.data)
    cursor = page.nextCursor ?? undefined
    batches += 1
  } while (cursor && batches < MAX_BATCHES)

  if (cursor) {
    console.warn(`[faqs] limite de ${MAX_BATCHES * ROWS_PAGE_LIMIT} linhas atingido; exibindo as mais recentes`)
  }

  return rows.map(normalizeFaq)
}

export function listAllFaqs(): Promise<Faq[]> {
  return fetchRows()
}

export async function getFaq(id: number): Promise<Faq | null> {
  const tableId = await getFaqsTableId()
  const page: N8nPage<N8nFaqRow> = await n8nRequest(`/data-tables/${tableId}/rows`, {
    query: { filter: JSON.stringify(idFilter(id)), limit: 1 },
  })
  const row = page.data[0]
  return row ? normalizeFaq(row) : null
}

export async function createFaq(input: { question: string; answer: string }): Promise<Faq> {
  const tableId = await getFaqsTableId()
  const rows = await n8nRequest<N8nFaqRow[]>(`/data-tables/${tableId}/rows`, {
    method: 'POST',
    body: {
      data: [{ question: input.question, answer: input.answer, published: false }],
      returnType: 'all',
    },
  })
  const row = rows[0]
  if (!row) throw new N8nError('unavailable', undefined, 'O n8n não retornou a FAQ criada.')
  return normalizeFaq(row)
}

export async function updateFaq(
  id: number,
  input: { answer: string; published: boolean },
): Promise<Faq | null> {
  const tableId = await getFaqsTableId()
  const rows = await n8nRequest<N8nFaqRow[]>(`/data-tables/${tableId}/rows/update`, {
    method: 'PATCH',
    body: {
      filter: idFilter(id),
      data: { answer: input.answer, published: input.published },
      returnData: true,
    },
  })
  const row = rows[0]
  return row ? normalizeFaq(row) : null
}

export async function deleteFaq(id: number): Promise<boolean> {
  const tableId = await getFaqsTableId()
  const rows = await n8nRequest<N8nFaqRow[]>(`/data-tables/${tableId}/rows/delete`, {
    method: 'DELETE',
    query: { filter: JSON.stringify(idFilter(id)), returnData: true },
  })
  return rows.length > 0
}

export async function getPublishedFaqs(): Promise<Faq[]> {
  'use cache'
  cacheTag(FAQS_CACHE_TAG)
  cacheLife('hours')

  const faqs = await fetchRows({
    type: 'and',
    filters: [{ columnName: 'published', condition: 'eq', value: true }],
  })
  return faqs.filter((faq) => faq.published && faq.answer.trim() !== '')
}

export function getFaqStatus(faq: Pick<Faq, 'answer' | 'published'>): FaqStatus {
  if (faq.answer.trim() === '') return 'unanswered'
  return faq.published ? 'published' : 'answered'
}

export async function getPublishedFaqsOrEmpty(logPrefix: string): Promise<Faq[]> {
  await connection()
  try {
    return await getPublishedFaqs()
  } catch (error) {
    console.error(
      `[${logPrefix}] falha ao carregar FAQs:`,
      error instanceof Error ? error.name : 'UnknownError'
    )
    return []
  }
}
