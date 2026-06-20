import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['ws'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        ws: false,
        net: false,
        tls: false,
        crypto: false,
        fs: false,
      }
    }
    return config
  },
}

export default nextConfig