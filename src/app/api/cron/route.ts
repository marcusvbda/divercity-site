import { connection } from 'next/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  await connection()

  const results: Record<string, string> = {}

  // Keep-alive — roda todo dia para evitar hibernação do Supabase
  try {
    await prisma.$queryRaw`SELECT keep_alive()`
    results.keepAlive = 'ok'
  } catch (err) {
    console.error('[cron] keep-alive error:', err)
    results.keepAlive = 'error'
  }

  // Refresh do token Instagram — só no dia 1 de cada mês
  const today = new Date()
  if (today.getDate() !== 1) {
    results.instagramRefresh = 'skipped'
    return NextResponse.json({ ok: true, results })
  }

  try {
    const setting = await prisma.setting.findUnique({ where: { key: 'instagram_access_token' } })
    const currentToken = setting?.value

    if (!currentToken) {
      results.instagramRefresh = 'skipped (sem token)'
      return NextResponse.json({ ok: true, results })
    }

    const refreshRes = await fetch(
      `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${currentToken}`
    )

    if (!refreshRes.ok) {
      throw new Error(`Instagram API ${refreshRes.status}: ${await refreshRes.text()}`)
    }

    const { access_token: newToken } = (await refreshRes.json()) as { access_token: string }

    await prisma.setting.upsert({
      where: { key: 'instagram_access_token' },
      create: { key: 'instagram_access_token', value: newToken },
      update: { value: newToken },
    })

    results.instagramRefresh = 'ok'
  } catch (err) {
    console.error('[cron] Instagram refresh error:', err)
    results.instagramRefresh = 'error'
  }

  return NextResponse.json({ ok: true, results })
}
