import type { Metadata } from 'next'
import { Fredoka, Poppins } from 'next/font/google'
import './globals.css'
import { getCMSSiteMetadata } from '@/lib/cms'
import ReactQueryProvider from '@/providers/ReactQueryProvider'

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

export async function generateMetadata(): Promise<Metadata> {
  try {
    const meta = await getCMSSiteMetadata()
    if (!meta) throw new Error('CMS metadata unavailable')
    return {
      title: meta.titulo,
      description: meta.descricao,
      keywords: meta.keywords?.split(',').map((k: any) => k.trim()),
      icons: FAVICON_ICONS,
      openGraph: {
        title: meta.og_titulo ?? meta.titulo,
        description: meta.og_descricao ?? meta.descricao,
        type: 'website',
        images: meta.og_imagem
          ? [
              {
                url: meta.og_imagem.url,
                width: meta.og_imagem.width ?? 512,
                height: meta.og_imagem.height ?? 512,
              },
            ]
          : [{ url: '/logo-ball.png', width: 512, height: 512 }],
      },
    }
  } catch {
    // Fallback to static values if CMS is unavailable
    return {
      title: 'Divercity Park — Diversão para toda a família',
      description:
        'Divercity Park é o melhor parque indoor da região. Festas de aniversário, mais de 10 atrações, área para pais e muito mais.',
      icons: FAVICON_ICONS,
      openGraph: {
        title: 'Divercity Park — Diversão para toda a família',
        description:
          'Festas inesquecíveis e mais de 10 atrações para toda a família.',
        type: 'website',
        images: [{ url: '/logo-ball.png', width: 512, height: 512 }],
      },
    }
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${fredoka.variable} ${poppins.variable}`}>
      <body className="font-body antialiased"><ReactQueryProvider>{children}</ReactQueryProvider></body>
    </html>
  )
}
