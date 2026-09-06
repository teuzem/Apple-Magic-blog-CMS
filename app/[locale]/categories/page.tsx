import { ArrowUpRight, BookOpen, ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import SanityImage from '@/components/sanity/SanityImage'
import JsonLd from '@/components/seo/JsonLd'
import { collectionPageSchema, websiteSchema } from '@/components/seo/schema'
import { Badge } from '@/components/ui/Badge'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Link } from '@/i18n/navigation'
import { SITE } from '@/lib/constants'
import { safeSanityFetch } from '@/lib/safeSanity'
import { isConfigured } from '@/lib/sanity.api'
import { getCategories } from '@/lib/sanity.client'
import { type Category, getLocalizedCategory } from '@/lib/sanity.queries'

const locales = ['en', 'fr']
const siteUrl = SITE.url.replace(/\/$/, '')

interface CategoriesPageProps {
  params: Promise<{ locale: string }>
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: CategoriesPageProps): Promise<Metadata> {
  const { locale } = await params
  const safeLocale = locales.includes(locale) ? locale : 'en'
  const title = safeLocale === 'fr' ? 'Catégories Apple' : 'Apple categories'
  const description =
    safeLocale === 'fr'
      ? 'Parcourez toutes les catégories Apple : iPhone, Mac, iPad, logiciels, tests et guides d’achat.'
      : 'Browse every Apple category: iPhone, Mac, iPad, software, reviews and buying guides.'
  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/${safeLocale}/categories`,
      languages: {
        en: `${siteUrl}/en/categories`,
        fr: `${siteUrl}/fr/categories`,
        'x-default': `${siteUrl}/en/categories`,
      },
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${siteUrl}/${safeLocale}/categories`,
    },
  }
}

export default async function CategoriesPage({ params }: CategoriesPageProps) {
  const { locale } = await params
  const safeLocale = locales.includes(locale) ? locale : 'en'
  setRequestLocale(safeLocale)
  const t = await getTranslations({ locale: safeLocale, namespace: 'category' })
  const categories = isConfigured
    ? await safeSanityFetch((client) => getCategories(client), [] as Category[])
    : []
  const visible = categories.filter((category) => !category.parent)
  const title =
    safeLocale === 'fr' ? 'Toutes les catégories' : 'Explore every category'
  const description =
    safeLocale === 'fr'
      ? 'Des actualités, analyses, tests et guides pratiques organisés par univers Apple.'
      : 'News, analysis, reviews and practical guides organised by Apple topic.'

  return (
    <div className="mx-auto w-full max-w-[1440px] min-w-0 px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-14 lg:px-8">
      <JsonLd
        data={[
          collectionPageSchema(title, description, safeLocale),
          websiteSchema(safeLocale),
        ]}
      />
      <SectionHeader
        eyebrow={safeLocale === 'fr' ? 'Explorer' : 'Explore'}
        title={title}
        subtitle={description}
        align="center"
        className="mb-10 sm:mb-14"
      />

      {visible.length === 0 ? (
        <div className="mx-auto max-w-xl rounded-lg border border-gray-7 px-6 py-14 text-center dark:border-gray-2">
          <BookOpen className="mx-auto mb-4 text-gray-4" size={30} />
          <p className="text-gray-3 dark:text-gray-4">{t('empty')}</p>
        </div>
      ) : (
        <div className="grid min-w-0 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((category, index) => {
            const children = category.subcategories || []
            const localized = getLocalizedCategory(category, safeLocale)
            return (
              <article
                key={category._id}
                className="group flex min-w-0 flex-col overflow-hidden rounded-md border border-gray-7 bg-white transition-colors hover:border-apple-blue/40 dark:border-gray-2 dark:bg-gray-1"
              >
                <Link
                  href={`/categories/${category.slug}` as any}
                  className="relative block"
                >
                  <div className="aspect-[16/8] w-full overflow-hidden bg-gray-7 dark:bg-gray-2">
                    {category.image ? (
                      <SanityImage
                        asset={category.image}
                        alt={localized.title || ''}
                        fill
                        rounded={false}
                        priority={index < 3}
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div
                        className="h-full w-full"
                        style={{
                          background: `linear-gradient(135deg, ${category.color || '#2997ff'} 0%, #111 100%)`,
                        }}
                      />
                    )}
                    <Badge
                      color={category.color}
                      className="absolute left-4 top-4"
                    >
                      {localized.title || category.slug}
                    </Badge>
                  </div>
                </Link>
                <div className="flex min-w-0 flex-1 flex-col gap-4 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="break-words text-xl font-semibold text-ink dark:text-white">
                        <Link href={`/categories/${category.slug}` as any}>
                          {localized.title || category.slug}
                        </Link>
                      </h2>
                      {localized.description && (
                        <p className="mt-2 line-clamp-3 break-words text-sm leading-relaxed text-gray-3 dark:text-gray-4">
                          {localized.description}
                        </p>
                      )}
                    </div>
                    <Link
                      href={`/categories/${category.slug}` as any}
                      aria-label={`${t('browse')} ${localized.title || category.slug}`}
                      className="shrink-0 rounded-full border border-gray-6 p-2 text-gray-2 transition-colors hover:border-apple-blue hover:text-apple-blue dark:border-gray-3 dark:text-gray-5"
                    >
                      <ArrowUpRight size={17} />
                    </Link>
                  </div>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-gray-7 pt-4 text-sm dark:border-gray-2">
                    <span className="text-gray-3 dark:text-gray-4">
                      {category.articleCount || 0} {t('articles')}
                    </span>
                    {children.length > 0 && (
                      <span className="text-gray-3 dark:text-gray-4">
                        {children.length} {t('subcategories').toLowerCase()}
                      </span>
                    )}
                  </div>
                  {children.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {children.slice(0, 4).map((child) => (
                        <Link
                          key={child._id}
                          href={`/categories/${child.slug}` as any}
                          className="inline-flex items-center gap-1 text-xs font-medium text-apple-blue hover:underline"
                        >
                          {safeLocale === 'fr'
                            ? child.titleFr || child.title
                            : child.title}
                          <ChevronRight size={12} />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
