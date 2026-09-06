import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import ContactForm from '@/components/pages/ContactForm'
import ContentPage from '@/components/pages/ContentPage'
import ContentSections from '@/components/pages/ContentSections'
import JsonLd from '@/components/seo/JsonLd'
import { breadcrumbSchema } from '@/components/seo/schema'
import { SITE } from '@/lib/constants'

const locales = ['en', 'fr']

const slugToNamespace: Record<string, string> = {
  privacy: 'pages.privacy',
  terms: 'pages.terms',
  'editorial-policy': 'pages.editorial',
  contact: 'pages.contact',
}

interface LegacyPageProps {
  params: Promise<{ locale: string; slug: string }>
}

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    Object.keys(slugToNamespace).map((slug) => ({ locale, slug })),
  )
}

export async function generateMetadata({
  params,
}: LegacyPageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const safeLocale = locales.includes(locale) ? locale : 'en'
  const namespace = slugToNamespace[slug]
  if (!namespace) return {}
  const t = await getTranslations({ locale: safeLocale, namespace })
  return {
    title: t('title'),
    description: t('intro'),
    alternates: {
      canonical: `${SITE.url}/${safeLocale}/pages/${slug}`,
      languages: {
        en: `${SITE.url}/en/pages/${slug}`,
        fr: `${SITE.url}/fr/pages/${slug}`,
        'x-default': `${SITE.url}/en/pages/${slug}`,
      },
    },
  }
}

export default async function LegacyPage({ params }: LegacyPageProps) {
  const { locale, slug } = await params
  const safeLocale = locales.includes(locale) ? locale : 'en'
  setRequestLocale(safeLocale)

  const namespace = slugToNamespace[slug]
  if (!namespace) notFound()

  const t = await getTranslations({ locale: safeLocale, namespace })
  const sections = t.raw('sections') as {
    heading?: string
    body?: string[]
    bullets?: string[]
  }[]

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(
          [{ name: t('title'), path: `/${safeLocale}/pages/${slug}` }],
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
        {slug === 'contact' && (
          <div className="mt-12">
            <h2 className="mb-4 text-2xl font-bold tracking-tight text-ink dark:text-white">
              {t.raw('formTitle') as string}
            </h2>
            <ContactForm />
          </div>
        )}
      </ContentPage>
    </>
  )
}
