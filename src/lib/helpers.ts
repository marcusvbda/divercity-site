'use client'

type CmsValue = { id: number; value: string | null } | null

export const absoluteUrl = (url: string | CmsValue | undefined | null) => {
  const raw = typeof url === 'object' && url !== null ? url.value : url
  const STRAPI_URL = process.env.STRAPI_URL ?? 'http://localhost:1337'
  if (!raw) return null
  if (raw.startsWith('http')) return raw
  return `${STRAPI_URL}${raw}`
}

export const scrollTo = (href: string) =>
  document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
