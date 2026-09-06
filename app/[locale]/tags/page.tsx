import { Hash } from 'lucide-react'
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'

import JsonLd from '@/components/seo/JsonLd'
import { collectionPageSchema, websiteSchema } from '@/components/seo/schema'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Link } from '@/i18n/navigation'
import { SITE } from '@/lib/constants'
import { safeSanityFetch } from '@/lib/safeSanity'
import { isConfigured } from '@/lib/sanity.api'
import { getAllTags } from '@/lib/sanity.client'
import type { Tag } from '@/lib/sanity.queries'

const locales = ['en', 'fr']
const siteUrl = SITE.url.replace(/\/$/, '')

interface TagsPageProps {
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: TagsPageProps): Promise<Metadata> {
  const { locale } = await params
  const safeLocale = locale === 'fr' ? 'fr' : 'en'
  const title = safeLocale === 'fr' ? 'Tous les sujets' : 'All topics'
  const description =
    safeLocale === 'fr'
      ? 'Explorez les articles Apple par sujet, technologie, produit et fonctionnalité.'
      : 'Explore Apple articles by topic, technology, product and feature.'
  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/${safeLocale}/tags`,
      languages: {
        en: `${siteUrl}/en/tags`,
        fr: `${siteUrl}/fr/tags`,
        'x-default': `${siteUrl}/en/tags`,
      },
    },
  }
}

export default async function TagsPage({ params }: TagsPageProps) {
  const { locale } = await params
  const safeLocale = locale === 'fr' ? 'fr' : 'en'
  setRequestLocale(safeLocale)
  const tags = isConfigured
    ? await safeSanityFetch((client) => getAllTags(client), [] as Tag[])
    : []
  const title = safeLocale === 'fr' ? 'Tous les sujets' : 'All topics'
  const description =
    safeLocale === 'fr'
      ? 'Trouvez rapidement les dossiers et articles liés à un thème précis.'
      : 'Quickly find coverage and articles connected to a specific topic.'

  return (
    <div className="mx-auto w-full max-w-[1100px] min-w-0 px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-14 lg:px-8">
      <JsonLd
        data={[
          collectionPageSchema(title, description, safeLocale),
          websiteSchema(safeLocale),
        ]}
      />
      <SectionHeader
        eyebrow={safeLocale === 'fr' ? 'Index' : 'Index'}
        title={title}
        subtitle={description}
        align="center"
        className="mb-10 sm:mb-14"
      />

      {tags.length === 0 ? (
        <div className="rounded-md border border-gray-7 px-6 py-14 text-center dark:border-gray-2">
          <Hash className="mx-auto mb-4 text-gray-4" size={30} />
          <p className="text-gray-3 dark:text-gray-4">
            {safeLocale === 'fr'
              ? 'Les sujets seront affichés dès la publication des articles.'
              : 'Topics will appear as articles are published.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-3">
          {tags.map((tag) => (
            <Link
              key={tag._id}
              href={`/tags/${tag.slug}` as any}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-gray-6 bg-white px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-apple-blue hover:text-apple-blue dark:border-gray-2 dark:bg-gray-1 dark:text-white"
            >
              <Hash size={15} />
              {tag.title}
              <span className="text-xs text-gray-4">
                {tag.articleCount || 0}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
