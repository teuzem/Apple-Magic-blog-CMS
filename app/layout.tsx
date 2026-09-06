import '../tailwind.css'
import 'katex/dist/katex.min.css'

import type { Metadata } from 'next'
import { headers } from 'next/headers'

import { SITE } from '@/lib/constants'

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  applicationName: SITE.name,
  title: {
    default: SITE.name,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description.en,
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon/favicon.ico', sizes: 'any' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      {
        url: '/favicon/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    locale: 'en_US',
    alternateLocale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@applemagicblog',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // next-intl middleware sets this header with the active locale
  const h = await headers()
  const locale = h.get('x-next-intl-locale') || 'en'

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className="bg-white text-ink antialiased transition-colors duration-300 dark:bg-black dark:text-gray-8"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  )
}
