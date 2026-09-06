'use client'

import { forwardRef } from 'react'

import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'link' | 'pill'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  href?: string
  external?: boolean
}

const base =
  'inline-flex items-center justify-center gap-2 font-medium transition-all duration-300 select-none whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue focus-visible:ring-offset-2 dark:focus-visible:ring-offset-black disabled:pointer-events-none disabled:opacity-50'

const variants: Record<ButtonVariant, string> = {
  // Apple "primary" blue pill button
  primary:
    'rounded-full bg-apple-blue px-5 py-2 text-white hover:bg-apple-blue-hover active:scale-[0.98]',
  // Apple "secondary" light gray pill
  secondary:
    'rounded-full bg-gray-7 px-5 py-2 text-apple-blue hover:bg-gray-6 active:scale-[0.98] dark:bg-gray-1 dark:text-white dark:hover:bg-gray-2',
  // Ghost / bordered
  ghost:
    'rounded-full border border-gray-5 px-5 py-2 text-ink hover:border-apple-blue hover:text-apple-blue active:scale-[0.98] dark:border-gray-2 dark:text-gray-8 dark:hover:text-apple-blue',
  // Text link style
  link: 'text-apple-blue underline-offset-4 hover:underline',
  // Large pill CTA
  pill: 'rounded-full bg-ink px-6 py-2.5 text-white hover:bg-black active:scale-[0.98] dark:bg-white dark:text-ink dark:hover:bg-gray-7',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'text-xs px-3.5 py-1.5',
  md: 'text-sm px-5 py-2',
  lg: 'text-base px-7 py-3',
}

/**
 * Apple-style button. Renders an <a> when `href` is provided, otherwise a <button>.
 * Internal links use next-intl's localized Link automatically.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      href,
      external,
      children,
      ...props
    },
    ref,
  ) => {
    const classes = cn(base, variants[variant], sizes[size], className)

    if (href) {
      const isExternal = external || href.startsWith('http')
      if (isExternal) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={classes}
          >
            {children}
          </a>
        )
      }
      return (
        <Link href={href as any} className={classes}>
          {children}
        </Link>
      )
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
