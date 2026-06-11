'use client'

export const absoluteUrl = (url: string | undefined | null) => {
  const STRAPI_URL = process.env.STRAPI_URL ?? 'http://localhost:1337'
  if (!url) return null
  if (url.startsWith('http')) return url
  return `${STRAPI_URL}${url}`
}

export const scrollTo = (href: string) =>
  document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
