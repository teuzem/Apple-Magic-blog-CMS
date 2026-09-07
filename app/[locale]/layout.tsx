import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { Suspense } from 'react'

import { ConsentAndNewsletterPopups } from '@/components/layout/ConsentAndNewsletterPopups'
import { Footer } from '@/components/layout/Footer'
import { Navigation } from '@/components/layout/Navigation'
import { AppProviders } from '@/components/providers/AppProviders'
import JsonLd from '@/components/seo/JsonLd'
import { organizationSchema, websiteSchema } from '@/components/seo/schema'
import { VisualEditing } from '@/components/VisualEditing'
import { SITE } from '@/lib/constants'
import { safeSanityFetch } from '@/lib/safeSanity'
import { getCategories, getNavigation, getSettings } from '@/lib/sanity.client'
import type { Category, Settings } from '@/lib/sanity.queries'

const locales = ['en', 'fr']

interface LocaleLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

// Allow static rendering of localized routes
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const safeLocale = locales.includes(locale) ? locale : 'en'
  const settings = await safeSanityFetch(
    (client) => getSettings(client),
    {} as Settings,
  )
  const seo = settings.seoDefaults
  const description =
    safeLocale === 'fr'
      ? seo?.descriptionFr || SITE.description.fr
      : seo?.description || SITE.description.en
  return {
    title: {
      default: settings.title || SITE.name,
      template: `%s${seo?.titleSuffix || ` — ${SITE.name}`}`,
    },
    description,
    keywords: seo?.defaultKeywords,
    alternates: {
      canonical: `${SITE.url}/${safeLocale}`,
      languages: {
        en: `${SITE.url}/en`,
        fr: `${SITE.url}/fr`,
        'x-default': `${SITE.url}/en`,
      },
      types: {
        'application/rss+xml': `${SITE.url}/api/feed/${safeLocale}`,
        'application/atom+xml': `${SITE.url}/api/feed/${safeLocale}/atom`,
        'application/feed+json': `${SITE.url}/api/feed/${safeLocale}/json`,
      },
    },
    verification: {
      google: seo?.googleSiteVerification || undefined,
      other: seo?.bingSiteVerification
        ? { 'msvalidate.01': seo.bingSiteVerification }
        : undefined,
    },
    category: 'technology news',
    creator: settings.title || SITE.name,
    publisher: seo?.organizationName || settings.title || SITE.name,
    authors: [{ name: seo?.organizationName || SITE.name, url: SITE.url }],
  }
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params
  const safeLocale = locales.includes(locale) ? locale : 'en'
  if (!locales.includes(locale)) notFound()

  setRequestLocale(safeLocale)
  const t = await getTranslations({ locale: safeLocale, namespace: 'common' })
  const [messages, nav, settings, categories] = await Promise.all([
    getMessages({ locale: safeLocale }),
    safeSanityFetch((c) => getNavigation(c), null as any),
    safeSanityFetch((c) => getSettings(c), {} as Settings),
    safeSanityFetch((c) => getCategories(c), [] as Category[]),
  ])

  return (
    <NextIntlClientProvider messages={messages}>
      <JsonLd
        data={[organizationSchema(safeLocale), websiteSchema(safeLocale)]}
      />
      <Suspense fallback={null}>
        <VisualEditing />
      </Suspense>
      <AppProviders>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-apple-blue focus:px-4 focus:py-2 focus:text-sm focus:text-white"
        >
          {t('skipToContent')}
        </a>
        <Navigation categories={categories} navItems={nav?.items ?? []} />
        <main id="main-content">{children}</main>
        <Footer footerGroups={nav?.footer ?? []} settings={settings} />
        <ConsentAndNewsletterPopups />
      </AppProviders>
    </NextIntlClientProvider>
  )
}
