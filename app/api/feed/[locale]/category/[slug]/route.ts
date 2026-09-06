import { NextRequest, NextResponse } from 'next/server'

import { SITE } from '@/lib/constants'
import { cdata, getFeedPosts, xmlEscape } from '@/lib/feed'
import { isConfigured } from '@/lib/sanity.api'
import { getAllPosts, getClient } from '@/lib/sanity.client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ locale: string; slug: string }> },
) {
  const { locale, slug } = await params
  const safeLocale = locale === 'fr' ? 'fr' : 'en'
  let posts: any[] = []
  if (isConfigured) {
    try {
      posts = await getAllPosts(getClient())
    } catch {}
  }
  const siteUrl = SITE.url.replace(/\/$/, '')
  const items = getFeedPosts(posts, safeLocale, slug)
    .map(
      ({ title, description, link, pubDate, author, image }) => `    <item>
      <title>${cdata(title)}</title>
      <link>${xmlEscape(link)}</link>
      <guid isPermaLink="true">${xmlEscape(link)}</guid>
      <pubDate>${pubDate.toUTCString()}</pubDate>
      <dc:creator>${cdata(author || SITE.name)}</dc:creator>
      <description>${cdata(description)}</description>
      ${image ? `<media:content url="${xmlEscape(image)}" medium="image" type="image/jpeg" />` : ''}
    </item>`,
    )
    .join('\n')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${xmlEscape(`${SITE.name} - ${slug}`)}</title>
    <link>${xmlEscape(`${siteUrl}/${safeLocale}/categories/${slug}`)}</link>
    <atom:link href="${xmlEscape(`${siteUrl}/api/feed/${safeLocale}/category/${slug}`)}" rel="self" type="application/rss+xml" />
    <language>${safeLocale}</language>
${items}
  </channel>
</rss>`
  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
    },
  })
}
