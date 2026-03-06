import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  transpilePackages: ['shiki', '@shikijs/primitive', '@shikijs/themes', '@shikijs/langs'],
}

export default nextConfig
