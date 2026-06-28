import { connection } from 'next/server'
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  await connection()
  const { error } = await supabase.rpc('keep_alive')

  if (error) {
    console.error('[keep-alive] erro ao chamar RPC:', error.message)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
