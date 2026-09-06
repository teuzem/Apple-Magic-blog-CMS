import { Calendar, Clock, Tag, User } from 'lucide-react'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import ArticleSidebar from '@/components/article/ArticleSidebar'
import PortableTextRenderer from '@/components/blocks/PortableTextRenderer'
import { StarSparkle } from '@/components/brand/StarSparkle'
import SanityImage from '@/components/sanity/SanityImage'
import JsonLd from '@/components/seo/JsonLd'
import {
  articleSchema,
  breadcrumbSchema,
  faqPageSchema,
  websiteSchema,
} from '@/components/seo/schema'
import AuthorBox from '@/components/ui/AuthorBox'
import BackToTop from '@/components/ui/BackToTop'
import { Badge } from '@/components/ui/Badge'
import Comments from '@/components/ui/Comments'
import { PostCard } from '@/components/ui/PostCard'
import ReadingProgress from '@/components/ui/ReadingProgress'
import ShareButtons from '@/components/ui/ShareButtons'
import TableOfContents, {
  type TocHeading,
} from '@/components/ui/TableOfContents'
import { Link } from '@/i18n/navigation'
import { SITE } from '@/lib/constants'
import { safeSanityFetch } from '@/lib/safeSanity'
import { isConfigured, readToken } from '@/lib/sanity.api'
import {
  getAllPostsSlugs,
  getClient,
  getPostAndMoreStories,
  getPostBySlug,
} from '@/lib/sanity.client'
import { getLocalized, type Post } from '@/lib/sanity.queries'
import { formatDate } from '@/lib/utils'

const locales = ['en', 'fr']
const siteUrl = SITE.url.replace(/\/$/, '')

// Article content is edited in Sanity and must be read fresh so block changes
// are visible without waiting for a rebuild or stale route cache.
export const dynamic = 'force-dynamic'

interface PostPageProps {
  params: Promise<{ locale: string; slug: string }>
}

