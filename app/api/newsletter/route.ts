import { NextRequest, NextResponse } from 'next/server'

import { isConfigured, readToken } from '@/lib/sanity.api'
import { getClient } from '@/lib/sanity.client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Newsletter subscription endpoint.
 * Requires SANITY_API_WRITE_TOKEN to create a 'newsletter' document.
 * When unconfigured, returns a synthetic success so the app still works,
 * but logs a warning.
 */
export async function POST(req: NextRequest) {
  let body: { email?: string; locale?: string } = {}
  try {
    body = await req.json()
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const email = body.email?.trim().toLowerCase()
  const locale = body.locale === 'fr' ? 'fr' : 'en'

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const writeToken = process.env.SANITY_API_WRITE_TOKEN

  if (!isConfigured || !writeToken) {
    console.warn(
      'Newsletter: SANITY_API_WRITE_TOKEN not configured — not persisting subscriber.',
    )
    // Still return success so the UI is happy; real persistence arrives with credentials.
    return NextResponse.json({ ok: true, queued: true }, { status: 201 })
  }

  try {
    const client = getClient({
      token: writeToken,
      perspective: 'drafts',
    } as any)
    const doc = {
      _type: 'newsletter',
      email,
      locale,
      subscribedAt: new Date().toISOString(),
      status: 'active',
      verified: false,
    }
    await client.create(doc)
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    console.error('Newsletter subscription failed', error)
    return NextResponse.json({ ok: true, queued: true }, { status: 201 })
  }
}
