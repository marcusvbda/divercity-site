import type { Metadata } from 'next'
import { Fredoka, Poppins } from 'next/font/google'
import { Suspense } from 'react'
import './globals.css'
import ReactQueryProvider from '@/providers/ReactQueryProvider'
import { getContentType } from '@/lib/cms'

const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-fredoka',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

const FAVICON_ICONS: Metadata['icons'] = {
  icon: [
    { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    { url: '/favicon/favicon.ico', sizes: 'any' },
  ],
  apple: { url: '/favicon/apple-touch-icon.png' },
  other: [{ rel: 'manifest', url: '/favicon/site.webmanifest' }],
}

type CMSValue = { id: number; value: string | null } | null

interface SEO {
  title: CMSValue
  description: CMSValue
  keywords: CMSValue
  og_title: CMSValue
  og_description: CMSValue
  og_image: CMSValue
}

function val(field: CMSValue, fallback = ''): string {
  return field?.value ?? fallback
}

export async function generateMetadata(): Promise<any> {
  const data = await getContentType('Metadata')
  const meta = (data?.SEO ?? {}) as SEO

  const ogImage = val(meta?.og_image) || '/logo-ball.png'
  return {
    title: val(meta.title),
    description: val(meta?.description),
    keywords: val(meta?.keywords)
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean),
    icons: FAVICON_ICONS,
    openGraph: {
      title: val(meta?.og_title) || val(meta?.title),
      description: val(meta?.og_description) || val(meta?.description),
      type: 'website',
      images: [{ url: ogImage, width: 512, height: 512 }],
    },
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${fredoka.variable} ${poppins.variable}`}>
      <body className="font-body antialiased">
        <ReactQueryProvider>
          <Suspense>{children}</Suspense>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
