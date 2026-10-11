import type { Metadata } from 'next'

export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL ?? 'https://divercitypark.com.br'
).replace(/\/+$/, '')

type PageMetadataOptions = {
  title?: string
  description?: string
  image?: string
  path?: string
  type?: 'article' | 'website'
}

export const getDescription = (text?: string | null, maxLength = 160) => {
  if (!text) return undefined

  const normalizedText = text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()

  if (normalizedText.length <= maxLength) return normalizedText

  const truncatedText = normalizedText.slice(0, maxLength)
  const lastSpace = truncatedText.lastIndexOf(' ')

  return `${truncatedText.slice(0, lastSpace > 0 ? lastSpace : maxLength)}…`
}

export const getPageMetadata = ({
  title,
  description,
  image,
  path = '',
  type = 'website',
}: PageMetadataOptions): Metadata => {
  const canonical = path || '/'

  return {
    title: path ? title : title ? { absolute: title } : undefined,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : undefined,
      locale: 'pt_BR',
      type,
      url: canonical,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      images: image ? [image] : undefined,
    },
  }
}
