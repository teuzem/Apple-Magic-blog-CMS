'use client'

import { ArrowRight, Star, Store } from 'lucide-react'

import SanityImage from '@/components/sanity/SanityImage'
import { Badge } from '@/components/ui/Badge'
import Price from '@/components/ui/Price'
import { Link } from '@/i18n/navigation'
import type { Product } from '@/lib/sanity.queries'

interface ProductCardBlockProps {
  block: {
    product?: Product
    title?: string
    tagline?: string
    _ref?: string
  }
  product?: Product
  locale?: string
}

const BUY_LABEL: Record<string, string> = {
  en: 'Buy on Apple Magic',
  fr: 'Acheter sur Apple Magic',
}
const REVIEW_LABEL: Record<string, string> = {
  en: 'Read the review',
  fr: 'Lire la revue',
}

/**
 * Renders a product card block. The block may carry the product via a
 * GROQ-resolved reference (passed through `product`) or just the _ref.
 */
export default function ProductCardBlock({
  block,
  product,
  locale = 'en',
}: ProductCardBlockProps) {
  const lang = locale === 'fr' ? 'fr' : 'en'
  const resolved = product ?? block.product
  if (!resolved || !resolved.slug) return null

  const title = block.title || resolved.name
  const tagline = block.tagline || resolved.tagline
  const firstImage = Array.isArray(resolved.images)
    ? resolved.images[0]
    : resolved.images
  const xaf = resolved.pricing?.XAF
  const hasStoreUrl = Boolean(resolved.storeUrl)

  return (
    <div className="group my-8 overflow-hidden rounded-xl border border-gray-7 bg-white transition-colors hover:border-apple-blue/30 dark:border-gray-2 dark:bg-gray-1">
      <div className="flex flex-col gap-0 sm:flex-row">
        <Link
          href={`/products/${resolved.slug}` as any}
          className="relative block h-44 w-full shrink-0 overflow-hidden bg-gray-7 sm:h-auto sm:w-60 dark:bg-gray-1"
        >
          {firstImage ? (
            <SanityImage
              asset={firstImage}
              alt={title || ''}
              fill
              rounded={false}
              className="transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-magic-gradient">
              <span className="text-sm font-semibold text-white">
                {title?.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
        </Link>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex flex-wrap items-center gap-2">
            {resolved.category?.title && (
              <Badge color={resolved.category.color}>
                {resolved.category.title}
              </Badge>
            )}
            {resolved.rating ? (
              <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-500">
                <Star size={14} fill="currentColor" /> {resolved.rating}
              </span>
            ) : null}
          </div>

          <Link href={`/products/${resolved.slug}` as any} className="w-fit">
            <h4 className="text-lg font-semibold leading-tight text-ink transition-colors group-hover:text-apple-blue dark:text-white">
              {title}
            </h4>
          </Link>

          {tagline && (
            <p className="text-[0.875rem] leading-relaxed text-gray-3 dark:text-gray-4">
              {tagline}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Price xaf={xaf} className="text-lg" />
            {resolved.specs && resolved.specs.length > 0 && (
              <span className="text-[0.8125rem] text-gray-3 dark:text-gray-4">
                {resolved.specs
                  .map((s) => s?.value)
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            )}
          </div>

          <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
            {hasStoreUrl ? (
              <a
                href={resolved.storeUrl}
                target="_blank"
                rel="noopener noreferrer sponsored nofollow"
                className="inline-flex items-center gap-2 rounded-full bg-apple-blue px-5 py-2.5 text-[0.875rem] font-semibold text-white transition-all hover:bg-apple-blue-hover"
              >
                <Store size={15} /> {BUY_LABEL[lang]}
              </a>
            ) : null}
            <Link
              href={`/products/${resolved.slug}` as any}
              className="inline-flex items-center gap-1.5 text-[0.875rem] font-medium text-apple-blue"
            >
              {REVIEW_LABEL[lang]} <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
