
/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export' DIHAPUS agar Server Actions & AI Genkit bisa berjalan secara dinamis di Firebase Hosting
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'drive.google.com' },
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
