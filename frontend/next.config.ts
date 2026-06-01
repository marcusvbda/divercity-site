import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  experimental: { reactCompiler: true } as any,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
    ],
  },
}

export default nextConfig
