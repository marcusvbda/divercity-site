import { connection } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import NextAuthProvider from '@/providers/NextAuthProvider'
import SessionGuard from './SessionGuard'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { getContentType } from '@/lib/cms'
import { Toaster } from 'sonner'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await connection()
  const session = await getServerSession(authOptions)

  if (!session) {
    return <NextAuthProvider session={null}>{children}</NextAuthProvider>
  }

  const navbar = await getContentType('NavBar')
  const logoUrl = navbar?.Logo?.url?.value as string | undefined

  return (
    <NextAuthProvider session={session}>
      <SessionGuard />
      <Toaster richColors position="top-right" />
      <SidebarProvider
        style={
          {
            '--sidebar-width': 'calc(var(--spacing) * 72)',
            '--header-height': 'calc(var(--spacing) * 12)',
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" logoUrl={logoUrl} />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </NextAuthProvider>
  )
}
