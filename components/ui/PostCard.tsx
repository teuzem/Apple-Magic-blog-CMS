import { Clock, User } from 'lucide-react'

import SanityImage from '@/components/sanity/SanityImage'
import { Link } from '@/i18n/navigation'
import { getLocalized, type Post } from '@/lib/sanity.queries'
import { cn, formatDate, getReadingTime } from '@/lib/utils'

import { Badge } from './Badge'

interface PostCardProps {
  post: Post
  index?: number
  className?: string
  showAuthor?: boolean
  priority?: boolean
  locale?: string
}

/**
 * A clean, editorial post card in Apple's design language.
 */
export function PostCard({
  post,
  index = 0,
  className,
  showAuthor = true,
  priority = false,
  locale = 'en',
}: PostCardProps) {
  const readingTime =
    post.readingTime ??
    (post.content
      ? getReadingTime(JSON.stringify(post.content).replace(/<[^>]*>/g, ' '))
      : 0)

  const l = getLocalized(post, locale)

  return (
    <article
      className={cn(
        'group flex min-w-0 flex-col overflow-hidden rounded-md border border-gray-7 bg-white transition-colors duration-300 hover:border-apple-blue/30 dark:border-gray-2 dark:bg-gray-1',
        className,
      )}
    >
      <Link
        href={`/posts/${post.slug}` as any}
        className="relative block overflow-hidden"
      >
        <div className="aspect-[16/10] w-full">
          <div className="relative h-full w-full">
            {post.coverImage ? (
              <SanityImage
                asset={post.coverImage}
                alt={l.title || ''}
                priority={priority || index < 2}
                rounded={false}
                className="transition-transform duration-500 group-hover:scale-[1.03]"
                fill
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-7 to-gray-6 dark:from-gray-1 dark:to-gray-2" />
            )}
          </div>
        </div>
        {post.category && (
          <Badge color={post.category.color} className="absolute left-3 top-3">
            {post.category.title}
          </Badge>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2 text-[0.75rem] text-gray-3 dark:text-gray-4">
          {post.date && <span>{formatDate(post.date, locale)}</span>}
          {readingTime > 0 && (
            <span className="inline-flex items-center gap-1">
              <Clock size={12} /> {readingTime} min
            </span>
          )}
        </div>

        <h3 className="break-words text-[1.125rem] font-semibold leading-snug tracking-tight text-ink transition-colors group-hover:text-apple-blue dark:text-white">
          <Link href={`/posts/${post.slug}` as any}>{l.title}</Link>
        </h3>

        {l.excerpt && (
          <p className="line-clamp-2 break-words text-[0.875rem] leading-relaxed text-gray-2 dark:text-gray-4">
            {l.excerpt}
          </p>
        )}

        {showAuthor && post.author?.name && (
          <div className="mt-auto flex items-center gap-2 pt-3 text-[0.75rem] text-gray-3 dark:text-gray-4">
            <User size={12} />
            {post.author.slug ? (
              <Link
                href={`/authors/${post.author.slug}` as any}
                locale={locale}
                className="font-medium transition-colors hover:text-apple-blue"
              >
                {post.author.name}
              </Link>
            ) : (
              <span className="font-medium">{post.author.name}</span>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
