/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Menghapus unoptimized: true untuk mengaktifkan optimasi otomatis Next.js
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
       {
        protocol: 'https',
        hostname: 'drive.google.com',
      },
    ],
  },
  
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
