import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SECRET = process.env.SANITY_REVALIDATE_SECRET

/**
 * Sanity webhook receiver for on-demand ISR.
 *
 * Configure a Sanity webhook → POST → https://YOUR_SITE/api/revalidate
 * with a secret header matching SANITY_REVALIDATE_SECRET.
 *
 * Payload example:
 *   { "_type": "post", "slug": { "current": "my-post" }, "operation": "create" }
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const type = body?._type
  const operation = body?.operation || 'update'
  const slug = body?.slug?.current || body?.slug

  // Optional auth — validate a custom header if a secret is configured
  if (SECRET) {
    const auth = req.headers.get('authorization')
    const provided = auth?.replace(/^Bearer\s+/i, '')
    if (provided !== SECRET) {
      return NextResponse.json(
        { ok: false, error: 'Invalid secret' },
        { status: 401 },
      )
    }
  }

  try {
    if (type === 'post') {
      revalidatePath('/en')
      revalidatePath('/fr')
      if (slug) {
        revalidatePath(`/en/posts/${slug}`)
        revalidatePath(`/fr/posts/${slug}`)
      }
      revalidatePath('/en/search')
      revalidatePath('/fr/search')
    } else if (
      type === 'category' ||
      type === 'tag' ||
      type === 'navigation' ||
      type === 'settings' ||
      type === 'author' ||
      type === 'product'
    ) {
      // Invalidate everything that depends on these shared types
      revalidatePath('/en')
      revalidatePath('/fr')
      revalidatePath('/en/search')
      revalidatePath('/fr/search')
    }

    return NextResponse.json({
      ok: true,
      revalidated: [type, operation, slug].filter(Boolean),
    })
  } catch (error) {
    console.error('Revalidation failed', error)
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 },
    )
  }
}
