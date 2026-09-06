'use client'

import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'

export default function LocalizedRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Localized route error', error)
  }, [error])

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6 py-20 text-center">
      <section className="w-full max-w-xl">
        <AlertTriangle
          className="mx-auto h-11 w-11 text-orange"
          aria-hidden="true"
        />
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-ink dark:text-white">
          Something went wrong
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-gray-3">
          We could not load this page. Try again or return to the homepage.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-apple-blue px-5 py-3 text-sm font-semibold text-white hover:bg-apple-blue-hover"
          >
            <RefreshCw size={17} aria-hidden="true" />
            Try again
          </button>
          <Link
            href="/en"
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-gray-5 px-5 py-3 text-sm font-semibold text-ink dark:border-gray-1 dark:text-white"
          >
            <Home size={17} aria-hidden="true" />
            Homepage
          </Link>
        </div>
      </section>
    </main>
  )
}
