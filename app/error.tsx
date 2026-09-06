'use client'

import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'

export default function GlobalRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application route error', error)
  }, [error])

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-20 text-center text-ink dark:bg-black dark:text-white">
      <section className="w-full max-w-xl">
        <AlertTriangle
          className="mx-auto h-12 w-12 text-orange"
          aria-hidden="true"
        />
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-gray-3">
          Apple Magic Blog
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Something went wrong
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-gray-3">
          This page could not be loaded. Try again, or return to the homepage.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-apple-blue px-5 py-3 text-sm font-semibold text-white transition hover:bg-apple-blue-hover"
          >
            <RefreshCw size={17} aria-hidden="true" />
            Try again
          </button>
          <Link
            href="/en"
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-gray-5 px-5 py-3 text-sm font-semibold text-ink transition hover:bg-gray-7 dark:border-gray-1 dark:text-white dark:hover:bg-gray-1"
          >
            <Home size={17} aria-hidden="true" />
            Homepage
          </Link>
        </div>
      </section>
    </main>
  )
}
