import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim()
  const page = Math.min(
    Math.max(Number(request.nextUrl.searchParams.get('page')) || 1, 1),
    20,
  )
  if (!query || query.length < 2)
    return NextResponse.json({ results: [], providers: providerStatus() })

  const [pexels, pixabay] = await Promise.all([
    searchPexelsVideos(query, page),
    searchPixabayVideos(query, page),
  ])
  return NextResponse.json(
    {
      results: [...pexels, ...pixabay].slice(0, 36),
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

async function searchPexelsVideos(query: string, page: number) {
  const key = process.env.PEXELS_API_KEY
  if (!key) return []
  try {
    const response = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&page=${page}&per_page=18`,
      { headers: { Authorization: key }, next: { revalidate: 60 } },
    )
    if (!response.ok) return []
    const data = await response.json()
    return (data.videos || [])
      .map((video: any) => {
        const files = [...(video.video_files || [])].sort(
          (a: any, b: any) =>
            Math.abs((a.width || 0) - 1280) - Math.abs((b.width || 0) - 1280),
        )
        const file = files.find((item: any) => item.link) || files[0]
        return {
          id: `pexels-video-${video.id}`,
          provider: 'Pexels',
          sourceId: String(video.id),
          sourceUrl: video.url,
          creator: video.user?.name,
          thumbnailUrl: video.image || video.video_pictures?.[0]?.picture,
          videoUrl: file?.link,
          width: file?.width || video.width,
          height: file?.height || video.height,
          duration: video.duration,
          query,
        }
      })
      .filter((video: any) => video.videoUrl)
  } catch {
    return []
  }
}

async function searchPixabayVideos(query: string, page: number) {
  const key = process.env.PIXABAY_API_KEY
  if (!key) return []
  try {
    const response = await fetch(
      `https://pixabay.com/api/videos/?key=${encodeURIComponent(key)}&q=${encodeURIComponent(query)}&page=${page}&per_page=18&safesearch=true`,
      { next: { revalidate: 60 } },
    )
    if (!response.ok) return []
    const data = await response.json()
    return (data.hits || [])
      .map((video: any) => {
        const file =
          video.videos?.medium || video.videos?.large || video.videos?.small
        return {
          id: `pixabay-video-${video.id}`,
          provider: 'Pixabay',
          sourceId: String(video.id),
          sourceUrl: video.pageURL,
          creator: video.user,
          thumbnailUrl: video.picture_id
            ? `https://i.vimeocdn.com/video/${video.picture_id}_640x360.jpg`
            : undefined,
          videoUrl: file?.url,
          width: file?.width,
          height: file?.height,
          duration: video.duration,
          query,
        }
      })
      .filter((video: any) => video.videoUrl)
  } catch {
    return []
  }
}
