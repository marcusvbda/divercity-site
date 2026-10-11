import type { Metadata } from 'next'
import { Fredoka, Poppins } from 'next/font/google'
import { Suspense } from 'react'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import ReactQueryProvider from '@/providers/ReactQueryProvider'
import { getContentType } from '@/lib/cms'
import { SITE_URL, getDescription } from '@/lib/seo'

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
  siteName: CMSValue
  title: CMSValue
  description: CMSValue
  keywords: CMSValue
  og_title: CMSValue
  og_description: CMSValue
  og_image: CMSValue
}

function val(field: CMSValue | undefined, fallback = ''): string {
  return field?.value ?? fallback
}

async function getSiteData() {
  const [metadata, navbar, footer] = await Promise.all([
    getContentType('Metadata'),
    getContentType('NavBar'),
    getContentType('Footer'),
  ])
  const seo = (metadata?.SEO ?? {}) as Partial<SEO>
  const info = (footer?.Info ?? {}) as Record<string, CMSValue | undefined>
  const siteName = val(seo.siteName) || 'Divercity Park'
  const title = val(seo.title)
  const description = getDescription(val(seo.description))
  const logo = val(navbar?.Logo?.url)
  const ogImage = val(seo.og_image) || logo

  return { seo, info, siteName, title, description, logo, ogImage }
}

export async function generateMetadata(): Promise<Metadata> {
  const { seo, siteName, title, description, ogImage } = await getSiteData()
  const ogTitle = val(seo.og_title) || title || siteName
  const ogDescription = getDescription(val(seo.og_description)) || description
  const images = ogImage ? [{ url: ogImage, alt: siteName }] : undefined
  const isPreview = process.env.VERCEL_ENV === 'preview'

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title || siteName, template: `%s | ${siteName}` },
    description,
    applicationName: siteName,
    keywords: val(seo.keywords)
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean),
    robots: isPreview
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true },
        },
    icons: FAVICON_ICONS,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      images,
      locale: 'pt_BR',
      siteName,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [ogImage] : undefined,
    },
  }
}

function absoluteUrl(path: string) {
  return path ? new URL(path, SITE_URL).toString() : undefined
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { info, siteName, description, logo, ogImage } = await getSiteData()
  const instagramUrl = val(info.instagramUrl)
  const address = val(info.address)
  const phone = val(info.wppNumber).replace(/\D/g, '')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AmusementPark',
    name: siteName,
    description,
    url: SITE_URL,
    logo: absoluteUrl(logo),
    image: absoluteUrl(ogImage),
    sameAs: instagramUrl ? [instagramUrl] : undefined,
    address: address || undefined,
    telephone: phone ? `+${phone}` : undefined,
  }

  return (
    <html lang="pt-BR" className={`${fredoka.variable} ${poppins.variable}`}>
      <body className="font-body antialiased" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
          }}
        />
        <ReactQueryProvider>
          <Suspense>{children}</Suspense>
        </ReactQueryProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
