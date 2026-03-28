import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/guru/', '/siswa/', '/login/'],
    },
    sitemap: 'https://studio-128676595-62275.web.app/sitemap.xml',
  }
}
