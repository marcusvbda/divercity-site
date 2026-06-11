'use client'

type CmsValue = { id: number; value: string | null } | null

export const scrollTo = (href: string) =>
  document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
