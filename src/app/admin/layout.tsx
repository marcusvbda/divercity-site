import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import NextAuthProvider from '@/providers/NextAuthProvider'
import SessionGuard from './SessionGuard'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <NextAuthProvider session={session}>
      <SessionGuard />
      {children}
    </NextAuthProvider>
  )
}
