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
import { SITE } from '@/lib/constants'
import { safeSanityFetch } from '@/lib/safeSanity'
import { isConfigured } from '@/lib/sanity.api'
import { getAllTags, getClient, getPostsByTag } from '@/lib/sanity.client'
import type { Post, Tag } from '@/lib/sanity.queries'

const locales = ['en', 'fr']
const siteUrl = SITE.url.replace(/\/$/, '')

interface TagPageProps {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateStaticParams() {
  if (!isConfigured) return []
  try {
    const client = getClient()
    const tags = await getAllTags(client)
    const slugs = (tags || []).map((t) => t.slug).filter(Boolean) as string[]
    return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
  } catch (error) {
    return []
  }
}

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const safeLocale = locales.includes(locale) ? locale : 'en'
  const tag = await findTag(slug)
  if (!tag) return {}
  return {
    title: `#${tag.title || slug}`,
    alternates: {
      canonical: `${siteUrl}/${safeLocale}/tags/${slug}`,
      languages: {
        en: `${siteUrl}/en/tags/${slug}`,
        fr: `${siteUrl}/fr/tags/${slug}`,
        'x-default': `${siteUrl}/en/tags/${slug}`,
      },
    },
  }
}

export default async function TagPage({ params }: TagPageProps) {
  const { locale, slug } = await params
  const safeLocale = locales.includes(locale) ? locale : 'en'
  setRequestLocale(safeLocale)
  const t = await getTranslations({ locale: safeLocale, namespace: 'tag' })

  if (!isConfigured) notFound()

  const tag = await findTag(slug)
  if (!tag) notFound()

  const posts = await safeSanityFetch(
    (c) => getPostsByTag(c, tag._id, 0, 20),
    [] as Post[],
  )

  return (
    <div className="mx-auto w-full max-w-[1320px] min-w-0 px-4 pt-10 pb-14 sm:px-6 sm:pt-14 sm:pb-20 lg:px-8">
      <JsonLd
        data={[
          collectionPageSchema(
            `#${tag.title || slug}`,
            `All articles tagged ${tag.title}`,
            safeLocale,
          ),
          breadcrumbSchema(
            [{ name: tag.title || slug, path: `/tags/${slug}` }],
            safeLocale,
          ),
          websiteSchema(safeLocale),
        ]}
      />
      <SectionHeader
        eyebrow={t('articles')}
        title={`#${tag.title || slug}`}
        className="mb-8"
      />

      {posts.length === 0 ? (
        <p className="py-12 text-center text-gray-3 dark:text-gray-4">
          {t('notFound')}
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
  )
}

async function findTag(slug: string): Promise<Tag | null> {
  if (!isConfigured) return null
  try {
    const client = getClient()
    const tags = await getAllTags(client)
    return (tags || []).find((t) => t.slug === slug) || null
  } catch (error) {
    return null
  }
}
