'use client'

import { ChevronDown, ListTree } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

export interface TocHeading {
  id: string
  text: string
  level: 2 | 3
}

interface TableOfContentsProps {
  headings: TocHeading[]
  variant?: 'sidebar' | 'inline'
  className?: string
}

/**
 * Article structure navigation supporting both a desktop sidebar and an
 * inline collapsible (mobile). Scroll-spy highlights the active section.
 */
export default function TableOfContents({
  headings,
  variant = 'sidebar',
  className,
}: TableOfContentsProps) {
  const t = useTranslations('post')
  const [active, setActive] = useState<string>('')
  const [open, setOpen] = useState(true)

  useEffect(() => {
    if (headings.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '0px 0px -70% 0px', threshold: 0 },
    )
    headings.forEach((h) => {
      const el = document.getElementById(h.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  if (variant === 'inline') {
    return (
      <div
        className={cn(
          'my-6 rounded-xl border border-gray-7 dark:border-gray-2',
          className,
        )}
      >
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-ink dark:text-white"
        >
          <span className="inline-flex items-center gap-2">
            <ListTree size={16} className="text-apple-blue" />
            {t('tableOfContents')}
          </span>
          <ChevronDown
            size={16}
            className={cn(
              'text-gray-4 transition-transform',
              open && 'rotate-180',
            )}
          />
        </button>
        {open && (
          <ul className="space-y-1.5 border-t border-gray-7 px-4 py-3 text-[0.875rem] dark:border-gray-2">
            {headings.map((h) => (
              <li key={h.id} className={h.level === 3 ? 'pl-4' : ''}>
                <a
                  href={`#${h.id}`}
                  onClick={() => {
                    document
                      .getElementById(h.id)
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    history.replaceState(null, '', `#${h.id}`)
                  }}
                  className={cn(
                    'block py-0.5 text-gray-3 transition-colors hover:text-apple-blue dark:text-gray-5',
                    active === h.id && 'font-medium text-apple-blue',
                  )}
                >
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  return (
    <nav
      className={cn(
        'max-h-[52vh] overflow-auto rounded-lg border border-gray-7 bg-white p-5 shadow-sm dark:border-gray-2 dark:bg-gray-1',
        className,
      )}
    >
      <p className="mb-4 flex items-center gap-2 text-[0.8125rem] font-semibold uppercase tracking-wide text-gray-4">
        <ListTree size={14} /> {t('tableOfContents')}
      </p>
      <ul className="space-y-2.5 text-[0.9rem]">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? 'pl-4' : ''}>
            <a
              href={`#${h.id}`}
              className={cn(
                'block border-l-2 py-1 pl-3 leading-snug text-gray-3 transition-colors hover:text-apple-blue dark:text-gray-5',
                active === h.id
                  ? 'border-apple-blue bg-apple-blue/5 font-semibold text-apple-blue'
                  : 'border-transparent',
              )}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
