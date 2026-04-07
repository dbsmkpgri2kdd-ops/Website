import { MetadataRoute } from 'next'

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://studio-128676595-62275.web.app'
  const currentDate = new Date()
  
  const routes = [
    '',
    '/login',
    '/admin',
    '/guru',
    '/siswa',
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  return routes
}
