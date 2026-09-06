import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  subtitle?: string
  className?: string
  align?: 'left' | 'center'
}

/**
 * Apple-style section header: overline eyebrow + bold headline + optional subtitle.
 */
export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  className,
  align = 'left',
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'mb-10 flex min-w-0 flex-col items-center gap-3 text-center sm:items-start sm:text-left',
        align === 'center' && 'items-center text-center',
        className,
      )}
    >
      {eyebrow && (
        <span className="max-w-full break-words text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-apple-blue">
          {eyebrow}
        </span>
      )}
      <h2 className="max-w-2xl break-words text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl dark:text-white">
        {title}
      </h2>
      {subtitle && (
        <p className="max-w-2xl text-[1.0625rem] leading-relaxed text-gray-2 dark:text-gray-4">
          {subtitle}
        </p>
      )}
    </div>
  )
}
