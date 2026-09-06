import { NextRequest, NextResponse } from 'next/server'

import { SITE } from '@/lib/constants'
import { getFeedPosts } from '@/lib/feed'
import { isConfigured } from '@/lib/sanity.api'
import { getAllPosts, getClient } from '@/lib/sanity.client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params
  const safeLocale = locale === 'fr' ? 'fr' : 'en'
  let posts: any[] = []
  if (isConfigured) {
    try {
      posts = await getAllPosts(getClient())
    } catch {}
  }
  const items = getFeedPosts(posts, safeLocale).map(
    ({ post, title, description, link, image, pubDate, author, tags }) => ({
      id: link,
      url: link,
      title,
      content_html: `<p>${description}</p><p><a href="${link}">Read the full article</a></p>`,
      summary: description,
      image,
      date_published: pubDate.toISOString(),
      date_modified: new Date(
        post.updatedAt || post._updatedAt || post.date || pubDate,
      ).toISOString(),
      author: author ? { name: author } : undefined,
      tags: tags?.filter(Boolean),
    }),
  )
  return NextResponse.json(
    {
      version: 'https://jsonfeed.org/version/1.1',
      title: SITE.name,
      home_page_url: `${SITE.url.replace(/\/$/, '')}/${safeLocale}`,
      feed_url: `${SITE.url.replace(/\/$/, '')}/api/feed/${safeLocale}/json`,
      language: safeLocale,
      items,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
      },
    },
  )
}
