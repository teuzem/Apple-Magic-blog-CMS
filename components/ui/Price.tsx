'use client'

import { useLocalCurrency } from '@/lib/useLocalCurrency'
import { cn } from '@/lib/utils'

interface PriceProps {
  /** Authoring price in FCFA (source of truth in the CMS), converted to the visitor's currency. */
  xaf?: number
  className?: string
}

/**
 * Displays a product price automatically localized to the visitor's
 * currency (default FCFA for our Cameroon market). Falls back to FCFA
 * when the convert API is unreachable.
 */
export default function Price({ xaf, className }: PriceProps) {
  const { ready, format } = useLocalCurrency()
  const hasValue = xaf !== undefined && xaf > 0

  if (!hasValue) {
    return (
      <span className={cn('text-sm text-gray-3 dark:text-gray-4', className)}>
        —
      </span>
    )
  }

  return (
    <span className={cn('inline-block', className)}>
      {!ready ? (
        <span className="inline-block h-4 w-16 animate-pulse rounded bg-gray-7 dark:bg-gray-2" />
      ) : (
        <span className="font-semibold">{format(xaf!)}</span>
      )}
    </span>
  )
}
