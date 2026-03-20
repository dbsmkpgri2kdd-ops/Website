/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output export memastikan Next.js menghasilkan folder 'out' yang berisi file statis
  // Ini adalah cara terbaik untuk tetap berada di Paket Gratis (Spark Plan) Firebase
  output: 'export', 

  images: {
    unoptimized: true, 
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com',
        pathname: '/**',
      },
    ],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;