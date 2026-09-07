import {
  Award,
  BadgeCheck,
  Briefcase,
  GraduationCap,
  Languages,
  MapPin,
  Quote as QuoteIcon,
} from 'lucide-react'

import { SocialBrandIcon } from '@/components/brand/SocialBrandIcon'
import { StarSparkle } from '@/components/brand/StarSparkle'
import SanityImage from '@/components/sanity/SanityImage'
import type { Author } from '@/lib/sanity.queries'
import { normalizeSocial } from '@/lib/social'

interface AuthorHeaderProps {
  author: Author
  locale?: string
}

/**
 * Rich author profile header: avatar, verified name, headline, bio,
 * demographics, expertise, achievements, education and social networks.
 */
export default function AuthorHeader({ author }: AuthorHeaderProps) {
  const socials = normalizeSocial(author.social)

  return (
    <div className="min-w-0 overflow-hidden rounded-md border border-gray-7 bg-white dark:border-gray-2 dark:bg-gray-1">
      {/* Accent strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-magic-purple via-apple-blue to-magic-pink" />

      <div className="p-6 sm:p-8">
        {/* Top row: avatar + identity */}
        <div className="flex min-w-0 flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:gap-6 sm:text-left">
          <div className="relative shrink-0">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-magic-purple via-apple-blue to-magic-pink opacity-60 blur-sm" />
            {author.picture ? (
              <SanityImage
                asset={author.picture}
                alt={author.name || 'Author'}
                className="relative h-28 w-28 rounded-full border-4 border-white object-cover dark:border-gray-1"
                width={224}
                height={224}
              />
            ) : (
              <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-magic-purple to-apple-blue text-4xl font-bold text-white dark:border-gray-1">
                {(author.name || '?')[0].toUpperCase()}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h1 className="flex min-w-0 flex-wrap items-center justify-center gap-1.5 break-words text-2xl font-bold tracking-tight text-ink sm:justify-start sm:text-3xl dark:text-white">
                {author.name}
                <BadgeCheck size={22} className="text-apple-blue" />
              </h1>
            </div>

            <p className="mt-1 text-[0.9375rem] font-medium text-magic-purple">
              {author.headline || author.role}
            </p>

            <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[0.8125rem] text-gray-3 sm:justify-start dark:text-gray-4">
              {author.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={14} />
                  {author.location}
                </span>
              )}
              {author.role && (
                <span className="inline-flex items-center gap-1.5">
                  <Briefcase size={14} />
                  {author.role}
                </span>
              )}
              {typeof author.yearsExperience === 'number' && (
                <span className="inline-flex items-center gap-1.5">
                  <Award size={14} />
                  {author.yearsExperience} yrs experience
                </span>
              )}
            </div>

            {/* Quote */}
            {author.quote && (
              <div className="mt-4 flex gap-2 border-l-2 border-magic-purple pl-3 text-left">
                <QuoteIcon
                  size={16}
                  className="mt-0.5 shrink-0 text-magic-purple"
                />
                <p className="text-[0.9375rem] italic text-gray-2 dark:text-gray-8">
                  “{author.quote}”
                </p>
              </div>
            )}
          </div>

          {/* Socials */}
          {socials.length > 0 && (
            <div className="flex shrink-0 flex-wrap justify-center gap-2 sm:justify-start">
              {socials.map((s, index) => (
                <a
                  key={`${s.platform}-${s.url}-${index}`}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  title={s.label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-7 text-gray-3 transition-all hover:-translate-y-0.5 hover:bg-apple-blue hover:text-white dark:bg-gray-2 dark:text-gray-8"
                >
                  <SocialBrandIcon platform={s.platform} size={18} />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Bio */}
        {(author.bio || author.longBio) && (
          <div className="mt-6 grid min-w-0 gap-2">
            {author.longBio ? (
              <p className="break-words text-center text-[1rem] leading-relaxed text-gray-2 sm:text-left dark:text-gray-8">
                {author.longBio}
              </p>
            ) : (
              <p className="break-words text-center text-[1rem] leading-relaxed text-gray-2 sm:text-left dark:text-gray-8">
                {author.bio}
              </p>
            )}
          </div>
        )}

        {/* Demographics + expertise + achievements grid */}
        <div className="mt-6 grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {author.nationality && (
            <div className="rounded-lg bg-gray-8 p-4 dark:bg-gray-1">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-gray-3 dark:text-gray-4">
                Nationality
              </p>
              <p className="mt-1 text-[0.9375rem] font-medium text-ink dark:text-white">
                {author.nationality}
              </p>
            </div>
          )}
          {author.languages && author.languages.length > 0 && (
            <div className="rounded-lg bg-gray-8 p-4 dark:bg-gray-1">
              <p className="flex items-center gap-1 text-[0.6875rem] font-semibold uppercase tracking-wider text-gray-3 dark:text-gray-4">
                <Languages size={12} /> Languages
              </p>
              <p className="mt-1 flex flex-wrap gap-1 text-[0.8125rem] font-medium text-ink dark:text-white">
                {author.languages.join(' · ')}
              </p>
            </div>
          )}
          {author.expertise && author.expertise.length > 0 && (
            <div className="rounded-lg bg-gray-8 p-4 dark:bg-gray-1">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-gray-3 dark:text-gray-4">
                Expertise
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {author.expertise.map((e, index) => (
                  <span
                    key={`${e}-${index}`}
                    className="inline-flex items-center gap-1 rounded-full bg-magic-purple/10 px-2 py-0.5 text-xs font-medium text-magic-purple"
                  >
                    <StarSparkle size={10} /> {e}
                  </span>
                ))}
              </div>
            </div>
          )}
          {author.achievements && author.achievements.length > 0 && (
            <div className="rounded-lg bg-gray-8 p-4 dark:bg-gray-1">
              <p className="flex items-center gap-1 text-[0.6875rem] font-semibold uppercase tracking-wider text-gray-3 dark:text-gray-4">
                <Award size={12} /> Achievements
              </p>
              <ul className="mt-1.5 space-y-1 text-[0.8125rem] text-gray-2 dark:text-gray-8">
                {author.achievements.map((a, index) => (
                  <li key={`${a}-${index}`} className="flex gap-1.5">
                    <span className="text-apple-blue">•</span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {author.education && author.education.length > 0 && (
            <div className="rounded-lg bg-gray-8 p-4 dark:bg-gray-1">
              <p className="flex items-center gap-1 text-[0.6875rem] font-semibold uppercase tracking-wider text-gray-3 dark:text-gray-4">
                <GraduationCap size={12} /> Education
              </p>
              <ul className="mt-1.5 space-y-1.5 text-[0.8125rem] text-gray-2 dark:text-gray-8">
                {author.education.map((ed, index) => (
                  <li key={`${ed.degree || ''}-${ed.school || ''}-${index}`}>
                    {ed.degree}
                    {ed.school && (
                      <span className="text-gray-3 dark:text-gray-4">
                        {' '}
                        — {ed.school}
                      </span>
                    )}
                    {ed.year && (
                      <span className="text-gray-3 dark:text-gray-4">
                        {' '}
                        ({ed.year})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
