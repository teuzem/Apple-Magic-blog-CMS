import { getClient } from '@/lib/sanity.client'

/**
 * Wrap Sanity data fetches so the site never crashes when credentials
 * are missing or the dataset is empty. Returns the provided fallback.
 */
export async function safeSanityFetch<T>(
  fetchFn: (client: ReturnType<typeof getClient>) => Promise<T>,
  fallback: T,
  client?: ReturnType<typeof getClient>,
): Promise<T> {
  try {
    const fetchClient = client || getClient()
    const result = await fetchFn(fetchClient)
    return result ?? fallback
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      const message =
        error instanceof Error ? error.message : 'Unknown Sanity fetch error'
      console.warn(
        `[safeSanityFetch] Sanity unavailable - using fallback: ${message}`,
      )
    }
    return fallback
  }
}
