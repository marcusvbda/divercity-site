import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const isLoginPage = pathname === '/admin/login'
    const isAuthenticated = !!req.nextauth.token

    if (isLoginPage && isAuthenticated) {
      return NextResponse.redirect(new URL('/admin', req.url))
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
