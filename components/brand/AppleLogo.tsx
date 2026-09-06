import { cn } from '@/lib/utils'

interface AppleLogoProps {
  className?: string
  starClassName?: string
  size?: number
  animate?: boolean
  style?: React.CSSProperties
}

/**
 * Apple Magic logo mark.
 *
 * Renders the classic Apple glyph (the universal Apple "bite" silhouette
 * drawn as an SVG path) with a four-point "magic sparkle" star offset to the
 * top-right, evoking the brand's promise of magic and shine.
 *
 * The star can pulse with a subtle twinkle animation (disabled by default).
 */
export function AppleLogo({
  className,
  starClassName,
  size = 24,
  animate = false,
  style,
}: AppleLogoProps) {
  return (
    <svg
      viewBox="0 0 40 44"
      width={size}
      height={size * 1.1}
      fill="currentColor"
      aria-hidden="true"
      className={cn('select-none', className)}
      style={{ ...style }}
    >
      {/* Apple glyph */}
      <path
        d="M33.5 25.9c-.2-4.7 3.8-7 4-7.1-2.2-3.2-5.6-3.6-6.8-3.7-2.9-.3-5.6 1.7-7.1 1.7-1.5 0-3.8-1.7-6.3-1.6-3.2.1-6.2 1.9-7.9 4.8-3.4 5.8-.9 14.4 2.4 19.1 1.6 2.3 3.5 4.9 6 4.8 2.4-.1 3.3-1.6 6.2-1.6 2.9 0 3.7 1.6 6.2 1.5 2.6-.1 4.2-2.4 5.8-4.7 1.8-2.6 2.5-5.2 2.6-5.3-.1-.1-5-1.9-5.1-7.9z"
        transform="translate(-2 1.5)"
      />
      <path
        d="M30.4 6.9c1.3-1.6 2.2-3.8 2-6-1.9.1-4.2 1.3-5.6 2.9-1.2 1.4-2.3 3.7-2 5.9 2.1.2 4.3-1.2 5.6-2.8z"
        transform="translate(-2 1.5)"
      />
      {/* Magic star sparkle */}
      <StarSparkle
        className={cn(
          'absolute origin-center text-current',
          animate && 'animate-pulse-magic',
          starClassName,
        )}
      />
    </svg>
  )
}

/**
 * The four-point magic sparkle star, positioned "up and to the right"
 * of the Apple glyph, like a shining spell.
 */
export function StarSparkle({ className }: { className?: string }) {
  return (
    <path
      d="M31 3.2c.35-1 .7-1.35 1.2-1.8-.5-.45-.85-.8-1.2-1.8-.35 1-.7 1.35-1.2 1.8.5.45.85.8 1.2 1.8zM38.2 9.8c.55-1.6 1.1-2.15 1.9-2.85-.8-.7-1.35-1.25-1.9-2.85-.55 1.6-1.1 2.15-1.9 2.85.8.7 1.35 1.25 1.9 2.85zM26.5 14.5c.7-2.05 1.4-2.75 2.4-3.65-1-.9-1.7-1.6-2.4-3.65-.7 2.05-1.4 2.75-2.4 3.65 1 .9 1.7 1.6 2.4 3.65z"
      fill="currentColor"
      className={className}
    />
  )
}

export default AppleLogo
