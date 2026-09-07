import { ArrowRight, BadgeCheck } from 'lucide-react'

import { SocialBrandIcon } from '@/components/brand/SocialBrandIcon'
import { StarSparkle } from '@/components/brand/StarSparkle'
import SanityImage from '@/components/sanity/SanityImage'
import { Link } from '@/i18n/navigation'
import type { Author } from '@/lib/sanity.queries'
import { normalizeSocial } from '@/lib/social'

interface AuthorBoxProps {
  author: Pick<
    Author,
    | 'name'
    | 'role'
    | 'headline'
    | 'bio'
    | 'longBio'
    | 'picture'
    | 'expertise'
    | 'social'
    | 'slug'
  > | null
  locale?: string
}

export default function AuthorBox({ author, locale }: AuthorBoxProps) {
  if (!author?.name) return null
  const socials = normalizeSocial(author.social)

  return (
    <div className="my-8 flex flex-col items-center gap-4 rounded-lg border border-gray-7 bg-gray-8 p-5 text-center sm:my-10 sm:flex-row sm:items-start sm:gap-5 sm:p-6 sm:text-left dark:border-gray-2 dark:bg-gray-1">
      <Link
        href={`/authors/${author.slug || ''}`}
        locale={locale}
        className="shrink-0"
      >
        {author.picture ? (
          <SanityImage
            asset={author.picture}
            alt={author.name}
            className="h-24 w-24 shrink-0 rounded-full sm:h-28 sm:w-28"
            width={224}
            height={224}
          />
        ) : (
          <div
            className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full text-3xl font-bold text-white sm:h-28 sm:w-28 sm:text-4xl"
            style={{
              background: 'linear-gradient(135deg,#ff375f,#bf5af2,#2997ff)',
            }}
          >
            {author.name[0].toUpperCase()}
          </div>
        )}
      </Link>

      <div className="min-w-0 flex-1 sm:self-center">
        <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
          <Link
            href={`/authors/${author.slug || ''}`}
            locale={locale}
            className="group flex items-center gap-1.5"
          >
            <h3 className="flex items-center gap-1.5 text-lg font-semibold text-ink group-hover:underline dark:text-white">
              {author.name}
              <BadgeCheck size={16} className="text-apple-blue" />
            </h3>
          </Link>
          {(author.role || author.headline) && (
            <span className="text-sm text-gray-3 dark:text-gray-4">
              {author.headline || author.role}
            </span>
          )}
        </div>

        {(author.bio || author.longBio) && (
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-gray-2 dark:text-gray-8">
            {author.longBio || author.bio}
          </p>
        )}

        {author.expertise && author.expertise.length > 0 && (
          <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
            {author.expertise.map((e, index) => (
              <span
                key={`${e}-${index}`}
                className="inline-flex items-center gap-1 rounded-full bg-magic-purple/10 px-2.5 py-0.5 text-xs font-medium text-magic-purple"
              >
                <StarSparkle size={10} /> {e}
              </span>
            ))}
          </div>
        )}

        {socials.length > 0 && (
          <div className="mt-3 flex justify-center gap-1 sm:justify-start">
            {socials.map((s, index) => (
              <a
                key={`${s.platform}-${s.url}-${index}`}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                title={s.label}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-7 text-gray-3 transition-colors hover:bg-apple-blue hover:text-white dark:bg-gray-2 dark:text-gray-8"
              >
                <SocialBrandIcon platform={s.platform} size={15} />
              </a>
            ))}
          </div>
        )}

        {author.slug && (
          <Link
            href={`/authors/${author.slug}`}
            locale={locale}
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-apple-blue hover:underline"
          >
            View full profile
            <ArrowRight size={14} />
          </Link>
        )}
      </div>
    </div>
  )
}
