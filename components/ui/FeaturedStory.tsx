import { ArrowRight, Clock, User } from 'lucide-react'
import { useTranslations } from 'next-intl'

import SanityImage from '@/components/sanity/SanityImage'
import { Link } from '@/i18n/navigation'
import { getLocalized, type Post } from '@/lib/sanity.queries'
import { formatDate } from '@/lib/utils'

import { Badge } from './Badge'

interface FeaturedStoryProps {
  post: Post
  locale?: string
}

/**
 * Big featured story for the homepage hero area below the main hero.
 */
export function FeaturedStory({ post, locale = 'en' }: FeaturedStoryProps) {
  const t = useTranslations('post')

  if (!post) return null
  const l = getLocalized(post, locale)

  return (
    <Link
      href={`/posts/${post.slug}` as any}
      className="group relative block overflow-hidden rounded-md"
    >
      {/* Full-bleed image with gradient overlay */}
      <div className="relative aspect-[16/10] w-full sm:aspect-[21/9]">
        {post.coverImage ? (
          <SanityImage
            asset={post.coverImage}
            alt={l.title || ''}
            priority
            rounded={false}
            fill
            className="transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-magic-blue via-magic-purple to-magic-pink" />
        )}
        {/* Overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Content */}
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-8 lg:p-10">
          {post.category && (
            <Badge
              color={post.category.color}
              variant="solid"
              className="bg-black/40"
            >
              {post.category.title}
            </Badge>
          )}
          <h3 className="mt-3 max-w-3xl text-xl font-bold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
            {l.title}
          </h3>
          {l.excerpt && (
            <p className="mt-2 hidden max-w-xl text-[0.9375rem] leading-relaxed text-white/80 sm:block">
              {l.excerpt}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[0.75rem] text-white/70 sm:mt-4 sm:gap-4 sm:text-[0.8125rem]">
            {post.author?.name && (
              <span className="inline-flex items-center gap-1.5">
                <User size={13} /> {post.author.name}
              </span>
            )}
            {post.date && <span>{formatDate(post.date, locale)}</span>}
            {post.readingTime ? (
              <span className="inline-flex items-center gap-1">
                <Clock size={13} /> {post.readingTime} min
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1 text-white transition-colors group-hover:text-magic-blue">
              {t('readMore', {})} <ArrowRight size={14} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
