import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Middleware runs for authenticated users
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/accounts/:path*',
    '/cards/:path*',
    '/transactions/:path*',
    '/categories/:path*',
    '/reports/:path*',
    '/settings/:path*',
    '/api/accounts/:path*',
    '/api/cards/:path*',
    '/api/transactions/:path*',
    '/api/categories/:path*',
    '/api/tags/:path*'
  ]
}