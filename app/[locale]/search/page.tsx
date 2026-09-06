import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { PostCard } from '@/components/ui/PostCard'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { safeSanityFetch } from '@/lib/safeSanity'
import { isConfigured } from '@/lib/sanity.api'
import { getLatestPosts } from '@/lib/sanity.client'
import type { Post } from '@/lib/sanity.queries'

import SearchPageClient from './SearchPageClient'

const locales = ['en', 'fr']

export const metadata: Metadata = {
  robots: { index: false, follow: true },
}

interface SearchPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string }>
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function SearchPage({
  params,
  searchParams,
}: SearchPageProps) {
  const { locale } = await params
  const safeLocale = locales.includes(locale) ? locale : 'en'
  setRequestLocale(safeLocale)
  const t = await getTranslations({ locale: safeLocale, namespace: 'search' })
  const { q } = await searchParams

  // Default suggestions when no server-side results
  const recent = isConfigured
    ? await safeSanityFetch((c) => getLatestPosts(c), [] as Post[])
    : ([] as Post[])

  return (
    <div className="mx-auto w-full max-w-[1320px] min-w-0 px-4 pt-10 pb-14 sm:px-6 sm:pt-14 sm:pb-20 lg:px-8">
      <SectionHeader eyebrow="Search" title={t('title')} className="mb-6" />
      <p className="mb-8 break-words text-center text-gray-3 sm:text-left dark:text-gray-4">
        {t('placeholder')}
      </p>

      <SearchPageClient initialQuery={q || ''} />

      {recent.length > 0 && !q && (
        <div className="mt-14">
          <h2 className="mb-6 text-xl font-bold tracking-tight text-ink dark:text-white">
            Recently published
          </h2>
          <div className="grid min-w-0 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {recent.slice(0, 3).map((post, i) => (
              <PostCard
                key={post._id}
                post={post}
                index={i}
                locale={safeLocale}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
