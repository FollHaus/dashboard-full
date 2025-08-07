import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  poweredByHeader: false,

  env: {
    APP_URL: process.env.APP_URL || 'http://localhost:3000',
  },
  images: {
    domains: ['localhost'],
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/api/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:4000/uploads/:path*',
      },
    ]
  },
}

export default nextConfig
