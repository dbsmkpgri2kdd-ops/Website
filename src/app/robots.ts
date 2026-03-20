
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/guru/', '/siswa/', '/login/'],
    },
    sitemap: 'https://smkspgri2kedondong.sch.id/sitemap.xml',
  }
}
