import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'

import { SectionHeader } from '@/components/ui/SectionHeader'
import { SITE } from '@/lib/constants'
import { safeSanityFetch } from '@/lib/safeSanity'
import { isConfigured } from '@/lib/sanity.api'
import { getAllPosts, getCategories } from '@/lib/sanity.client'
import type { Category, Post } from '@/lib/sanity.queries'

import PostsListClient from './PostsListClient'

const locales = ['en', 'fr']

interface PostsPageProps {
  params: Promise<{ locale: string }>
}

const siteUrl = SITE.url.replace(/\/$/, '')

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: PostsPageProps): Promise<Metadata> {
  const { locale } = await params
  const safeLocale = locales.includes(locale) ? locale : 'en'
  const title =
    safeLocale === 'fr' ? 'Tous les articles Apple' : 'All Apple articles'
  const description =
    safeLocale === 'fr'
      ? 'Toutes nos actualités Apple, analyses, tests, comparatifs, tutoriels et guides d’achat.'
      : 'All our Apple news, analysis, reviews, comparisons, tutorials and buying guides.'
  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/${safeLocale}/posts`,
      languages: {
        en: `${siteUrl}/en/posts`,
        fr: `${siteUrl}/fr/posts`,
        'x-default': `${siteUrl}/en/posts`,
      },
      types: {
        'application/rss+xml': `${siteUrl}/api/feed/${safeLocale}`,
        'application/atom+xml': `${siteUrl}/api/feed/${safeLocale}/atom`,
        'application/feed+json': `${siteUrl}/api/feed/${safeLocale}/json`,
      },
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${siteUrl}/${safeLocale}/posts`,
    },
  }
}

export default async function PostsPage({ params }: PostsPageProps) {
  const { locale } = await params
  const safeLocale = locales.includes(locale) ? locale : 'en'
  setRequestLocale(safeLocale)

  let allPosts: Post[] = []
  let categories: Category[] = []
  if (isConfigured) {
    ;[allPosts, categories] = await Promise.all([
      safeSanityFetch((c) => getAllPosts(c), [] as Post[]),
      safeSanityFetch((c) => getCategories(c), [] as Category[]),
    ])
  }

  return (
    <div className="mx-auto w-full max-w-[1320px] min-w-0 px-4 pt-10 pb-14 sm:px-6 sm:pt-14 sm:pb-20 lg:px-8">
      <SectionHeader
        eyebrow={safeLocale === 'fr' ? 'Éditorial' : 'Editorial'}
        title={safeLocale === 'fr' ? 'Tous les articles' : 'All articles'}
        subtitle={
          safeLocale === 'fr'
            ? 'Actualités, analyses, tests et guides pratiques pour tout l’écosystème Apple.'
            : 'News, analysis, reviews and practical guides across the Apple ecosystem.'
        }
        className="mb-8"
      />

      {allPosts.length === 0 ? (
        <p className="py-12 text-center text-gray-3 dark:text-gray-4">
          {safeLocale === 'fr'
            ? 'Aucun article publié pour le moment.'
            : 'No articles published yet.'}
        </p>
      ) : (
        <PostsListClient
          posts={allPosts}
          categories={categories}
          locale={safeLocale}
        />
      )}
    </div>
  )
}