// SSG: pre-render all known post slugs for both locales
export async function generateStaticParams() {
  if (!isConfigured) return []
  try {
    const rows = await getAllPostsSlugs()
    const slugs = (rows || []).map((r) => r.slug).filter(Boolean) as string[]
    return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
  } catch (error) {
    return []
  }
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const safeLocale = locales.includes(locale) ? locale : 'en'

  const post = await safeSanityFetch(
    (c) => getPostBySlug(c, slug),
    null as Post | null,
  )
  if (!post) return {}

  const l = getLocalized(post, safeLocale)
  const url = `${siteUrl}/${safeLocale}/posts/${post.slug}`
  const ogUrl = `${siteUrl}/api/og?title=${encodeURIComponent(l.title || '')}&category=${encodeURIComponent(post.category?.title || '')}&type=article`

  return {
    title:
      safeLocale === 'fr'
        ? post.seoTitleFr || post.seoTitle || l.title
        : post.seoTitle || l.title,
    description:
      safeLocale === 'fr'
        ? post.seoDescriptionFr || post.seoDescription || l.excerpt
        : post.seoDescription || l.excerpt,
    keywords:
      post.seoKeywords ||
      post.tags
        ?.map((tag) => tag.title)
        .filter(Boolean)
        .join(', '),
    authors: [post.author, ...(post.coAuthors || [])]
      .filter((author) => author?.name)
      .map((author) => ({
        name: author?.name || SITE.name,
        url: author?.slug
          ? `${siteUrl}/${safeLocale}/authors/${author.slug}`
          : siteUrl,
      })),
    alternates: {
      canonical: url,
      languages: {
        en: `${siteUrl}/en/posts/${post.slug}`,
        fr: `${siteUrl}/fr/posts/${post.slug}`,
        'x-default': `${siteUrl}/en/posts/${post.slug}`,
      },
    },
    robots: post.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title:
        safeLocale === 'fr'
          ? post.seoTitleFr || post.seoTitle || l.title
          : post.seoTitle || l.title,
      description:
        safeLocale === 'fr'
          ? post.seoDescriptionFr || post.seoDescription || l.excerpt
          : post.seoDescription || l.excerpt,
      url,
      type: 'article',
      siteName: SITE.name,
      publishedTime: post.date,
      modifiedTime: post._updatedAt,
      authors: post.author?.name ? [post.author.name] : undefined,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: l.title }],
      locale: safeLocale === 'fr' ? 'fr_FR' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seoTitle || l.title,
      description: post.seoDescription || l.excerpt,
      images: [ogUrl],
    },
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { locale, slug } = await params
  const safeLocale = locales.includes(locale) ? locale : 'en'
  setRequestLocale(safeLocale)
  const t = await getTranslations({ locale: safeLocale, namespace: 'post' })
  const { isEnabled: isPreview } = await draftMode()
  const client =
    isPreview && readToken
      ? getClient({ token: readToken, perspective: 'drafts' })
      : getClient()

  if (!isConfigured) notFound()

  const data = await safeSanityFetch(
    (c) => getPostAndMoreStories(c, slug),
    {
      post: null as Post | null,
      morePosts: [] as Post[],
      articleSidebar: undefined,
      fallbackFeaturedPosts: [] as Post[],
      recentPosts: [] as Post[],
    },
    client,
  )

  const post = data?.post
  if (!post) notFound()

  const morePosts = (data?.morePosts || []).slice(0, 3)
  const url = `${siteUrl}/${safeLocale}/posts/${post.slug}`
  const cover = post.coverImage
  const l = getLocalized(post, safeLocale)
  const headings = extractHeadings(l.content)

  return (
    <article className="min-w-0 overflow-x-clip pt-14 sm:pt-16">
      <ReadingProgress />
      <JsonLd
        data={[
          articleSchema(post, safeLocale),
          breadcrumbSchema(
            [
              {
                name: post.category?.title || 'Blog',
                path: `/categories/${post.category?.slug}`,
              },
              { name: post.title || '', path: `/posts/${post.slug}` },
            ],
            safeLocale,
          ),
          websiteSchema(safeLocale),
          faqPageSchema(l.content, safeLocale),
        ].filter(Boolean)}
      />

      {/* Header */}
      <header className="mx-auto w-full max-w-[1040px] px-4 sm:px-8">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          {post.category?.title && (
            <Link href={`/categories/${post.category.slug}` as any}>
              <Badge color={post.category.color}>{post.category.title}</Badge>
            </Link>
          )}
        </div>
        <h1 className="mt-4 break-words text-center text-[2rem] leading-[1.08] font-bold tracking-tight text-ink sm:text-left sm:text-[2.75rem] dark:text-white">
          {l.title}
        </h1>
        {l.excerpt && (
          <p className="mt-4 break-words text-center text-[1rem] leading-relaxed text-gray-3 sm:text-left sm:text-[1.125rem] dark:text-gray-4">
            {l.excerpt}
          </p>
        )}

        {/* Meta row */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[0.8125rem] text-gray-3 sm:justify-start dark:text-gray-4">
          {post.author?.name && (
            <span className="inline-flex items-center gap-1.5">
              {post.author.picture ? (
                <SanityImage
                  asset={post.author.picture}
                  alt={post.author.name}
                  className="h-8 w-8 rounded-full"
                  width={48}
                  height={48}
                />
              ) : (
                <User size={14} />
              )}
              <span className="font-medium text-ink dark:text-white">
                {post.author.name}
              </span>
              {post.author.role && <span>· {post.author.role}</span>}
            </span>
          )}
          {post.date && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={13} /> {formatDate(post.date, safeLocale)}
            </span>
          )}
          {(post.updatedAt || post._updatedAt) && (
            <span className="inline-flex items-center gap-1.5">
              {safeLocale === 'fr' ? 'Mis à jour' : 'Updated'}{' '}
              {formatDate(post.updatedAt || post._updatedAt || '', safeLocale)}
            </span>
          )}
          {typeof post.readingTime === 'number' && (
            <span className="inline-flex items-center gap-1.5">
              <Clock size={13} />{' '}
              {t('readingTime', { count: post.readingTime })}
            </span>
          )}
          <StarSparkle size={14} className="text-magic-purple" />
        </div>
      </header>

      {/* Cover image */}
      {cover && (
        <div className="mx-auto mt-6 w-full max-w-[1500px] px-4 sm:mt-8 sm:px-8 xl:px-12">
          <div className="overflow-hidden rounded-xl">
            <SanityImage
              asset={cover}
              alt={l.title || ''}
              priority
              rounded={false}
              className="aspect-[16/9] w-full"
            />
          </div>
        </div>
      )}

      {/* Body */}
      <div className="mx-auto mt-5 w-full max-w-[1680px] px-4 sm:mt-6 sm:px-8 xl:grid xl:grid-cols-[minmax(340px,420px)_minmax(0,920px)] xl:justify-center xl:gap-12 xl:px-12 2xl:gap-16">
        <ArticleSidebar
          headings={headings}
          sidebar={data?.articleSidebar}
          fallbackFeaturedPosts={data?.fallbackFeaturedPosts || []}
          recentPosts={data?.recentPosts || []}
          locale={safeLocale}
        />

        <div className="min-w-0">
          {/* Table of contents (mobile, collapsible) */}
          <div className="xl:hidden">
            <TableOfContents headings={headings} variant="inline" />
          </div>

          {l.content ? (
            <PortableTextRenderer
              content={l.content}
              locale={safeLocale}
              productMentions={post.productMentions}
              postId={post._id}
              communityAverage={
                post.verdictVoteCount
                  ? (post.verdictVoteTotal || 0) / post.verdictVoteCount
                  : undefined
              }
              communityCount={post.verdictVoteCount}
            />
          ) : (
            <p className="text-gray-3">{t('notFound')}</p>
          )}

          {(post.correctionNote ||
            post.correctionNoteFr ||
            (post.sources && post.sources.length > 0)) && (
            <aside className="mt-10 space-y-5 border-y border-gray-6 py-6 dark:border-gray-2">
              {(post.correctionNote || post.correctionNoteFr) && (
                <div>
                  <h2 className="text-center text-lg font-semibold text-ink sm:text-left dark:text-white">
                    {safeLocale === 'fr'
                      ? 'Mise à jour éditoriale'
                      : 'Editorial update'}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-gray-2 dark:text-gray-8">
                    {safeLocale === 'fr'
                      ? post.correctionNoteFr || post.correctionNote
                      : post.correctionNote || post.correctionNoteFr}
                  </p>
                </div>
              )}
              {post.sources && post.sources.length > 0 && (
                <div>
                  <h2 className="text-center text-lg font-semibold text-ink sm:text-left dark:text-white">
                    {safeLocale === 'fr'
                      ? 'Sources principales'
                      : 'Primary sources'}
                  </h2>
                  <ul className="mt-3 space-y-2">
                    {post.sources.map((source) => (
                      <li
                        key={source._key || source.url}
                        className="text-sm leading-6"
                      >
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-apple-blue underline underline-offset-2"
                        >
                          {source.title || source.url}
                        </a>
                        {source.publisher ? ` · ${source.publisher}` : ''}
                        {source.accessedAt
                          ? ` · ${
                              safeLocale === 'fr' ? 'consulté le' : 'accessed'
                            } ${formatDate(source.accessedAt, safeLocale)}`
                          : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-gray-7 pt-6 dark:border-gray-2">
              <Tag size={16} className="text-gray-3" />
              {post.tags.map((tag) => (
                <Link
                  key={tag._id}
                  href={`/tags/${tag.slug}` as any}
                  className="rounded-full bg-gray-7 px-3.5 py-1.5 text-[0.8125rem] font-medium text-gray-2 transition-colors hover:bg-gray-6 dark:bg-gray-2 dark:text-gray-8"
                >
                  #{tag.title}
                </Link>
              ))}
            </div>
          )}

          <AuthorBox author={post.author || null} locale={safeLocale} />

          <ShareButtons url={url} title={l.title} />
          <Comments postId={post._id} />
        </div>
      </div>

      {/* Related posts */}
      {morePosts.length > 0 && (
        <section className="mx-auto mt-12 w-full max-w-[1500px] px-4 sm:mt-16 sm:px-8 xl:px-12">
          <h2 className="mb-6 flex items-center justify-center gap-2 text-center text-2xl font-bold tracking-tight text-ink sm:justify-start sm:text-left dark:text-white">
            <StarSparkle size={18} className="text-magic-purple" />
            {t('related')}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {morePosts.map((p: Post, i: number) => (
              <PostCard key={p._id} post={p} index={i} locale={safeLocale} />
            ))}
          </div>
        </section>
      )}

      <BackToTop />
    </article>
  )
}

/** Build anchor ids for headings, matching the renderer's headingId(). */
function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/** Extract h2/h3 headings with stable ids from Portable Text content. */
function extractHeadings(content: any): TocHeading[] {
  if (!Array.isArray(content)) return []
  return content
    .filter(
      (b) => b._type === 'block' && (b.style === 'h2' || b.style === 'h3'),
    )
    .map((b) => {
      const text = (b.children || [])
        .map((c: any) => c.text || '')
        .join(' ')
        .trim()
      const id = slugifyHeading(text)
      return {
        id,
        text: text.length > 60 ? `${text.slice(0, 60).trim()}…` : text,
        level: b.style === 'h3' ? 3 : 2,
      } as TocHeading
    })
    .filter((h) => h.id && h.text)
}
