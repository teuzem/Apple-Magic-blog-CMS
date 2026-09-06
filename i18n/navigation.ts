import { createNavigation } from 'next-intl/navigation'

export const locales = ['en', 'fr'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

// Create localized navigation helpers from next-intl.
// `Link`, `usePathname`, `useRouter` etc. here prefix the active locale
// automatically (localePrefix: 'always'), so `/about` becomes `/en/about`.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation({
    locales,
    localePrefix: 'always' as const,
  })
