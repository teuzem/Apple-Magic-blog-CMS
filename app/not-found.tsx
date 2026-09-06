import Link from 'next/link'

/**
 * Keep the root 404 dependency-free. This boundary can be rendered while
 * Next.js is recovering from a failed route compile, so it must not depend on
 * the localized client router or a client-side internationalization provider.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-20 text-center text-ink dark:bg-black dark:text-white">
      <section className="w-full max-w-lg">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-3">
          Apple Magic Blog
        </p>
        <h1 className="mt-4 text-6xl font-bold tracking-tight">404</h1>
        <h2 className="mt-4 text-2xl font-semibold">Page not found</h2>
        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-gray-3">
          The page you requested does not exist or has moved.
        </p>
        <Link
          href="/en"
          className="mt-8 inline-flex min-h-11 items-center rounded-md bg-apple-blue px-6 py-3 text-sm font-semibold text-white transition hover:bg-apple-blue-hover"
        >
          Go to homepage
        </Link>
      </section>
    </main>
  )
}
