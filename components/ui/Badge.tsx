import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  color?: string
  href?: string
  className?: string
  variant?: 'solid' | 'outline' | 'soft'
}

/**
 * Category / topic badge. Optionally a link.
 * Uses the category's brand color when provided.
 */
export function Badge({
  children,
  color,
  href,
  className,
  variant = 'soft',
}: BadgeProps) {
  const style = color
    ? ({ '--badge-color': color } as React.CSSProperties)
    : undefined

  const base = cn(
    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] transition-colors',
    variant === 'soft' &&
      'bg-gray-7 text-ink hover:bg-gray-6 dark:bg-gray-1 dark:text-gray-8 dark:hover:bg-gray-2',
    variant === 'outline' &&
      'border border-gray-5 text-ink hover:border-apple-blue hover:text-apple-blue dark:border-gray-2 dark:text-gray-8',
    color &&
      variant === 'soft' &&
      'bg-[color-mix(in_srgb,var(--badge-color)_14%,transparent)] text-[var(--badge-color)]',
    className,
  )

  if (href) {
    return (
      <Link href={href as any} style={style} className={base}>
        {children}
      </Link>
    )
  }

  return (
    <span style={style} className={base}>
      {children}
    </span>
  )
}
