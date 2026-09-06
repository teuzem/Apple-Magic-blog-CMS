import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { StarSparkle } from '@/components/brand/StarSparkle'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

interface HeroSectionProps {
  className?: string
}

/**
 * Apple-style full-bleed hero with the signature gradient, a big
 * bold headline, an "magic" sparkle accent, and two CTAs.
 */
export function HeroSection({ className }: HeroSectionProps) {
  const t = useTranslations('hero')

  return (
    <section
      className={cn(
        'relative overflow-hidden bg-white pb-16 pt-24 text-center sm:pb-28 sm:pt-36 dark:bg-black',
        className,
      )}
    >
      {/* Apple hero gradient backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-apple-hero"
      />
      {/* Floating magic sparkles */}
      <StarSparkle
        size={28}
        className="absolute left-[12%] top-[18%] text-apple-blue/60"
      />
      <StarSparkle
        size={20}
        className="absolute right-[15%] top-[26%] text-magic-purple/60 [animation-delay:-1.2s]"
      />
      <StarSparkle
        size={16}
        className="absolute left-[24%] bottom-[16%] text-magic-pink/50 [animation-delay:-0.6s]"
      />

      <div className="relative mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-[0.8125rem] font-medium text-apple-blue backdrop-blur dark:text-apple-blue">
          {t('eyebrow')}
          <StarSparkle size={12} className="text-magic-purple" />
        </p>

        <h1 className="mx-auto max-w-4xl text-[2.25rem] font-bold leading-[1.06] tracking-tight text-ink sm:text-5xl lg:text-6xl dark:text-white">
          {t('title')
            .split(',')
            .map((part, i) => (
              <span key={i} className="block text-balance">
                {i === 0 ? (
                  <span className="text-magic-gradient">{part},</span>
                ) : (
                  part
                )}
              </span>
            ))}
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-[1rem] leading-relaxed text-gray-2 sm:mt-6 sm:text-[1.1875rem] dark:text-gray-4">
          {t('subtitle')}
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/posts"
            className="group inline-flex items-center gap-2 rounded-full bg-apple-blue px-7 py-3 text-base font-medium text-white transition-all hover:bg-apple-blue-hover active:scale-[0.98]"
          >
            {t('ctaPrimary')}
            <ArrowRight
              size={18}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
          <Link
            href="/categories/buying-guides"
            className="inline-flex items-center gap-2 rounded-full bg-gray-7 px-7 py-3 text-base font-medium text-apple-blue transition-all hover:bg-gray-6 active:scale-[0.98] dark:bg-gray-1 dark:text-white dark:hover:bg-gray-2"
          >
            {t('ctaSecondary')}
          </Link>
        </div>
      </div>
    </section>
  )
}
