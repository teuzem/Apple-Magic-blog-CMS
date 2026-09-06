import { NextRequest, NextResponse } from 'next/server'

import { isConfigured } from '@/lib/sanity.api'
import { getClient } from '@/lib/sanity.client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const postId = typeof body.postId === 'string' ? body.postId : ''
  const value = Number(body.value)
  if (!postId || !Number.isFinite(value) || value < 0 || value > 10) {
    return NextResponse.json({ error: 'Invalid vote' }, { status: 400 })
  }
  const token = process.env.SANITY_API_WRITE_TOKEN
  if (!isConfigured || !token)
    return NextResponse.json({ error: 'Voting unavailable' }, { status: 503 })
  const client = getClient({ token, perspective: 'drafts' } as any)
  const current = await client.fetch(
    `*[_id == $postId][0]{verdictVoteTotal, verdictVoteCount}`,
    { postId },
  )
  const total = Number(current?.verdictVoteTotal || 0) + value
  const count = Number(current?.verdictVoteCount || 0) + 1
  await client
    .patch(postId)
    .set({ verdictVoteTotal: total, verdictVoteCount: count })
    .commit()
  return NextResponse.json({ average: total / count, count })
}
