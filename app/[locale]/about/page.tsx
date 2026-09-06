import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import ContentPage from '@/components/pages/ContentPage'
import ContentSections from '@/components/pages/ContentSections'
import JsonLd from '@/components/seo/JsonLd'
import { breadcrumbSchema } from '@/components/seo/schema'
import { NewsletterForm } from '@/components/ui/NewsletterForm'
import { SITE } from '@/lib/constants'

const locales = ['en', 'fr']

interface AboutPageProps {
  params: Promise<{ locale: string }>
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const { locale } = await params
  const safeLocale = locale === 'fr' ? 'fr' : 'en'
  const t = await getTranslations({
    locale: safeLocale,
    namespace: 'pages.about',
  })
  return {
    title: t('title'),
    description: t('intro'),
    alternates: {
      canonical: `${SITE.url}/${safeLocale}/about`,
      languages: {
        en: `${SITE.url}/en/about`,
        fr: `${SITE.url}/fr/about`,
        'x-default': `${SITE.url}/en/about`,
      },
    },
  }
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params
  const safeLocale = locales.includes(locale) ? locale : 'en'
  setRequestLocale(safeLocale)
  const t = await getTranslations({
    locale: safeLocale,
    namespace: 'pages.about',
  })
  const footer = await getTranslations({
    locale: safeLocale,
    namespace: 'footer',
  })

  const sections = t.raw('sections') as {
    heading?: string
    body?: string[]
    bullets?: string[]
  }[]

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(
          [{ name: t('title'), path: `/${safeLocale}/about` }],
          safeLocale,
        )}
      />
      <ContentPage
        eyebrow={t('eyebrow')}
        title={t('title')}
        intro={t('intro')}
        lastUpdated={t('lastUpdated')}
      >
        <ContentSections sections={sections} />

        <div
          id="newsletter"
          className="mt-14 scroll-mt-24 rounded-xl bg-gray-8 p-8 dark:bg-gray-1"
        >
          <h2 className="text-xl font-semibold text-ink dark:text-white">
            {footer('subscribe')}
          </h2>
          <p className="mt-2 text-[0.9375rem] text-gray-3 dark:text-gray-4">
            {t.raw('newsletterHook') as string}
          </p>
          <div className="mt-6">
            <NewsletterForm />
          </div>
        </div>
      </ContentPage>
    </>
  )
}
