import { cn } from '@/lib/utils'

interface StarSparkleProps {
  className?: string
  animate?: boolean
  size?: number
}

/**
 * A standalone four-point magic sparkle / twinkle used throughout the
 * Apple Magic design language (hero accents, loading states, empty states).
 */
export function StarSparkle({
  className,
  animate = true,
  size = 20,
}: StarSparkleProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      className={cn(animate && 'animate-twinkle', className)}
    >
      <path d="M20 2c1.2 6 3 8.8 6.5 11.5C25 17 22.2 18.8 20 20c-2.2-1.2-5-3-6.5-6.5C17 10.8 18.8 8 20 2z" />
      <path d="M33 16c.8 4 2 5.9 4.3 7.7-2.3 1.8-3.5 3.7-4.3 7.7-.8-4-2-5.9-4.3-7.7 2.3-1.8 3.5-3.7 4.3-7.7z" />
      <path d="M7 24c.9 5.3 2.3 7.8 5 10.2-2.7 2.4-4.1 4.9-5 10.2-.9-5.3-2.3-7.8-5-10.2 2.7-2.4 4.1-4.9 5-10.2z" />
    </svg>
  )
}

export default StarSparkle
