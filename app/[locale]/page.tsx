import { getTranslations, setRequestLocale } from 'next-intl/server'

import { StarSparkle } from '@/components/brand/StarSparkle'
import { CategoryNav } from '@/components/ui/CategoryNav'
import { FeaturedStory } from '@/components/ui/FeaturedStory'
import { HeroSection } from '@/components/ui/HeroSection'
import { NewsletterForm } from '@/components/ui/NewsletterForm'
import { PostCard } from '@/components/ui/PostCard'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { safeSanityFetch } from '@/lib/safeSanity'
import {
  getCategories,
  getFeaturedPost,
  getLatestPosts,
  getTrendingPosts,
} from '@/lib/sanity.client'
import type { Category, Post } from '@/lib/sanity.queries'

const locales = ['en', 'fr']

interface HomePageProps {
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params
  const safeLocale = locales.includes(locale) ? locale : 'en'
  setRequestLocale(safeLocale)
  const t = await getTranslations({ locale: safeLocale, namespace: 'home' })

  const [categories, featuredPost, latestPosts, trendingPosts] =
    await Promise.all([
      safeSanityFetch((c) => getCategories(c), [] as Category[]),
      safeSanityFetch((c) => getFeaturedPost(c), null as Post | null),
      safeSanityFetch((c) => getLatestPosts(c), [] as Post[]),
      safeSanityFetch((c) => getTrendingPosts(c), [] as Post[]),
    ])

  const heroPost = featuredPost ?? latestPosts[0] ?? null
  const remainingLatest = (
    heroPost ? latestPosts.filter((p) => p._id !== heroPost._id) : latestPosts
  ).slice(0, 8)

  return (
    <div className="min-w-0 overflow-x-clip pt-12">
      <HeroSection />

      {/* Featured story */}
      {heroPost && (
        <section className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow={t('featured')}
            title={heroPost.title || ''}
            align="left"
            className="mb-4"
          />
          <FeaturedStory post={heroPost} locale={safeLocale} />
        </section>
      )}

      {/* Category navigation */}
      <section className="mx-auto w-full max-w-[1320px] px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <SectionHeader eyebrow="Explore" title={t('exploreCategories')} />
        <CategoryNav categories={categories} />
      </section>

      {/* Latest articles grid */}
      <section className="bg-gray-8 py-16 dark:bg-black">
        <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <SectionHeader
              eyebrow="Editorial"
              title={t('latest')}
              className="mb-0"
            />
          </div>
          {remainingLatest.length === 0 ? (
            <p className="py-12 text-center text-gray-3">
              No articles published yet. Connect your Sanity dataset to get
              started.
            </p>
          ) : (
            <div className="mt-8 grid min-w-0 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6">
              {remainingLatest.map((post, i) => (
                <PostCard
                  key={post._id}
                  post={post}
                  index={i}
                  locale={safeLocale}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trending */}
      {trendingPosts.length > 0 && (
        <section className="mx-auto w-full max-w-[1320px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <SectionHeader eyebrow="Popular" title={t('trending')} />
          <div className="grid min-w-0 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6">
            {trendingPosts.map((post, i) => (
              <PostCard
                key={post._id}
                post={post}
                index={i}
                locale={safeLocale}
              />
            ))}
          </div>
        </section>
      )}

      {/* Newsletter CTA */}
      <section className="relative overflow-hidden bg-ink py-20 text-center dark:bg-gray-1">
        <div className="pointer-events-none absolute inset-0 bg-apple-hero opacity-60" />
        <StarSparkle
          size={26}
          className="absolute left-[15%] top-8 text-magic-purple/70"
        />
        <StarSparkle
          size={18}
          className="absolute right-[18%] top-14 text-magic-blue/70 [animation-delay:-1s]"
        />
        <div className="relative mx-auto w-full max-w-2xl px-4 sm:px-6">
          <h2 className="text-[1.75rem] font-bold leading-tight tracking-tight text-white sm:text-4xl">
            {t('newsletterTitle')}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[0.9375rem] leading-relaxed text-white/70">
            {t('newsletterSubtitle')}
          </p>
          <div className="mt-8 flex justify-center">
            <NewsletterForm className="mx-auto" />
          </div>
        </div>
      </section>
    </div>
  )
}
