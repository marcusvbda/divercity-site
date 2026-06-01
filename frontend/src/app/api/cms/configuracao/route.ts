import { NextResponse } from 'next/server'
import { getCMSConfig } from '@/lib/cms'

export const revalidate = 3600

export async function GET() {
  const config = await getCMSConfig()
  return NextResponse.json(config)
}
