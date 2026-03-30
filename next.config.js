
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'drive.google.com' },
    ],
  },
  // Konfigurasi eksperimental untuk kompatibilitas Genkit jika digunakan via API eksternal
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
