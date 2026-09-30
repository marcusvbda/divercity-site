import { NextResponse } from 'next/server'

export function customerErrorResponse(err: unknown) {
  if (typeof err === 'object' && err !== null && 'code' in err && err.code === 'P2002') {
    return NextResponse.json(
      { error: 'Já existe um cliente cadastrado com este CPF.' },
      { status: 409 },
    )
  }
  console.error(err)
  return NextResponse.json({ error: 'Erro inesperado ao salvar o cliente.' }, { status: 500 })
}

export async function parseCustomerResponse(res: Response) {
  const body = await res.json().catch(() => null)
  if (res.ok) return body
  if (typeof body?.error === 'string') throw new Error(body.error)
  const fieldErrors = body?.error?.fieldErrors as Record<string, string[]> | undefined
  const first = fieldErrors && Object.values(fieldErrors).flat()[0]
  throw new Error(first ?? 'Não foi possível salvar o cliente.')
}
