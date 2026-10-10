import { NextResponse } from 'next/server'
import { buildOpenApiDocument } from '@/lib/content-api/openapi'

export async function GET() {
  return NextResponse.json(buildOpenApiDocument())
}
