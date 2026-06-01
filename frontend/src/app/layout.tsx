import type { Metadata } from 'next'
import { Fredoka, Poppins } from 'next/font/google'
import './globals.css'

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

export const metadata: Metadata = {
  title: 'Divercity Park — Diversão para toda a família',
  description:
    'Divercity Park é o melhor parque indoor da região. Festas de aniversário, mais de 10 atrações, área para pais e muito mais. Reserve sua festa agora!',
  keywords: [
    'parque infantil',
    'festa infantil',
    'aniversário criança',
    'diversão indoor',
    'Divercity Park',
  ],
  openGraph: {
    title: 'Divercity Park — Diversão para toda a família',
    description:
      'Festas inesquecíveis e mais de 10 atrações para toda a família.',
    type: 'website',
    images: [{ url: '/logo-ball.png', width: 512, height: 512 }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${fredoka.variable} ${poppins.variable}`}>
      <body className="font-body antialiased">{children}</body>
    </html>
  )
}
