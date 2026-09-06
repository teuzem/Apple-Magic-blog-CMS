import { ArrowLeft, ArrowRight, ChevronRight, Rss } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import JsonLd from '@/components/seo/JsonLd'
import {
  breadcrumbSchema,
  collectionPageSchema,
  websiteSchema,
} from '@/components/seo/schema'
import { PostCard } from '@/components/ui/PostCard'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Link } from '@/i18n/navigation'
import { SITE } from '@/lib/constants'
import { safeSanityFetch } from '@/lib/safeSanity'
import { isConfigured } from '@/lib/sanity.api'
import {
  getCategories,
  getCategoryBySlug,
  getClient,
  getPostsByCategory,
} from '@/lib/sanity.client'
import {
  type Category,
  getLocalizedCategory,
  type Post,
} from '@/lib/sanity.queries'

const locales = ['en', 'fr']
const siteUrl = SITE.url.replace(/\/$/, '')
const PER_PAGE = 12

interface CategoryPageProps {
  params: Promise<{ locale: string; slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateStaticParams() {
  if (!isConfigured) return []
  try {
    const rows = await getCategories(getClient())
    const slugs = rows
      .map((category) => category.slug)
      .filter(Boolean) as string[]
    return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
  searchParams,
}: CategoryPageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const { page: pageValue } = await searchParams
  const safeLocale = locales.includes(locale) ? locale : 'en'
  const page = Math.max(1, Number.parseInt(pageValue || '1', 10) || 1)
  const category = await safeSanityFetch(
    (client) => getCategoryBySlug(client, slug),
    null as Category | null,
  )
  if (!category) return {}
  const localized = getLocalizedCategory(category, safeLocale)
  const pageSuffix =
    page > 1
      ? safeLocale === 'fr'
        ? ` - page ${page}`
        : ` - page ${page}`
      : ''
  const canonical =
    page === 1
      ? `${siteUrl}/${safeLocale}/categories/${slug}`
      : `${siteUrl}/${safeLocale}/categories/${slug}?page=${page}`

  return {
    title: `${localized.seoTitle || localized.title}${pageSuffix}`,
    description: localized.seoDescription || localized.description,
    alternates: {
      canonical,
      languages: {
        en: `${siteUrl}/en/categories/${slug}${page > 1 ? `?page=${page}` : ''}`,
        fr: `${siteUrl}/fr/categories/${slug}${page > 1 ? `?page=${page}` : ''}`,
        'x-default': `${siteUrl}/en/categories/${slug}${page > 1 ? `?page=${page}` : ''}`,
      },
      types: {
        'application/rss+xml': `${siteUrl}/api/feed/${safeLocale}/category/${slug}`,
      },
    },
    openGraph: {
      title: localized.seoTitle || localized.title,
      description: localized.seoDescription || localized.description,
      type: 'website',
      url: canonical,
      images: category.image
        ? [
            {
              url: `${siteUrl}/api/og?title=${encodeURIComponent(localized.title)}&category=${encodeURIComponent(localized.title)}&type=category`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: localized.seoTitle || localized.title,
      description: localized.seoDescription || localized.description,
    },
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { locale, slug } = await params
  const { page: pageValue } = await searchParams
  const safeLocale = locales.includes(locale) ? locale : 'en'
  const requestedPage = Math.max(1, Number.parseInt(pageValue || '1', 10) || 1)
  setRequestLocale(safeLocale)
  const t = await getTranslations({ locale: safeLocale, namespace: 'category' })

  if (!isConfigured) notFound()

  const category = await safeSanityFetch(
    (client) => getCategoryBySlug(client, slug),
    null as Category | null,
  )
  if (!category) notFound()

  const total = category.articleCount || 0
  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE))
  if (requestedPage > pageCount && total > 0) notFound()
  const currentPage = Math.min(requestedPage, pageCount)
  const start = (currentPage - 1) * PER_PAGE
  const posts = await safeSanityFetch(
    (client) => getPostsByCategory(client, slug, start, start + PER_PAGE - 1),
    [] as Post[],
  )
  const localized = getLocalizedCategory(category, safeLocale)
  const children = category.subcategories || []
  const pageHref = (page: number) =>
    page <= 1 ? `/categories/${slug}` : `/categories/${slug}?page=${page}`

  return (
    <div className="mx-auto w-full max-w-[1440px] min-w-0 px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-14 lg:px-8">
      <JsonLd
        data={[
          collectionPageSchema(
            localized.title || slug,
            localized.description,
            safeLocale,
          ),
          breadcrumbSchema(
            [
              {
                name: safeLocale === 'fr' ? 'Catégories' : 'Categories',
                path: '/categories',
              },
              ...(category.parent?.slug
                ? [
                    {
                      name:
                        safeLocale === 'fr'
                          ? category.parent.titleFr ||
                            category.parent.title ||
                            category.parent.slug
                          : category.parent.title || category.parent.slug,
                      path: `/categories/${category.parent.slug}`,
                    },
                  ]
                : []),
              {
                name: localized.title || slug,
                path: `/categories/${slug}`,
              },
            ],
            safeLocale,
          ),
          websiteSchema(safeLocale),
        ]}
      />

      <nav
        aria-label={safeLocale === 'fr' ? 'Fil d’Ariane' : 'Breadcrumb'}
        className="mb-7 flex flex-wrap items-center justify-center gap-2 text-sm sm:justify-start"
      >
        <Link
          href="/categories"
          className="text-gray-3 transition-colors hover:text-apple-blue dark:text-gray-4"
        >
          {safeLocale === 'fr' ? 'Catégories' : 'Categories'}
        </Link>
        {category.parent?.slug && (
          <>
            <ChevronRight size={14} className="text-gray-4" />
            <Link
              href={`/categories/${category.parent.slug}` as any}
              className="text-gray-3 transition-colors hover:text-apple-blue dark:text-gray-4"
            >
              {safeLocale === 'fr'
                ? category.parent.titleFr || category.parent.title
                : category.parent.title}
            </Link>
          </>
        )}
        <ChevronRight size={14} className="text-gray-4" />
        <span className="font-medium text-ink dark:text-white">
          {localized.title || slug}
        </span>
      </nav>

      <header className="mb-10 border-b border-gray-7 pb-8 dark:border-gray-2">
        <SectionHeader
          eyebrow={`${total} ${t('articles')}`}
          title={localized.title || slug}
          subtitle={localized.description}
          className="mb-5"
        />
        <a
          href={`/api/feed/${safeLocale}/category/${slug}`}
          className="mx-auto inline-flex items-center gap-2 rounded-full border border-gray-6 px-4 py-2 text-sm font-medium text-gray-2 transition-colors hover:border-apple-blue hover:text-apple-blue sm:mx-0 dark:border-gray-3 dark:text-gray-5"
        >
          <Rss size={16} />
          {safeLocale === 'fr'
            ? 'Flux RSS de la catégorie'
            : 'Category RSS feed'}
        </a>
      </header>

      {children.length > 0 && (
        <section className="mb-10" aria-labelledby="subcategories-title">
          <h2
            id="subcategories-title"
            className="mb-4 text-center text-lg font-semibold text-ink sm:text-left dark:text-white"
          >
            {t('subcategories')}
          </h2>
          <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
            {children.map((child) => {
              const childTitle =
                safeLocale === 'fr' ? child.titleFr || child.title : child.title
              return (
                <Link
                  key={child._id}
                  href={`/categories/${child.slug}` as any}
                  className="rounded-full border border-gray-6 px-4 py-2 text-sm font-medium text-gray-2 transition-colors hover:border-apple-blue hover:text-apple-blue dark:border-gray-3 dark:text-gray-5"
                >
                  {childTitle}
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {posts.length === 0 ? (
        <section className="rounded-lg border border-gray-7 px-6 py-16 text-center dark:border-gray-2">
          <h2 className="text-xl font-semibold text-ink dark:text-white">
            {safeLocale === 'fr'
              ? 'Aucun article publié pour le moment'
              : 'No articles published yet'}
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-gray-3 dark:text-gray-4">
            {safeLocale === 'fr'
              ? 'Cette catégorie est prête. Les nouveaux articles apparaîtront automatiquement après leur publication dans Sanity.'
              : 'This category is ready. New articles will appear automatically after they are published in Sanity.'}
          </p>
          <Link
            href="/posts"
            className="mt-6 inline-flex rounded-full bg-apple-blue px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            {safeLocale === 'fr'
              ? 'Voir tous les articles'
              : 'Browse all articles'}
          </Link>
        </section>
      ) : (
        <section aria-label={t('allArticles')}>
          <div className="grid min-w-0 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {posts.map((post, index) => (
              <PostCard
                key={post._id}
                post={post}
                index={index}
                locale={safeLocale}
                priority={index < 3}
              />
            ))}
          </div>
        </section>
      )}

      {pageCount > 1 && (
        <nav
          aria-label={
            safeLocale === 'fr'
              ? 'Pagination des articles'
              : 'Article pagination'
          }
          className="mt-12 flex min-h-11 flex-wrap items-center justify-between gap-4 border-t border-gray-7 pt-6 dark:border-gray-2"
        >
          {currentPage > 1 ? (
            <Link
              href={pageHref(currentPage - 1) as any}
              rel="prev"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-gray-6 px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-apple-blue hover:text-apple-blue dark:border-gray-3 dark:text-white"
            >
              <ArrowLeft size={16} />
              {safeLocale === 'fr' ? 'Précédents' : 'Previous'}
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm text-gray-3 dark:text-gray-4">
            {safeLocale === 'fr'
              ? `Page ${currentPage} sur ${pageCount}`
              : `Page ${currentPage} of ${pageCount}`}
          </span>
          {currentPage < pageCount ? (
            <Link
              href={pageHref(currentPage + 1) as any}
              rel="next"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-gray-6 px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-apple-blue hover:text-apple-blue dark:border-gray-3 dark:text-white"
            >
              {safeLocale === 'fr' ? 'Suivants' : 'Next'}
              <ArrowRight size={16} />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  )
}
