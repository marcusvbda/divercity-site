import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api', '/api-docs', '/c/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
