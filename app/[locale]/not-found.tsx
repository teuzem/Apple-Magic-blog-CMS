import Link from 'next/link'

export default function LocalizedNotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6 py-20 text-center">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-3">
          404
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-ink dark:text-white">
          Page not found
        </h1>
        <p className="mt-4 text-gray-3">
          The page you requested does not exist or has moved.
        </p>
        <Link
          href="/en"
          className="mt-7 inline-flex min-h-11 items-center rounded-md bg-apple-blue px-5 py-3 text-sm font-semibold text-white hover:bg-apple-blue-hover"
        >
          Go to homepage
        </Link>
      </section>
    </main>
  )
}
