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

interface SEO {
  title: string
  description: string
  keywords: string
  og_title: string
  og_description: string
  og_image: string | null
}

export async function generateMetadata(): Promise<any> {
  const data = await getContentType('Metadata')
  const meta = (data?.SEO ?? {}) as SEO

  return {
    title: meta.title,
    description: meta?.description ?? '',
    keywords: (meta?.keywords ?? '').split(',').map((k) => k.trim()),
    icons: FAVICON_ICONS,
    openGraph: {
      title: (meta?.og_title || meta?.title) ?? '',
      description: (meta?.og_description || meta.description) ?? '',
      type: 'website',
      images: [{ url: meta?.og_image ?? '', width: 512, height: 512 }],
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
