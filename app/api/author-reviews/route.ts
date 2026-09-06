import { NextRequest, NextResponse } from 'next/server'

import { isConfigured } from '@/lib/sanity.api'
import { getApprovedAuthorReviews, getClient } from '@/lib/sanity.client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const buckets = new Map<string, number[]>()

function limited(ip: string) {
  const now = Date.now()
  const recent = (buckets.get(ip) || []).filter((time) => now - time < 60_000)
  if (recent.length >= 5) {
    buckets.set(ip, recent)
    return true
  }
  buckets.set(ip, [now, ...recent])
  return false
}

export async function GET(req: NextRequest) {
  const authorSlug = req.nextUrl.searchParams.get('author')
  if (!authorSlug)
    return NextResponse.json(
      { reviews: [], average: 0, total: 0 },
      { status: 400 },
    )
  if (!isConfigured)
    return NextResponse.json({ reviews: [], average: 0, total: 0 })
  try {
    const reviews = await getApprovedAuthorReviews(getClient(), authorSlug)
    const average = reviews.length
      ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
        reviews.length
      : 0
    const distribution = [5, 4, 3, 2, 1].reduce<Record<string, number>>(
      (all, rating) => {
        all[String(rating)] = reviews.filter(
          (review) => review.rating === rating,
        ).length
        return all
      },
      {},
    )
    return NextResponse.json({
      reviews,
      average,
      total: reviews.length,
      distribution,
    })
  } catch {
    return NextResponse.json({ reviews: [], average: 0, total: 0 })
  }
}

export async function POST(req: NextRequest) {
  let body: {
    authorSlug?: string
    name?: string
    rating?: number
    title?: string
    content?: string
    website?: string
  } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  if (body.website) return NextResponse.json({ ok: true }, { status: 201 })
  const rating = Number(body.rating)
  if (
    !body.authorSlug ||
    !body.name?.trim() ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return NextResponse.json(
      { error: 'Missing or invalid fields' },
      { status: 400 },
    )
  }
  if (body.content && body.content.trim().length > 1200) {
    return NextResponse.json({ error: 'Review is too long' }, { status: 413 })
  }
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || 'local'
  if (limited(ip)) {
    return NextResponse.json(
      { error: 'Too many ratings, please try later' },
      { status: 429 },
    )
  }
  const token = process.env.SANITY_API_WRITE_TOKEN
  if (!isConfigured || !token) {
    return NextResponse.json({ ok: true, queued: true }, { status: 202 })
  }
  try {
    const client = getClient({ token, perspective: 'drafts' } as any)
    const author = await client.fetch(
      '*[_type == "author" && slug.current == $slug][0]{_id}',
      { slug: body.authorSlug },
    )
    if (!author?._id)
      return NextResponse.json({ error: 'Author not found' }, { status: 404 })
    await client.create({
      _type: 'authorReview',
      author: { _type: 'reference', _ref: author._id },
      name: body.name.trim().slice(0, 80),
      rating,
      title: body.title?.trim().slice(0, 120),
      content: body.content?.trim().slice(0, 1200) || 'Rated this author.',
      status: 'pending',
      createdAt: new Date().toISOString(),
    })
    return NextResponse.json({ ok: true, pending: true }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Failed to save rating' },
      { status: 500 },
    )
  }
}
