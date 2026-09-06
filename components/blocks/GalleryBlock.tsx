'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

import SanityImage from '@/components/sanity/SanityImage'
import { cn } from '@/lib/utils'

interface GalleryBlockProps {
  block: {
    images?: any[]
    caption?: string
  }
}

/**
 * A lightweight image gallery with prev/next navigation and a lightbox-able
 * large preview. No external deps — uses the optimized SanityImage.
 */
export default function GalleryBlock({ block }: GalleryBlockProps) {
  const images = block.images || []
  const [current, setCurrent] = useState(0)

  if (images.length === 0) return null

  const active = images[current]

  return (
    <div className="my-8 min-w-0 max-w-full">
      <div className="relative max-w-full overflow-hidden rounded-lg">
        <div className="relative aspect-[16/9] w-full">
          <SanityImage
            asset={active}
            alt={block.caption || ''}
            fill
            rounded={false}
          />
        </div>

        {images.length > 1 && (
          <>
            <button
              aria-label="Previous image"
              onClick={() =>
                setCurrent((c) => (c - 1 + images.length) % images.length)
              }
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur transition-colors hover:bg-black/70"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              aria-label="Next image"
              onClick={() => setCurrent((c) => (c + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur transition-colors hover:bg-black/70"
            >
              <ChevronRight size={20} />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur">
              {current + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex max-w-full snap-x gap-2 overflow-x-auto overscroll-x-contain pb-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                'relative h-16 w-24 shrink-0 snap-start overflow-hidden rounded-md transition-opacity',
                i === current
                  ? 'opacity-100 ring-2 ring-apple-blue'
                  : 'opacity-50 hover:opacity-80',
              )}
            >
              <SanityImage asset={img} alt={''} fill rounded={false} />
            </button>
          ))}
        </div>
      )}

      {block.caption && (
        <p className="mt-2 text-center text-[0.8125rem] text-gray-3 dark:text-gray-4">
          {block.caption}
        </p>
      )}
    </div>
  )
}
