import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SMKS PGRI 2 KEDONDONG',
    short_name: 'SMKS PGRI 2',
    description: 'Portal Digital Excellence SMKS PGRI 2 Kedondong',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0c1b',
    theme_color: '#0a0c1b',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: 'https://picsum.photos/seed/logo/192/192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://picsum.photos/seed/logo/512/512',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
