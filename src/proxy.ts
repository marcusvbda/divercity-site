import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

// Rotas do admin que a role `operator` pode acessar. Qualquer outra rota
// sob /admin é restrita à role `admin` (CMS, preços, clientes, configurações etc).
const OPERATOR_ALLOWED_PREFIXES = ['/admin/login', '/admin/operacao']

function isOperatorAllowed(pathname: string) {
  return OPERATOR_ALLOWED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
  )
}

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token
    const isLoginPage = pathname === '/admin/login'
    const isAuthenticated = !!token && !token.error

    if (isLoginPage && isAuthenticated) {
      const destination = token?.role === 'operator' ? '/admin/operacao' : '/admin'
      return NextResponse.redirect(new URL(destination, req.url))
    }

    if (isAuthenticated && token?.role === 'operator' && !isOperatorAllowed(pathname)) {
      return NextResponse.redirect(new URL('/admin/operacao', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        const isPublicLoginRoute =
          pathname.startsWith('/admin/login')
        if (isPublicLoginRoute) return true
        return !!token
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
