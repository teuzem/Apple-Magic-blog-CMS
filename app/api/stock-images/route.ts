import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim()
  const page = Math.min(
    Math.max(Number(request.nextUrl.searchParams.get('page')) || 1, 1),
    20,
  )
  if (!query || query.length < 2) {
    return NextResponse.json({ results: [], providers: providerStatus() })
  }

  const [pexels, pixabay] = await Promise.all([
    searchPexels(query, page),
    searchPixabay(query, page),
  ])

  return NextResponse.json(
    {
      results: [...pexels, ...pixabay].slice(0, 48),
      providers: providerStatus(),
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      },
    },
  )
}

function providerStatus() {
  return {
    pexels: Boolean(process.env.PEXELS_API_KEY),
    pixabay: Boolean(process.env.PIXABAY_API_KEY),
  }
}

async function searchPexels(query: string, page: number) {
  const key = process.env.PEXELS_API_KEY
  if (!key) return []
  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=${page}&per_page=24`,
      { headers: { Authorization: key }, next: { revalidate: 60 } },
    )
    if (!response.ok) return []
    const data = await response.json()
    return (data.photos || []).map((photo: any) => ({
      id: `pexels-${photo.id}`,
      provider: 'Pexels',
      sourceId: String(photo.id),
      sourceUrl: photo.url,
      photographer: photo.photographer,
      thumbnailUrl: photo.src?.medium,
      downloadUrl: photo.src?.original || photo.src?.large2x,
      width: photo.width,
      height: photo.height,
      alt: photo.alt || query,
    }))
  } catch {
    return []
  }
}

async function searchPixabay(query: string, page: number) {
  const key = process.env.PIXABAY_API_KEY
  if (!key) return []
  try {
    const response = await fetch(
      `https://pixabay.com/api/?key=${encodeURIComponent(key)}&q=${encodeURIComponent(query)}&page=${page}&per_page=24&image_type=photo&safesearch=true`,
      { next: { revalidate: 60 } },
    )
    if (!response.ok) return []
    const data = await response.json()
    return (data.hits || []).map((photo: any) => ({
      id: `pixabay-${photo.id}`,
      provider: 'Pixabay',
      sourceId: String(photo.id),
      sourceUrl: photo.pageURL,
      photographer: photo.user,
      thumbnailUrl: photo.webformatURL,
      downloadUrl: photo.largeImageURL || photo.webformatURL,
      width: photo.imageWidth,
      height: photo.imageHeight,
      alt: photo.tags || query,
    }))
  } catch {
    return []
  }
}
