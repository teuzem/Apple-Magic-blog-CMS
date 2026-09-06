import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'fr'],
  // Used when no locale matches
  defaultLocale: 'en',
  // Always use the prefix (e.g. /en/..., /fr/...) so both languages are explicit
  localePrefix: 'always',
})

export const config = {
  // Match only internationalized pathnames.
  // `/studio` is intentionally excluded so the Sanity Studio stays
  // at a single non-localized path (outside the [locale] layout).
  matcher: [
    '/',
    '/(en|fr)/:path*',
    '/((?!api|_next|_vercel|studio|.*\\..*).*)',
  ],
}
