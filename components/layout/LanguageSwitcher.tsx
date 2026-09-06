'use client'

import { Check } from 'lucide-react'
import { useLocale } from 'next-intl'

import { Link } from '@/i18n/navigation'
import { usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

const LOCALES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'fr', label: 'Français', short: 'FR' },
]

/**
 * Bilingual EN/FR switcher. Keeps the current pathname when switching locale.
 */
export function LanguageSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()

  return (
    <div className="inline-flex items-center rounded-full border border-gray-5 bg-transparent p-0.5 dark:border-gray-2">
      {LOCALES.map((l) => {
        const active = locale === l.code
        return (
          <Link
            key={l.code}
            href={pathname as any}
            locale={l.code}
            aria-label={l.label}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.75rem] font-semibold transition-all',
              active
                ? 'bg-apple-blue text-white'
                : 'text-gray-3 hover:text-ink dark:text-gray-4 dark:hover:text-white',
            )}
          >
            {l.short}
            {active && <Check size={11} className="text-white" />}
          </Link>
        )
      })}
    </div>
  )
}
