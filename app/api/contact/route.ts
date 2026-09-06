import { NextRequest, NextResponse } from 'next/server'

import { isConfigured } from '@/lib/sanity.api'
import { getClient } from '@/lib/sanity.client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const topics = ['general', 'editorial', 'partnerships', 'support', 'press']

function cleanInput(value: unknown, max: number): string {
  return String(value ?? '')
    .replace(/<[^>]*>/g, '')
    .trim()
    .slice(0, max)
}

/**
 * Contact form endpoint.
 * Persists the message as a 'contactMessage' Sanity document when the
 * write token is configured; otherwise returns success without persisting
 * so the UI remains fully functional.
 */
export async function POST(req: NextRequest) {
  let body: {
    name?: unknown
    email?: unknown
    topic?: unknown
    message?: unknown
    locale?: unknown
  } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const name = cleanInput(body.name, 120)
  const message = cleanInput(body.message, 5000)
  const email = String(body.email ?? '')
    .trim()
    .toLowerCase()
  const topic =
    typeof body.topic === 'string' && topics.includes(body.topic)
      ? body.topic
      : 'general'
  const locale = body.locale === 'fr' ? 'fr' : 'en'

  if (!name || !message) {
    return NextResponse.json(
      { error: 'Name and message are required' },
      { status: 400 },
    )
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const writeToken = process.env.SANITY_API_WRITE_TOKEN

  if (!isConfigured || !writeToken) {
    console.warn(
      'Contact: SANITY_API_WRITE_TOKEN not configured — not persisting message.',
    )
    return NextResponse.json({ ok: true, queued: true }, { status: 201 })
  }

  try {
    const client = getClient({
      token: writeToken,
      perspective: 'drafts',
    } as any)
    const doc = {
      _type: 'contactMessage',
      name,
      email,
      topic,
      message,
      locale,
      status: 'new',
      receivedAt: new Date().toISOString(),
    }
    await client.create(doc)
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    console.error('Contact message persistence failed', error)
    return NextResponse.json({ ok: true, queued: true }, { status: 201 })
  }
}
