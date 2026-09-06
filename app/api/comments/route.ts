import { NextRequest, NextResponse } from 'next/server'

import { isConfigured } from '@/lib/sanity.api'
import { getApprovedComments, getClient } from '@/lib/sanity.client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_IMAGES = 10
const MAX_IMAGE_BYTES = 5 * 1024 * 1024 // 5 MB
const MAX_CONTENT = 2000

// Simple in-memory rate limiting per IP (for the process lifetime).
const rateBuckets = new Map<string, number[]>()
const RATE_WINDOW_MS = 60 * 1000 // 1 minute
const RATE_LIMIT = 5 // max submissions per minute

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const bucket = (rateBuckets.get(ip) || []).filter(
    (t) => now - t < RATE_WINDOW_MS,
  )
  if (bucket.length >= RATE_LIMIT) {
    rateBuckets.set(ip, bucket)
    return true
  }
  const next = [now, ...bucket]
  rateBuckets.set(ip, next)
  return false
}

function ipOf(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for')
  return fwd ? fwd.split(',')[0].trim() : 'local'
}

/** Basic moderation: reject gross spam (too many links, blocked words). */
function moderate(content: string, name: string): string | null {
  const text = `${name} ${content}`.toLowerCase()
  const linkCount = (text.match(/(https?:\/\/|www\.)/g) || []).length
  if (linkCount > 4) return 'Too many links'
  const blocked = [
    'viagra',
    'casino',
    'crypto give',
    'follow me for',
    'free money',
    'insurance quote',
  ]
  if (blocked.some((w) => text.includes(w))) return 'Blocked content'
  if (name.trim().length > 60) return 'Name too long'
  return null
}

function writeClient() {
  return getClient({
    token: process.env.SANITY_API_WRITE_TOKEN,
    perspective: 'drafts',
  } as any)
}

/**
 * Comments API.
 * GET   /api/comments?post=postId    → approved comments (incl. replies)
 * POST  /api/comments                → create a pending comment (with images)
 * PATCH /api/comments                → react (like / dislike / share)
 */
export async function GET(req: NextRequest) {
  const postId = req.nextUrl.searchParams.get('post')
  if (!postId) {
    return NextResponse.json({ error: 'Missing post' }, { status: 400 })
  }
  if (!isConfigured) {
    return NextResponse.json({ comments: [] })
  }
  try {
    const client = getClient()
    const comments = await getApprovedComments(client, postId)
    return NextResponse.json({
      comments,
      // Client can use share base URL to improve share links.
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || '',
    })
  } catch (error) {
    console.error('Comment fetch failed', error)
    return NextResponse.json({ comments: [] })
  }
}

export async function POST(req: NextRequest) {
  let body: {
    postId?: string
    name?: string
    email?: string
    content?: string
    parent?: string
    images?: string[] // array of data URLs
  } = {}
  try {
    body = await req.json()
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { postId, name, email, content, parent } = body
  const images = Array.isArray(body.images) ? body.images : []

  if (!postId || !name?.trim() || !content?.trim()) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 },
    )
  }
  if (content.trim().length > MAX_CONTENT) {
    return NextResponse.json({ error: 'Comment too long' }, { status: 413 })
  }

  const writeToken = process.env.SANITY_API_WRITE_TOKEN
  if (!isConfigured || !writeToken) {
    return NextResponse.json(
      {
        ok: true,
        queued: true,
        message: 'Not persisted — configure SANITY_API_WRITE_TOKEN',
      },
      { status: 202 },
    )
  }

  const rateMsg = moderate(content.trim(), name.trim())
  if (rateMsg) {
    return NextResponse.json({ error: rateMsg }, { status: 422 })
  }
  if (rateLimited(ipOf(req))) {
    return NextResponse.json(
      { error: 'Too many comments, slow down' },
      { status: 429 },
    )
  }
  if (images.length > MAX_IMAGES) {
    return NextResponse.json(
      { error: `Maximum ${MAX_IMAGES} images per comment` },
      { status: 422 },
    )
  }

  const client = writeClient()

  try {
    // Upload comment images (data URLs) to Sanity assets.
    const uploaded: any[] = []
    for (const dataUrl of images) {
      if (!dataUrl || typeof dataUrl !== 'string') continue
      const match = /^data:([^;,]+);base64,(.+)$/.exec(dataUrl)
      if (!match) continue
      const mime = match[1]
      const buf = Buffer.from(match[2], 'base64')
      if (buf.byteLength > MAX_IMAGE_BYTES) continue
      const asset = await client.assets.upload('image', buf, {
        contentType: mime,
        filename: `comment-${Date.now()}.${extFromMime(mime)}`,
      })
      uploaded.push({
        _type: 'image',
        _key: `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        asset: { _type: 'reference', _ref: asset._id },
      })
    }

    const doc: any = {
      _type: 'comment',
      post: { _type: 'reference', _ref: postId },
      name: name.trim(),
      content: content.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      shares: 0,
    }
    if (email?.trim()) doc.email = email.trim()
    if (parent) doc.parent = { _type: 'reference', _ref: parent }
    if (uploaded.length) doc.images = uploaded

    await client.create(doc)
    return NextResponse.json(
      { ok: true, queued: true, images: uploaded.length },
      { status: 201 },
    )
  } catch (error) {
    console.error('Comment create failed', error)
    return NextResponse.json(
      { error: 'Failed to save comment' },
      { status: 500 },
    )
  }
}

export async function PATCH(req: NextRequest) {
  let body: { id?: string; action?: 'like' | 'dislike' | 'share' } = {}
  try {
    body = await req.json()
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { id, action } = body
  if (!id || !action) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  if (action !== 'like' && action !== 'dislike' && action !== 'share') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const writeToken = process.env.SANITY_API_WRITE_TOKEN
  if (!isConfigured || !writeToken) {
    return NextResponse.json({ error: 'Comments disabled' }, { status: 503 })
  }
  if (rateLimited(ipOf(req))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const field =
    action === 'share' ? 'shares' : action === 'like' ? 'likes' : 'dislikes'

  try {
    const client = writeClient()
    const current = await client.fetch(
      `*[_type == "comment" && _id == $id][0]{ ${field} }`,
      { id },
    )
    const nextValue = Number(current?.[field] || 0) + 1
    await client
      .patch(id)
      .set({ [field]: nextValue })
      .commit()
    return NextResponse.json({ ok: true, [field]: nextValue })
  } catch (error) {
    console.error('Comment react failed', error)
    return NextResponse.json({ error: 'Failed to react' }, { status: 500 })
  }
}

function extFromMime(mime: string): string {
  switch (mime) {
    case 'image/png':
      return 'png'
    case 'image/webp':
      return 'webp'
    case 'image/gif':
      return 'gif'
    case 'image/jpeg':
    default:
      return 'jpg'
  }
}
