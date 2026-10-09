import NextAuthProvider from '@/providers/NextAuthProvider'
import { geist } from '../admin-font'
import '../admin-theme.css'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NextAuthProvider session={null}>
      <style>{`body:has([data-admin-theme]){font-family:${geist.style.fontFamily}}`}</style>
      <div data-admin-theme className={geist.variable}>
        {children}
      </div>
    </NextAuthProvider>
  )
}
