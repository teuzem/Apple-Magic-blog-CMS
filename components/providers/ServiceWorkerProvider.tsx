'use client'

import { useEffect } from 'react'

/**
 * Registers the Serwist-generated service worker for full PWA / offline support.
 * Only registers in production and when the browser supports service workers.
 */
export function ServiceWorkerProvider({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== 'production' ||
      !('serviceWorker' in navigator)
    ) {
      return
    }

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        })
        // Ask the service worker to take control immediately
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        }
      } catch (error) {
        console.error('Service worker registration failed', error)
      }
    }

    window.addEventListener('load', register)
    return () => window.removeEventListener('load', register)
  }, [])

  return <>{children}</>
}
