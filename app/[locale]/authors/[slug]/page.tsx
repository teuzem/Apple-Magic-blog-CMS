import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import AuthorHeader from '@/components/authors/AuthorHeader'
import AuthorReviews from '@/components/authors/AuthorReviews'
import JsonLd from '@/components/seo/JsonLd'
import {
  breadcrumbSchema,
  personSchema,
  websiteSchema,
} from '@/components/seo/schema'
import { PostCard } from '@/components/ui/PostCard'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SITE } from '@/lib/constants'
import { safeSanityFetch } from '@/lib/safeSanity'
import { isConfigured } from '@/lib/sanity.api'
import {
  getAuthorBySlug,
  getClient,
  getPostsByAuthor,
} from '@/lib/sanity.client'
import type { Author, Post } from '@/lib/sanity.queries'
import { normalizeSocial } from '@/lib/social'

const locales = ['en', 'fr']
const siteUrl = SITE.url.replace(/\/$/, '')

interface AuthorPageProps {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateStaticParams() {
  if (!isConfigured) return []
  try {
    const { safeSanityFetch } = await import('@/lib/safeSanity')
    const { getAuthors } = await import('@/lib/sanity.client')
    const { getClient } = await import('@/lib/sanity.client')
    const client = getClient()
    const rows = await safeSanityFetch((c) => getAuthors(c), [] as Author[])
    const slugs = (rows || []).map((r) => r.slug).filter(Boolean) as string[]
    return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
  } catch (error) {
    return []
  }
}

export async function generateMetadata({
  params,
}: AuthorPageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const safeLocale = locales.includes(locale) ? locale : 'en'
  const author = await safeSanityFetch(
    (c) => getAuthorBySlug(c, slug),
    null as Author | null,
  )
  if (!author) return {}
  return {
    title: author.name,
    description: author.longBio || author.bio || author.headline || undefined,
    alternates: {
      canonical: `${siteUrl}/${safeLocale}/authors/${slug}`,
      languages: {
        en: `${siteUrl}/en/authors/${slug}`,
        fr: `${siteUrl}/fr/authors/${slug}`,
        'x-default': `${siteUrl}/en/authors/${slug}`,
      },
    },
  }
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { locale, slug } = await params
  const safeLocale = locales.includes(locale) ? locale : 'en'
  setRequestLocale(safeLocale)
  const t = await getTranslations({ locale: safeLocale, namespace: 'author' })

  if (!isConfigured) notFound()

  const [author, posts] = await Promise.all([
    safeSanityFetch((c) => getAuthorBySlug(c, slug), null as Author | null),
    safeSanityFetch((c) => getPostsByAuthor(c, slug), [] as Post[]),
  ])
  if (!author) notFound()

  const socials = normalizeSocial(author.social)

  return (
    <div className="mx-auto w-full max-w-[1320px] min-w-0 px-4 pt-10 pb-14 sm:px-6 sm:pt-14 sm:pb-20 lg:px-8">
      <JsonLd
        data={[
          personSchema(
            author.name || slug,
            author.headline || author.role || '',
            (author.picture as any) || null,
            socials.map((s) => s.url).filter(Boolean) as string[],
            safeLocale,
          ),
          breadcrumbSchema(
            [{ name: author.name || slug, path: `/authors/${slug}` }],
            safeLocale,
          ),
          websiteSchema(safeLocale),
        ]}
      />

      <AuthorHeader author={author} locale={safeLocale} />
      <AuthorReviews authorSlug={slug} locale={safeLocale} />

      <div className="mt-12">
        <SectionHeader
          eyebrow={t('articlesEyebrow')}
          title={t('articlesTitle')}
          className="mb-6"
        />
        {posts.length === 0 ? (
          <p className="py-12 text-center text-gray-3 dark:text-gray-4">
            {t('noArticles')}
          </p>
        ) : (
          <div className="grid min-w-0 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {posts.map((post, i) => (
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
    </div>
  )
}
