import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { requireRole } from '@/lib/authz'
import { FAQS_CACHE_TAG, deleteFaq, getFaq, updateFaq } from '@/lib/faqs'
import { faqErrorResponse } from '@/lib/faqs-errors'
import { FaqUpdateSchema } from '@/lib/schemas/faqs'

type RouteContext = { params: Promise<{ id: string }> }

const NOT_FOUND = 'FAQ não encontrada'

function parseId(raw: string) {
  const id = Number(raw)
  return Number.isInteger(id) ? id : null
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { response } = await requireRole(['admin'])
  if (response) return response

  const id = parseId((await params).id)
  if (id === null) return NextResponse.json({ error: NOT_FOUND }, { status: 404 })

  try {
    const faq = await getFaq(id)
    if (!faq) return NextResponse.json({ error: NOT_FOUND }, { status: 404 })
    return NextResponse.json(faq)
  } catch (err) {
    return faqErrorResponse(err)
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const { response } = await requireRole(['admin'])
  if (response) return response

  const id = parseId((await params).id)
  if (id === null) return NextResponse.json({ error: NOT_FOUND }, { status: 404 })

  const body = await req.json().catch(() => null)
  const parsed = FaqUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const faq = await updateFaq(id, parsed.data)
    if (!faq) return NextResponse.json({ error: NOT_FOUND }, { status: 404 })
    revalidateTag(FAQS_CACHE_TAG, 'max')
    return NextResponse.json(faq)
  } catch (err) {
    return faqErrorResponse(err)
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const { response } = await requireRole(['admin'])
  if (response) return response

  const id = parseId((await params).id)
  if (id === null) return NextResponse.json({ error: NOT_FOUND }, { status: 404 })

  try {
    const deleted = await deleteFaq(id)
    if (!deleted) return NextResponse.json({ error: NOT_FOUND }, { status: 404 })
    revalidateTag(FAQS_CACHE_TAG, 'max')
    return NextResponse.json({ success: true })
  } catch (err) {
    return faqErrorResponse(err)
  }
}
