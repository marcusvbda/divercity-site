import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { requireRole } from '@/lib/authz'
import { FAQS_CACHE_TAG, createFaq, listAllFaqs } from '@/lib/faqs'
import { faqErrorResponse } from '@/lib/faqs-errors'
import { FaqCreateSchema } from '@/lib/schemas/faqs'

function parsePositiveInt(raw: string | null, fallback: number, max = Infinity) {
  const value = Number(raw)
  if (!raw || !Number.isInteger(value) || value < 1) return fallback
  return Math.min(value, max)
}

export async function GET(req: NextRequest) {
  const { response } = await requireRole(['admin'])
  if (response) return response

  const { searchParams } = new URL(req.url)
  const page = parsePositiveInt(searchParams.get('page'), 1)
  const perPage = parsePositiveInt(searchParams.get('perPage'), 15, 100)
  const published = searchParams.get('published')
  const unanswered = searchParams.get('unanswered') === 'true'

  try {
    let faqs = await listAllFaqs()
    if (published === 'true') faqs = faqs.filter((faq) => faq.published)
    else if (published === 'false') faqs = faqs.filter((faq) => !faq.published)
    if (unanswered) faqs = faqs.filter((faq) => faq.answer.trim() === '')

    faqs.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

    const total = faqs.length
    const totalPages = Math.max(1, Math.ceil(total / perPage))
    const data = faqs.slice((page - 1) * perPage, page * perPage)

    return NextResponse.json({ data, pagination: { page, perPage, total, totalPages } })
  } catch (err) {
    return faqErrorResponse(err)
  }
}

export async function POST(req: NextRequest) {
  const { response } = await requireRole(['admin'])
  if (response) return response

  const body = await req.json().catch(() => null)
  const parsed = FaqCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const faq = await createFaq(parsed.data)
    revalidateTag(FAQS_CACHE_TAG, 'max')
    return NextResponse.json(faq, { status: 201 })
  } catch (err) {
    return faqErrorResponse(err)
  }
}
