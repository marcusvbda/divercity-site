import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import NextAuthProvider from '@/providers/NextAuthProvider'
import SessionGuard from './SessionGuard'
import { Footer } from '@/components/admin/layout/Footer'
import { Header } from '@/components/admin/layout/Header'
import { SidebarLayout } from '@/components/admin/layout/Sidebar'
import { SidebarInset, SidebarProvider } from '@/components/admin/ui/sidebar'
import { Toaster } from '@/components/admin/ui/sonner'
import { TooltipProvider } from '@/components/admin/ui/tooltip'
import { getContentType } from '@/lib/cms'
import { geist } from '../admin-font'
import '../admin-theme.css'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await connection()
  const session = await getServerSession(authOptions)

  if (!session || session.error) {
    redirect('/admin/login')
  }

  const navbar = await getContentType('NavBar')
  const logoUrl = navbar?.Logo?.url?.value as string | undefined

  return (
    <NextAuthProvider session={session}>
      <style>{`body:has([data-admin-theme]){font-family:${geist.style.fontFamily}}`}</style>
      <div data-admin-theme className={geist.variable}>
        <SessionGuard />
        <TooltipProvider>
          <SidebarProvider>
            <SidebarLayout logoUrl={logoUrl} />
            <SidebarInset className="min-w-0">
              <Header />
              <div className="mx-auto flex w-full flex-1 flex-col px-4 py-6 sm:px-6">
                {children}
              </div>
              <Toaster richColors position="top-right" />
              <Footer />
            </SidebarInset>
          </SidebarProvider>
        </TooltipProvider>
      </div>
    </NextAuthProvider>
  )
}
