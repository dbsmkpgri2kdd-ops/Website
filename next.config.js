/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'drive.google.com' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
    ],
  },
  experimental: {
    // Mengizinkan origin development dari Cloud Workstations untuk stabilitas server dev
    allowedDevOrigins: [
      "6000-firebase-webprida2-1774545310835.cluster-ancjwrkgr5dvux4qug5rbzyc2y.cloudworkstations.dev",
      "*.cloudworkstations.dev"
    ],
  },
};

export default nextConfig;
