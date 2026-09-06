'use client'

import { createClient } from '@sanity/client'
import { Star } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ProductRatingSnapshot {
  rating?: number
  reviewCount?: number
}

export default function ProductLiveRating({
  slug,
  initialRating,
  initialReviewCount,
}: {
  slug: string
  initialRating?: number
  initialReviewCount?: number
}) {
  const [rating, setRating] = useState(initialRating)
  const [count, setCount] = useState(initialReviewCount)

  useEffect(() => {
    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
    const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
    if (!projectId) return
    const client = createClient({
      projectId,
      dataset,
      apiVersion: '2026-09-03',
      useCdn: false,
    })
    const query = `*[_type == "product" && slug.current == $slug][0]{rating,reviewCount}`
    const subscription = client
      .listen<ProductRatingSnapshot>(query, { slug }, { includeResult: true })
      .subscribe((event) => {
        if (event.type !== 'mutation') return
        const next = event.result
        if (next) {
          setRating(next.rating)
          setCount(next.reviewCount)
        }
      })
    return () => subscription.unsubscribe()
  }, [slug])

  if (!rating) return null
  return (
    <div className="mt-4 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
      <span className="flex shrink-0 gap-0.5 text-amber-500">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={18}
            fill={i < Math.round(rating) ? 'currentColor' : 'none'}
          />
        ))}
      </span>
      <span className="text-sm font-medium text-ink dark:text-white">
        {rating.toFixed(1)}
      </span>
      {count ? (
        <span className="break-words text-sm text-gray-3">
          {count.toLocaleString()} reviews
        </span>
      ) : null}
    </div>
  )
}
