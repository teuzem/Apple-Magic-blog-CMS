'use client'

import Image from 'next/image'

import { urlForImage } from '@/lib/sanity.image'
import { cn } from '@/lib/utils'

interface SanityImageProps {
  asset: any
  alt?: string
  width?: number
  height?: number
  sizes?: string
  priority?: boolean
  className?: string
  fill?: boolean
  caption?: string
  rounded?: boolean
  eager?: boolean
}

/**
 * The site's image component: converts Sanity image assets into optimized
 * Next.js <Image> with responsive srcset, aspect ratios, and a skeleton
 * while loading.
 */
export default function SanityImage({
  asset,
  alt = '',
  width = 1200,
  height = 800,
  sizes = '(max-width: 768px) 100vw, 1200px',
  priority = false,
  className,
  fill = false,
  caption,
  rounded = true,
  eager = false,
}: SanityImageProps) {
  if (!asset) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gray-7 dark:bg-gray-1',
          rounded && 'rounded-xl',
          className,
        )}
        style={fill ? undefined : { aspectRatio: `${width} / ${height}` }}
      >
        <span className="text-sm text-gray-3">No image</span>
      </div>
    )
  }

  const src = typeof asset === 'string' ? asset : urlForImage(asset).url()

  const img = (
    <Image
      src={src}
      alt={alt || caption || ''}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      sizes={sizes}
      priority={priority || eager}
      fill={fill}
      className={cn('object-cover opacity-100', className)}
    />
  )

  if (caption) {
    return (
      <figure className="space-y-2">
        {img}
        <figcaption className="text-center text-[0.8125rem] text-gray-3 dark:text-gray-4">
          {caption}
        </figcaption>
      </figure>
    )
  }

  // Wrap in a relative container with a plain background; the image is
  // always visible (never hidden by opacity) so cards can't appear blank.
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-gray-7 dark:bg-gray-1',
        fill && 'h-full w-full',
        rounded && 'rounded-xl',
      )}
      style={fill ? undefined : { aspectRatio: `${width} / ${height}` }}
    >
      {img}
    </div>
  )
}
