import { NextRequest, NextResponse } from 'next/server'

import { SITE } from '@/lib/constants'
import { cdata, getFeedPosts, xmlEscape } from '@/lib/feed'
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
    } catch {
      posts = []
    }
  }

  const siteUrl = SITE.url.replace(/\/$/, '')
  const items = getFeedPosts(posts, safeLocale)
    .map(
      ({
        post,
        title,
        description,
        link,
        image,
        pubDate,
        author,
        category,
        tags,
      }) => `    <item>
      <title>${cdata(title)}</title>
      <link>${xmlEscape(link)}</link>
      <guid isPermaLink="true">${xmlEscape(link)}</guid>
      <pubDate>${pubDate.toUTCString()}</pubDate>
      <dc:creator>${cdata(author || SITE.name)}</dc:creator>
      ${category ? `<category>${cdata(category)}</category>` : ''}
      ${(tags || []).map((tag) => `<category>${cdata(tag)}</category>`).join('\n      ')}
      <description>${cdata(description)}</description>
      <content:encoded>${cdata(`<p>${description}</p><p><a href="${link}">Read the full article</a></p>`)}</content:encoded>
      ${image ? `<media:content url="${xmlEscape(image)}" medium="image" type="image/jpeg" />` : ''}
      <source url="${xmlEscape(siteUrl)}">${cdata(SITE.name)}</source>
    </item>`,
    )
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${xmlEscape(`${SITE.name} - ${safeLocale === 'fr' ? 'Flux' : 'Feed'}`)}</title>
    <link>${xmlEscape(`${siteUrl}/${safeLocale}`)}</link>
    <description>${xmlEscape(safeLocale === 'fr' ? SITE.description.fr : SITE.description.en)}</description>
    <atom:link href="${xmlEscape(`${siteUrl}/api/feed/${safeLocale}`)}" rel="self" type="application/rss+xml" />
    <language>${safeLocale}</language>
    <copyright>${xmlEscape(`© ${new Date().getFullYear()} ${SITE.name}`)}</copyright>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
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
