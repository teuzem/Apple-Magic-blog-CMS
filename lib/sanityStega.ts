/**
 * Strip invisible stega metadata characters that can become malformed after
 * strings are transformed, copied, or concatenated before reaching the DOM.
 */
export function stripInvalidStega(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.replace(/[\u200B-\u200D\u2060\uFEFF]/g, '')
}

/**
 * Sanity can add stega markers to every nested Portable Text string in draft
 * mode. Once a block has been cloned, localized, or transformed, those
 * markers may no longer have a valid payload and the visual-editing decoder
 * logs an "invalid length" error. Public rendering does not need the markers,
 * so remove them recursively while preserving the original block shape.
 */
export function stripInvalidStegaDeep<T>(value: T): T {
  if (typeof value === 'string') return stripInvalidStega(value) as T
  if (Array.isArray(value)) {
    return value.map((entry) => stripInvalidStegaDeep(entry)) as T
  }
  if (value && typeof value === 'object') {
    const result = Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        stripInvalidStegaDeep(entry),
      ]),
    )
    return result as T
  }
  return value
}
