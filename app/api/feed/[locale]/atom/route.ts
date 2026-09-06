import { NextRequest, NextResponse } from 'next/server'

import { SITE } from '@/lib/constants'
import { getFeedPosts, xmlEscape } from '@/lib/feed'
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
  const siteUrl = SITE.url.replace(/\/$/, '')
  const entries = getFeedPosts(posts, safeLocale)
    .map(
      ({ title, description, link, pubDate, author, category }) => `  <entry>
    <title>${xmlEscape(title)}</title>
    <id>${xmlEscape(link)}</id>
    <link href="${xmlEscape(link)}" />
    <updated>${pubDate.toISOString()}</updated>
    <published>${pubDate.toISOString()}</published>
    <author><name>${xmlEscape(author || SITE.name)}</name></author>
    ${category ? `<category term="${xmlEscape(category)}" />` : ''}
    <summary type="html">${xmlEscape(description)}</summary>
  </entry>`,
    )
    .join('\n')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${xmlEscape(SITE.name)}</title>
  <id>${xmlEscape(`${siteUrl}/${safeLocale}`)}</id>
  <link href="${xmlEscape(`${siteUrl}/api/feed/${safeLocale}/atom`)}" rel="self" />
  <link href="${xmlEscape(`${siteUrl}/${safeLocale}`)}" />
  <updated>${new Date().toISOString()}</updated>
${entries}
</feed>`
  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
    },
  })
}
