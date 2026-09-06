'use client'

import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import SanityImage from '@/components/sanity/SanityImage'

export default function ProductMediaGallery({
  images,
  productName,
}: {
  images: any[]
  productName: string
}) {
  const media = useMemo(() => images.filter(Boolean), [images])
  const [current, setCurrent] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [zoomed, setZoomed] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)

  const previous = () =>
    setCurrent((value) => (value - 1 + media.length) % media.length)
  const next = () => setCurrent((value) => (value + 1) % media.length)

  useEffect(() => {
    if (!lightbox) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightbox(false)
      if (event.key === 'ArrowLeft') previous()
      if (event.key === 'ArrowRight') next()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  })

  if (!media.length) return null
  const active = media[current]

  const image = (asset: any, index: number, modal = false) => (
    <SanityImage
      asset={asset?.image || asset}
      alt={asset?.alt || `${productName} view ${index + 1}`}
      fill
      rounded={false}
      sizes={modal ? '100vw' : '(max-width: 1024px) 100vw, 50vw'}
      className={`object-contain transition-transform duration-300 ${modal && zoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'}`}
    />
  )

  return (
    <>
      <div
        className="relative aspect-square w-full min-w-0 overflow-hidden rounded-lg bg-gray-7 dark:bg-gray-1"
        onTouchStart={(event) => setTouchStart(event.touches[0].clientX)}
        onTouchEnd={(event) => {
          if (touchStart === null) return
          const delta = event.changedTouches[0].clientX - touchStart
          if (Math.abs(delta) > 45) delta > 0 ? previous() : next()
          setTouchStart(null)
        }}
      >
        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="absolute inset-0 z-10"
          aria-label={`Enlarge ${productName} image ${current + 1}`}
        />
        {image(active, current)}
        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="absolute top-3 right-3 z-20 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-ink shadow-sm backdrop-blur hover:bg-white sm:top-4 sm:right-4"
          aria-label="Open full screen"
        >
          <Maximize2 size={18} />
        </button>
        {media.length > 1 && (
          <>
            <button
              type="button"
              onClick={previous}
              className="absolute top-1/2 left-2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-sm hover:bg-white sm:left-4"
              aria-label="Previous image"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute top-1/2 right-2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-sm hover:bg-white sm:right-4"
              aria-label="Next image"
            >
              <ChevronRight size={22} />
            </button>
            <span className="absolute right-3 bottom-3 z-20 rounded-full bg-black/65 px-3 py-1 text-xs font-medium text-white sm:right-4 sm:bottom-4">
              {current + 1} / {media.length}
            </span>
          </>
        )}
      </div>
      {media.length > 1 && (
        <div className="mt-3 flex max-w-full snap-x gap-2 overflow-x-auto overscroll-x-contain pb-2">
          {media.map((asset, index) => (
            <button
              key={asset?._key || index}
              type="button"
              onClick={() => setCurrent(index)}
              className={`relative h-16 w-16 shrink-0 snap-start overflow-hidden rounded-md border-2 bg-gray-7 sm:h-20 sm:w-20 ${index === current ? 'border-apple-blue' : 'border-transparent opacity-65 hover:opacity-100'}`}
              aria-label={`Show image ${index + 1}`}
            >
              {image(asset, index)}
            </button>
          ))}
        </div>
      )}
      {lightbox && (
        <div className="fixed inset-0 z-[100] overflow-hidden bg-black/95">
          <div
            className="relative h-full w-full"
            onClick={() => setZoomed((value) => !value)}
          >
            {image(active, current, true)}
          </div>
          <button
            type="button"
            onClick={() => setLightbox(false)}
            className="absolute top-[max(0.75rem,env(safe-area-inset-top))] right-3 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25 sm:top-5 sm:right-5"
            aria-label="Close full screen"
          >
            <X size={24} />
          </button>
          <button
            type="button"
            onClick={() => setZoomed((value) => !value)}
            className="absolute top-[max(0.75rem,env(safe-area-inset-top))] left-3 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25 sm:top-5 sm:left-5"
            aria-label={zoomed ? 'Zoom out' : 'Zoom in'}
          >
            {zoomed ? <ZoomOut size={22} /> : <ZoomIn size={22} />}
          </button>
          {media.length > 1 && (
            <>
              <button
                type="button"
                onClick={previous}
                className="absolute top-1/2 left-2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25 sm:left-5 sm:h-12 sm:w-12"
                aria-label="Previous image"
              >
                <ChevronLeft size={28} />
              </button>
              <button
                type="button"
                onClick={next}
                className="absolute top-1/2 right-2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25 sm:right-5 sm:h-12 sm:w-12"
                aria-label="Next image"
              >
                <ChevronRight size={28} />
              </button>
            </>
          )}
        </div>
      )}
    </>
  )
}
