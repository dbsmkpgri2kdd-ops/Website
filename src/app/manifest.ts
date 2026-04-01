import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  const logoUrl = 'https://firebasestorage.googleapis.com/v0/b/firebasestudio-images/o/user-uploaded-image.png?alt=media';
  
  return {
    name: 'SMKS PGRI 2 KEDONDONG',
    short_name: 'SMK PRIDA',
    description: 'Portal Digital Hub Enterprise SMKS PGRI 2 Kedondong. Akses PPDB Online, E-Rapor, dan Layanan Mandiri Siswa.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3b82f6', // Royal Blue
    icons: [
      {
        src: logoUrl,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: logoUrl,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    categories: ['education', 'productivity'],
    orientation: 'portrait'
  }
}