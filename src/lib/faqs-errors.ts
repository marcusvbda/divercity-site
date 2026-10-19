import { NextResponse } from 'next/server'
import { N8nError, type N8nErrorKind } from '@/lib/n8n'

const STATUS_BY_KIND: Record<N8nErrorKind, number> = {
  not_configured: 500,
  unauthorized: 502,
  not_found: 502,
  table_not_found: 502,
  bad_request: 502,
  unavailable: 502,
  timeout: 504,
}

export function faqErrorResponse(err: unknown) {
  if (err instanceof N8nError) {
    return NextResponse.json({ error: err.message }, { status: STATUS_BY_KIND[err.kind] })
  }
  console.error('[faqs] erro inesperado', err instanceof Error ? err.name : 'unknown')
  return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
}
