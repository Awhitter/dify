import type { NextConfig } from '@/next'
import createMDX from '@next/mdx'
import { codeInspectorPlugin } from 'code-inspector-plugin'
import { env } from './env'
const isDev = process.env.NODE_ENV === 'development'
const withMDX = createMDX()
const API_PROXY_TARGET = process.env.API_PROXY_TARGET || 'https://api.katailyst.com'
const allowedDevOrigins = process.env.NEXT_ALLOWED_DEV_ORIGINS?.split(',')
  .map(origin => origin.trim())
  .filter(Boolean)
const nextConfig: NextConfig = {
  basePath: env.NEXT_PUBLIC_BASE_PATH,
  ...(allowedDevOrigins?.length ? { allowedDevOrigins } : {}),
  transpilePackages: ['@t3-oss/env-core', '@t3-oss/env-nextjs', 'echarts', 'zrender'],
  serverExternalPackages: ['loro-crdt'],
  turbopack: {
    rules: codeInspectorPlugin({
      bundler: 'turbopack',
    }),
  },
  productionBrowserSourceMaps: false,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: '/explore/apps',
        destination: '/',
        permanent: false,
      },
    ]
  },
  async rewrites() {
    return [
      { source: '/console/api/:path*', destination: `${API_PROXY_TARGET}/console/api/:path*` },
      { source: '/api/:path*', destination: `${API_PROXY_TARGET}/api/:path*` },
      { source: '/v1/:path*', destination: `${API_PROXY_TARGET}/v1/:path*` },
      { source: '/files/:path*', destination: `${API_PROXY_TARGET}/files/:path*` },
    ]
  },
  async headers() {
    const antiFrame = [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
    ]
    return [
      { source: '/device', headers: antiFrame },
      { source: '/device/:path*', headers: antiFrame },
    ]
  },
  output: 'standalone',
  compiler: {
    removeConsole: isDev ? false : { exclude: ['warn', 'error'] },
  },
}
export default withMDX(nextConfig)
