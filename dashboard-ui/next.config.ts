import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  poweredByHeader: false,

  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  },
  images: {
    domains: ['localhost'],
  },
  async redirects() {
    return [
      {
        source: '/reports/new',
        destination: '/reports',
        permanent: false,
      },
    ]
  },
}

export default nextConfig
