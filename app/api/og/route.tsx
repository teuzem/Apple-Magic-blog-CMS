import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

// Load the Inter font for crisp OG images from Google Fonts.
// (A local `public/` woff can't be bundled into an edge route, so the
// standard Satori approach is to fetch the font over the network.)
async function loadInterFont(): Promise<ArrayBuffer> {
  const css = await (
    await fetch(
      'https://fonts.googleapis.com/css2?family=Inter:wght@600;700&display=swap',
      { headers: { 'User-Agent': 'Mozilla/5.0' } },
    )
  ).text()
  // Extract the first woff2 URL from the returned CSS
  const urlMatch = css.match(/url\((https:\/\/[^)]+\.woff2)\)/)
  const fontUrl = urlMatch?.[1]
  if (!fontUrl) {
    throw new Error('Could not resolve Inter font URL')
  }
  const res = await fetch(fontUrl)
  return res.arrayBuffer()
}

/**
 * Dynamic Open Graph image generation with Apple Magic branding.
 * Usage: /api/og?title=Hello&category=iPhone&type=article
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title')?.slice(0, 90) || 'Apple Magic Blog'
  const category = searchParams.get('category')?.toUpperCase() || 'APPLE MAGIC'
  const type = searchParams.get('type') || 'ARTICLE'

  try {
    const fontData = await loadInterFont()

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            height: '100%',
            width: '100%',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background:
              'radial-gradient(circle at 20% 20%, #1a1a1a 0%, #000 70%)',
            color: '#fff',
            padding: '80px',
            fontFamily: 'Inter',
          }}
        >
          {/* subtle magic gradient glow */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(circle at 75% 20%, rgba(191,90,242,0.35), transparent 50%), radial-gradient(circle at 20% 80%, rgba(41,151,255,0.35), transparent 50%)',
            }}
          />
          {/* star sparkle */}
          <svg
            style={{ position: 'absolute', top: 60, right: 90 }}
            viewBox="0 0 40 40"
            width="48"
            height="48"
            fill="#bf5af2"
          >
            <path d="M20 2c1.2 6 3 8.8 6.5 11.5C25 17 22.2 18.8 20 20c-2.2-1.2-5-3-6.5-6.5C17 10.8 18.8 8 20 2z" />
            <path d="M33 16c.8 4 2 5.9 4.3 7.7-2.3 1.8-3.5 3.7-4.3 7.7-.8-4-2-5.9-4.3-7.7 2.3-1.8 3.5-3.7 4.3-7.7z" />
          </svg>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginBottom: 20,
              fontSize: 22,
              letterSpacing: 4,
              color: '#2997ff',
              fontWeight: 600,
            }}
          >
            {/* apple glyph */}
            <svg viewBox="0 0 40 44" width="26" height="28" fill="#fff">
              <path
                d="M33.5 25.9c-.2-4.7 3.8-7 4-7.1-2.2-3.2-5.6-3.6-6.8-3.7-2.9-.3-5.6 1.7-7.1 1.7-1.5 0-3.8-1.7-6.3-1.6-3.2.1-6.2 1.9-7.9 4.8-3.4 5.8-.9 14.4 2.4 19.1 1.6 2.3 3.5 4.9 6 4.8 2.4-.1 3.3-1.6 6.2-1.6 2.9 0 3.7 1.6 6.2 1.5 2.6-.1 4.2-2.4 5.8-4.7 1.8-2.6 2.5-5.2 2.6-5.3-.1-.1-5-1.9-5.1-7.9z"
                transform="translate(-2 1.5)"
              />
              <path
                d="M30.4 6.9c1.3-1.6 2.2-3.8 2-6-1.9.1-4.2 1.3-5.6 2.9-1.2 1.4-2.3 3.7-2 5.9 2.1.2 4.3-1.2 5.6-2.8z"
                transform="translate(-2 1.5)"
              />
            </svg>
            APPLE MAGIC · {category}
          </div>

          <div
            style={{
              fontSize: 60,
              fontWeight: 700,
              textAlign: 'center',
              lineHeight: 1.1,
              maxWidth: 900,
              letterSpacing: -2,
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {title}
          </div>

          <div
            style={{
              marginTop: 30,
              display: 'flex',
              gap: 12,
              fontSize: 18,
              color: '#86868b',
              letterSpacing: 2,
            }}
          >
            {type} · The magic of Apple, decoded
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Inter',
            data: fontData,
            style: 'normal',
            weight: 700,
          },
        ],
      },
    )
  } catch (error) {
    console.error('OG generation failed', error)
    return new Response('Failed to generate OG image', { status: 500 })
  }
}
