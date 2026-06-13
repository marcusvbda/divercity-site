import type { Metadata } from 'next'
import { ClientPortal } from './ClientPortal'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function ClientPortalPage({ params }: { params: Promise<{ hash: string }> }) {
  const { hash } = await params
  return <ClientPortal hash={hash} />
}
