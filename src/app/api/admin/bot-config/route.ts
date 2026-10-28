import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/authz'
import { getBotConfig, saveBotConfig } from '@/lib/bot-config'
import { botConfigErrorResponse } from '@/lib/bot-config-errors'
import { BotConfigSchema } from '@/lib/schemas/bot-config'

export async function GET() {
  const { response } = await requireRole(['admin'])
  if (response) return response

  try {
    return NextResponse.json(await getBotConfig())
  } catch (err) {
    return botConfigErrorResponse(err)
  }
}

export async function PUT(req: NextRequest) {
  const { response } = await requireRole(['admin'])
  if (response) return response

  const body = await req.json().catch(() => null)
  const parsed = BotConfigSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    return NextResponse.json(await saveBotConfig(parsed.data))
  } catch (err) {
    return botConfigErrorResponse(err)
  }
}
