'use client'

import { ServiceWorkerProvider } from './ServiceWorkerProvider'
import { ThemeProvider } from './ThemeProvider'

/**
 * Client providers used across the whole localized app.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ServiceWorkerProvider>{children}</ServiceWorkerProvider>
    </ThemeProvider>
  )
}
