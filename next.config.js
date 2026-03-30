/** @type {import('next').NextConfig} */
const nextConfig = {
  // Menghapus output: 'export' karena Server Actions (AI Flows) memerlukan server runtime
  images: {
    unoptimized: true,
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