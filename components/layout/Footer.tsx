import { Globe2 } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { AppleWordmark } from '@/components/brand/AppleWordmark'
import { Link } from '@/i18n/navigation'
import { SITE } from '@/lib/constants'
import type { Settings } from '@/lib/sanity.queries'

interface FooterProps {
  footerGroups?: {
    heading?: string
    headingFr?: string
    links?: {
      label?: string
      labelFr?: string
      url?: string
      external?: boolean
    }[]
  }[]
  settings?: Settings
}

interface FooterLink {
  label: string
  url: string
  external?: boolean
}

interface FooterGroup {
  heading: string
  links: FooterLink[]
}

function mergeConfiguredGroups(
  configuredGroups: FooterGroup[],
  defaultGroups: FooterGroup[],
) {
  if (!configuredGroups.length) return defaultGroups

  const groups = configuredGroups.map((group, index) => {
    const fallback = defaultGroups[index]
    if (!fallback) return group
    const present = new Set(group.links.map((link) => link.url))
    return {
      ...group,
      links: [
        ...group.links,
        ...fallback.links.filter((link) => !present.has(link.url)),
      ],
    }
  })

  for (let index = groups.length; index < defaultGroups.length; index += 1) {
    groups.push(defaultGroups[index])
  }

  return groups
}

/**
 * Bilingual footer with Sanity-controlled groups and translated fallbacks for
 * essential publication, discovery, support and legal destinations.
 */
export function Footer({ footerGroups = [], settings }: FooterProps) {
  const t = useTranslations('footer')
  const locale = useLocale()

  const defaultGroups: FooterGroup[] = [
    {
      heading: t('explore'),
      links: [
        { label: t('blog'), url: '/posts' },
        { label: t('categories'), url: '/categories' },
        { label: t('news'), url: '/categories/news' },
        { label: t('reviews'), url: '/categories/reviews' },
        { label: t('buyingGuides'), url: '/categories/buying-guides' },
        { label: t('comparisons'), url: '/categories/comparisons' },
      ],
    },
    {
      heading: t('resources'),
      links: [
        { label: t('products'), url: '/products' },
        { label: t('search'), url: '/search' },
        { label: t('authors'), url: '/authors' },
        { label: t('tags'), url: '/tags' },
        { label: t('subscribe'), url: '/about#newsletter' },
      ],
    },
    {
      heading: t('support'),
      links: [
        { label: t('aboutLink'), url: '/about' },
        { label: t('contactUs'), url: '/pages/contact' },
        { label: t('editorialPolicy'), url: '/pages/editorial-policy' },
        { label: t('transparency'), url: '/pages/transparency' },
      ],
    },
    {
      heading: t('about'),
      links: [
        { label: t('privacy'), url: '/pages/privacy' },
        { label: t('terms'), url: '/pages/terms' },
        { label: t('aboutLink'), url: '/about' },
      ],
    },
  ]

  const configuredGroups: FooterGroup[] = footerGroups
    .map((group) => ({
      heading:
        locale === 'fr'
          ? group.headingFr || group.heading || ''
          : group.heading || '',
      links: (group.links || [])
        .filter((link) => link.label && link.url)
        .map((link) => ({
          label:
            locale === 'fr'
              ? link.labelFr || link.label || ''
              : link.label || '',
          url: link.url || '/',
          external: link.external,
        })),
    }))
    .filter((group) => group.heading && group.links.length)

  const groups = mergeConfiguredGroups(configuredGroups, defaultGroups)
  const currentYear = new Date().getUTCFullYear()

  return (
    <footer className="border-t border-gray-7 bg-gray-8 text-gray-3 dark:border-gray-2 dark:bg-black">
      <div className="mx-auto w-full max-w-[1320px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-6 lg:gap-y-16">
          <div className="lg:col-span-2 lg:pr-8">
            <AppleWordmark className="mb-5 text-ink dark:text-white" />
            <p className="max-w-[46ch] text-[0.8125rem] leading-[1.9]">
              {(locale === 'fr'
                ? settings?.footer?.aboutTextFr || settings?.footer?.aboutText
                : settings?.footer?.aboutText) || t('aboutText')}
            </p>
            <p className="mt-4 text-[0.75rem] font-medium text-apple-blue">
              {t('localizedMotto')}
            </p>
          </div>

          {groups.map((group) => (
            <div key={group.heading}>
              <h3 className="mb-6 text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-gray-2 dark:text-gray-8">
                {group.heading}
              </h3>
              <ul className="space-y-4">
                {group.links.map((link) => (
                  <li key={`${group.heading}-${link.url}`}>
                    {link.external ||
                    /^(?:https?:|mailto:|tel:)/.test(link.url) ? (
                      <a
                        href={link.url}
                        className="text-[0.8125rem] transition-colors hover:text-apple-blue"
                        rel={
                          link.url.startsWith('http')
                            ? 'noopener noreferrer'
                            : undefined
                        }
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.url as any}
                        className="text-[0.8125rem] transition-colors hover:text-apple-blue"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex min-w-0 flex-col items-start justify-between gap-6 border-t border-gray-6 pt-8 text-[0.75rem] sm:mt-20 sm:flex-row sm:items-center sm:pt-10 dark:border-gray-2">
          <p className="max-w-full break-words">
            {(locale === 'fr'
              ? settings?.footer?.copyrightFr || settings?.footer?.copyright
              : settings?.footer?.copyright) ||
              `Copyright (c) ${currentYear} ${SITE.name}. ${t('allRightsReserved')}`}
          </p>
          <div className="flex max-w-full flex-wrap items-center gap-x-5 gap-y-3">
            <Link
              href="/pages/privacy"
              className="transition-colors hover:text-apple-blue"
            >
              {t('privacy')}
            </Link>
            <Link
              href="/pages/terms"
              className="transition-colors hover:text-apple-blue"
            >
              {t('terms')}
            </Link>
            <Link
              href="/pages/contact"
              className="transition-colors hover:text-apple-blue"
            >
              {t('contactUs')}
            </Link>
            <span className="inline-flex items-center gap-1.5 text-gray-4 dark:text-gray-2">
              <Globe2 aria-hidden="true" size={14} /> {t('region')}
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
