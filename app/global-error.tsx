'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Fatal application error', error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <main
          style={{
            fontFamily: 'system-ui, sans-serif',
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <section>
            <h1>Apple Magic Blog</h1>
            <h2>We could not load this page</h2>
            <p>Please try again.</p>
            <button
              type="button"
              onClick={() => reset()}
              style={{ padding: '0.75rem 1rem', cursor: 'pointer' }}
            >
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  )
}
