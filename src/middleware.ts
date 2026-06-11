import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const isLoginPage = req.nextUrl.pathname === '/admin/login'
    const isAuthenticated = !!req.nextauth.token

    if (isLoginPage && isAuthenticated) {
      return NextResponse.redirect(new URL('/admin', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isLoginPage = req.nextUrl.pathname === '/admin/login'
        if (isLoginPage) return true
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
