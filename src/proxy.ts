import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { JWT } from 'next-auth/jwt'

// Rotas do admin que a role `operator` pode acessar. Qualquer outra rota
// sob /admin é restrita à role `admin` (CMS, preços, clientes, configurações etc).
const OPERATOR_ALLOWED_PREFIXES = ['/admin/login', '/admin/operacao']

function isOperatorAllowed(pathname: string) {
  return OPERATOR_ALLOWED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
  )
}

function isSessionValid(token: JWT | null) {
  if (!token || token.error || !token.supabaseAccessToken) return false
  try {
    const payload = token.supabaseAccessToken.split('.')[1]
    if (!payload) return false
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const { exp } = JSON.parse(atob(base64)) as { exp?: number }
    return typeof exp === 'number' && exp * 1000 > Date.now()
  } catch {
    return false
  }
}

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    if (token?.role === 'operator' && !isOperatorAllowed(pathname)) {
      return NextResponse.redirect(new URL('/admin/operacao', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        if (pathname.startsWith('/admin/login')) return true
        return isSessionValid(token)
      },
    },
    pages: {
      signIn: '/admin/login',
    },
  }
)

export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
