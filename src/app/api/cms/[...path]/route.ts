import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

const STRAPI_URL = process.env.STRAPI_URL ?? 'http://localhost:1337'
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN ?? ''

async function proxy(
  req: NextRequest,
  params: Promise<{ path: string[] }>
) {
  const { path } = await params
  const jwtToken = await getToken({ req })
  const token = STRAPI_API_TOKEN

  const search = req.nextUrl.searchParams.toString()
  const strapiPath = path.join('/')
  const url = `${STRAPI_URL}/api/${strapiPath}${search ? `?${search}` : ''}`

  const isReadMethod = req.method === 'GET' || req.method === 'HEAD'
  const body = isReadMethod ? undefined : await req.text()

  if (!jwtToken && !isReadMethod) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const res = await fetch(url, {
    method: req.method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${token}`,
    },
    body,
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

type RouteContext = { params: Promise<{ path: string[] }> }

export async function GET(req: NextRequest, ctx: RouteContext) {
  return proxy(req, ctx.params)
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  return proxy(req, ctx.params)
}

export async function PUT(req: NextRequest, ctx: RouteContext) {
  return proxy(req, ctx.params)
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  return proxy(req, ctx.params)
}
