import withSerwistInit from '@serwist/next'
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

// next-intl plugin — reads ./i18n/request.ts for locale configuration
const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const withSerwist = withSerwistInit({
  // Note: Enable in development to always rebuild the service worker
  disable: process.env.NODE_ENV === 'development',
  // Inject the build-time generated service worker alongside the app
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
  reloadOnOnline: true,
  register: true,
})

const config: NextConfig = {
  reactStrictMode: true,
  // Keep development manifests isolated from `next build`. Running a build
  // while Studio is open must never delete Turbopack's active route manifests.
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
  // Enable standalone output so the app can run on a bare Node.js server / Docker
  // without the Next.js CLI. Perfect for self-hosted VPS deployments.
  output: 'standalone',
  images: {
    remotePatterns: [
      { hostname: 'cdn.sanity.io' },
      { hostname: 'picsum.photos' },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
}

// Compose: next-intl plugin, then Serwist PWA plugin
export default withNextIntl(withSerwist(config))
