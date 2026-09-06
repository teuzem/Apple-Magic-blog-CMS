'use client'

import { useEffect, useMemo, useState } from 'react'

import UniversalSidebarMedia from '@/components/article/UniversalSidebarMedia'
import type { ArticleSidebarSlide } from '@/lib/sanity.queries'
import { cn } from '@/lib/utils'

const AUTOPLAY_DELAY = 30_000

function localizePath(path: string, locale: string) {
  if (!path.startsWith('/')) return path
  if (/^\/(en|fr)(\/|$)/.test(path)) return path
  return `/${locale}${path}`
}

export default function SidebarMediaCarousel({
  slides,
  locale,
  heading,
  sponsored = false,
}: {
  slides: ArticleSidebarSlide[]
  locale: string
  heading: string
  sponsored?: boolean
}) {
  const visibleSlides = useMemo(
    () => slides.filter((slide) => slide.enabled !== false),
    [slides],
  )
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (index >= visibleSlides.length) setIndex(0)
  }, [index, visibleSlides.length])

  useEffect(() => {
    if (paused || visibleSlides.length < 2) return
    const timer = window.setInterval(() => {
      if (!document.hidden) {
        setIndex((current) => (current + 1) % visibleSlides.length)
      }
    }, AUTOPLAY_DELAY)
    return () => window.clearInterval(timer)
  }, [paused, visibleSlides.length])

  if (visibleSlides.length === 0) return null

  const slide = visibleSlides[index]
  const isFrench = locale === 'fr'
  const title = (isFrench ? slide.titleFr || slide.title : slide.title) || ''
  const description =
    (isFrench ? slide.descriptionFr || slide.description : slide.description) ||
    ''
  const sponsorLabel =
    (isFrench
      ? slide.sponsorLabelFr || slide.sponsorLabel
      : slide.sponsorLabel) || (isFrench ? 'Sponsorise' : 'Sponsored')
  const href = localizePath(slide.destinationUrl || '/', locale)
  const external = /^https:\/\//i.test(href)

  return (
    <section aria-label={heading}>
      <h2 className="mb-3 text-[0.8125rem] font-bold uppercase tracking-[0.08em] text-gray-3 dark:text-gray-5">
        {heading}
      </h2>
      <div
        className="overflow-hidden rounded-lg border border-gray-7 bg-white shadow-sm dark:border-gray-2 dark:bg-gray-1"
        role="region"
        aria-roledescription="carousel"
        aria-label={heading}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        <a
          href={href}
          target={slide.openInNewTab || external ? '_blank' : undefined}
          rel={
            slide.openInNewTab || external ? 'noopener noreferrer' : undefined
          }
          className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue focus-visible:ring-inset"
          aria-label={`${title}. ${isFrench ? 'Diapositive' : 'Slide'} ${index + 1} ${isFrench ? 'sur' : 'of'} ${visibleSlides.length}`}
        >
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
            <UniversalSidebarMedia slide={slide} alt={title} />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
            {sponsored && (
              <span className="absolute left-3 top-3 rounded bg-black/75 px-2 py-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-white">
                {sponsorLabel}
              </span>
            )}
          </div>
          <div className="px-4 pb-4 pt-3">
            <h3 className="text-[1rem] font-semibold leading-snug text-ink transition-colors group-hover:text-apple-blue dark:text-white">
              {title}
            </h3>
            {description && (
              <p className="mt-1.5 line-clamp-3 text-[0.8125rem] leading-relaxed text-gray-3 dark:text-gray-4">
                {description}
              </p>
            )}
          </div>
        </a>

        {visibleSlides.length > 1 && (
          <div
            className="flex items-center justify-center gap-2 border-t border-gray-7 px-3 py-3 dark:border-gray-2"
            aria-label={
              isFrench ? 'Pagination du carrousel' : 'Carousel pagination'
            }
          >
            {visibleSlides.map((item, dotIndex) => (
              <button
                key={item._key || `${item.title}-${dotIndex}`}
                type="button"
                onClick={() => setIndex(dotIndex)}
                className={cn(
                  'h-2.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue focus-visible:ring-offset-2',
                  dotIndex === index
                    ? 'w-7 bg-apple-blue'
                    : 'w-2.5 bg-gray-5 hover:bg-gray-4 dark:bg-gray-3',
                )}
                aria-label={`${isFrench ? 'Afficher la diapositive' : 'Show slide'} ${dotIndex + 1}`}
                aria-current={dotIndex === index ? 'true' : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
