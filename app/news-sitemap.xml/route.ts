import { NextResponse } from 'next/server'

import { SITE } from '@/lib/constants'
import { isConfigured } from '@/lib/sanity.api'
import { getClient } from '@/lib/sanity.client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

export async function GET() {
  const base = SITE.url.replace(/\/$/, '')
  let posts: {
    slug: string
    title?: string
    titleFr?: string
    date?: string
    updatedAt?: string
    _updatedAt?: string
  }[] = []

  if (isConfigured) {
    const client = getClient()
    posts = await client.fetch(
      `*[
        _type == "post" &&
        defined(slug.current) &&
        (!defined(status) || status == "published") &&
        (contentType == "NewsArticle" || category->slug.current == "news") &&
        coalesce(date, _updatedAt) >= dateTime(now()) - 60*60*48
      ] | order(coalesce(date, _updatedAt) desc) [0...1000] {
        "slug": slug.current, title, titleFr, date, updatedAt, _updatedAt
      }`,
    )
  }

  const urls = posts
    .flatMap((post) =>
      [
        { locale: 'en', language: 'en', title: post.title },
        { locale: 'fr', language: 'fr', title: post.titleFr || post.title },
      ].map(({ locale, language, title }) => {
        const publicationDate =
          post.date ||
          post.updatedAt ||
          post._updatedAt ||
          new Date().toISOString()
        return `<url>
  <loc>${escapeXml(`${base}/${locale}/posts/${post.slug}`)}</loc>
  <news:news>
    <news:publication>
      <news:name>${escapeXml(SITE.name)}</news:name>
      <news:language>${language}</news:language>
    </news:publication>
    <news:publication_date>${escapeXml(publicationDate)}</news:publication_date>
    <news:title>${escapeXml(title || SITE.name)}</news:title>
  </news:news>
</url>`
      }),
    )
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=300',
    },
  })
}
