import type { NextConfig } from '@/next'
import { codeInspectorPlugin } from 'code-inspector-plugin'
import { env } from './env'

const isDev = process.env.NODE_ENV === 'development'
const API_PROXY_TARGET = process.env.API_PROXY_TARGET || 'https://api.katailyst.com'
const allowedDevOrigins = process.env.NEXT_ALLOWED_DEV_ORIGINS?.split(',')
  .map((origin) => origin.trim())
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
  productionBrowserSourceMaps: false, // enable browser source map generation during the production build
  typescript: {
    // https://nextjs.org/docs/api-reference/next.config.js/ignoring-typescript-errors
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: '/explore/apps',
        destination: '/',
        permanent: true,
      },
      {
        // TODO(2026-11-11): Remove after external education CTAs and active campaign links use the canonical route.
        source: '/education-apply',
        destination: '/education/apply',
        permanent: true,
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
  // Vercel owns tracing; standalone output remains available for Docker builds.
  output: process.env.VERCEL ? undefined : 'standalone',
  compiler: {
    removeConsole: isDev ? false : { exclude: ['warn', 'error'] },
  },
}

export default nextConfig
