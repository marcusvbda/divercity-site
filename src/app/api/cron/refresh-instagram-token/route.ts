import { connection } from 'next/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  await connection()

  const setting = await prisma.setting.findUnique({ where: { key: 'instagram_access_token' } })
  const currentToken = setting?.value

  if (!currentToken) {
    console.error('[refresh-instagram-token] INSTAGRAM_ACCESS_TOKEN não configurado')
    return NextResponse.json({ ok: false, error: 'Token não configurado' }, { status: 500 })
  }

  try {
    const refreshRes = await fetch(
      `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${currentToken}`
    )

    if (!refreshRes.ok) {
      const body = await refreshRes.text()
      throw new Error(`Instagram API ${refreshRes.status}: ${body}`)
    }

    const { access_token: newToken } = (await refreshRes.json()) as { access_token: string }

    await prisma.setting.upsert({
      where: { key: 'instagram_access_token' },
      create: { key: 'instagram_access_token', value: newToken },
      update: { value: newToken },
    })

    console.log('[refresh-instagram-token] Token renovado com sucesso')
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[refresh-instagram-token] Erro:', err)
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}
