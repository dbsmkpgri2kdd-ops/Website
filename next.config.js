
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'drive.google.com' },
    ],
  },
  // Konfigurasi experimental tetap dipertahankan namun flow AI dinonaktifkan di UI untuk mendukung ekspor statis
  experimental: {
    serverComponentsExternalPackages: [
      'genkit',
      '@genkit-ai/core',
      '@genkit-ai/google-genai',
      '@opentelemetry/sdk-node',
      'require-in-the-middle',
      'import-in-the-middle'
    ],
  },
};

export default nextConfig;
