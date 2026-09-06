import { ArrowUpRight, UserRound } from 'lucide-react'
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'

import SanityImage from '@/components/sanity/SanityImage'
import JsonLd from '@/components/seo/JsonLd'
import { collectionPageSchema, websiteSchema } from '@/components/seo/schema'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Link } from '@/i18n/navigation'
import { SITE } from '@/lib/constants'
import { safeSanityFetch } from '@/lib/safeSanity'
import { isConfigured } from '@/lib/sanity.api'
import { getAuthors } from '@/lib/sanity.client'
import type { Author } from '@/lib/sanity.queries'

const locales = ['en', 'fr']
const siteUrl = SITE.url.replace(/\/$/, '')

interface AuthorsPageProps {
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: AuthorsPageProps): Promise<Metadata> {
  const { locale } = await params
  const safeLocale = locale === 'fr' ? 'fr' : 'en'
  const title = safeLocale === 'fr' ? 'Notre rédaction' : 'Our editorial team'
  const description =
    safeLocale === 'fr'
      ? 'Découvrez les auteurs, journalistes et experts qui publient sur Apple Magic Blog.'
      : 'Meet the authors, journalists and experts publishing on Apple Magic Blog.'
  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/${safeLocale}/authors`,
      languages: {
        en: `${siteUrl}/en/authors`,
        fr: `${siteUrl}/fr/authors`,
        'x-default': `${siteUrl}/en/authors`,
      },
    },
  }
}

export default async function AuthorsPage({ params }: AuthorsPageProps) {
  const { locale } = await params
  const safeLocale = locale === 'fr' ? 'fr' : 'en'
  setRequestLocale(safeLocale)
  const authors = isConfigured
    ? await safeSanityFetch((client) => getAuthors(client), [] as Author[])
    : []
  const title = safeLocale === 'fr' ? 'Notre rédaction' : 'Our editorial team'
  const description =
    safeLocale === 'fr'
      ? 'Des profils transparents pour identifier les personnes responsables de nos reportages, tests et guides.'
      : 'Transparent profiles for the people responsible for our reporting, reviews and guides.'

  return (
    <div className="mx-auto w-full max-w-[1320px] min-w-0 px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-14 lg:px-8">
      <JsonLd
        data={[
          collectionPageSchema(title, description, safeLocale),
          websiteSchema(safeLocale),
        ]}
      />
      <SectionHeader
        eyebrow={safeLocale === 'fr' ? 'À propos' : 'About'}
        title={title}
        subtitle={description}
        align="center"
        className="mb-10 sm:mb-14"
      />

      {authors.length === 0 ? (
        <div className="mx-auto max-w-xl rounded-md border border-gray-7 px-6 py-14 text-center dark:border-gray-2">
          <UserRound className="mx-auto mb-4 text-gray-4" size={30} />
          <p className="text-gray-3 dark:text-gray-4">
            {safeLocale === 'fr'
              ? 'Les profils de la rédaction seront bientôt disponibles.'
              : 'Editorial profiles will be available soon.'}
          </p>
        </div>
      ) : (
        <div className="grid min-w-0 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {authors.map((author) => (
            <Link
              key={author._id || author.slug || author.name}
              href={`/authors/${author.slug}` as any}
              className="group flex min-w-0 items-center gap-4 rounded-md border border-gray-7 bg-white p-5 transition-colors hover:border-apple-blue/40 dark:border-gray-2 dark:bg-gray-1"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-gray-7 dark:bg-gray-2">
                {author.picture ? (
                  <SanityImage
                    asset={author.picture}
                    alt={author.name || ''}
                    fill
                    rounded={false}
                    sizes="80px"
                  />
                ) : (
                  <UserRound className="m-5 text-gray-4" size={40} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="break-words text-lg font-semibold text-ink dark:text-white">
                  {author.name}
                </h2>
                <p className="mt-1 line-clamp-2 text-sm text-gray-3 dark:text-gray-4">
                  {author.headline || author.role}
                </p>
              </div>
              <ArrowUpRight
                aria-hidden="true"
                className="shrink-0 text-gray-4 transition-colors group-hover:text-apple-blue"
                size={18}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
