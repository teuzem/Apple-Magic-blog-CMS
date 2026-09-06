import { cn } from '@/lib/utils'

import { AppleLogo } from './AppleLogo'

interface AppleWordmarkProps {
  className?: string
  size?: number
  animate?: boolean
}

/**
 * The full Apple Magic wordmark: Apple+star mark followed by "Apple Magic".
 */
export function AppleWordmark({
  className,
  size = 22,
  animate = false,
}: AppleWordmarkProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 font-semibold tracking-tight',
        className,
      )}
      aria-label="Apple Magic"
    >
      <AppleLogo
        size={size}
        animate={animate}
        className="relative"
        starClassName="text-magic"
      />
      <span className="text-[1.05em] leading-none">Apple&nbsp;Magic</span>
    </span>
  )
}
