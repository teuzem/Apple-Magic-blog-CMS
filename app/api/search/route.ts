import { NextRequest, NextResponse } from 'next/server'

import { isConfigured, readToken } from '@/lib/sanity.api'
import { getClient, searchAllContent } from '@/lib/sanity.client'
import type {
  GlobalSearchResponse,
  SearchContentType,
} from '@/lib/sanity.queries'
import { stripInvalidStega } from '@/lib/sanityStega'
import { stripHtml } from '@/lib/utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Ranked global full-text search used by the header and search page.
 */
export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q')?.trim() || ''
  const locale = req.nextUrl.searchParams.get('locale') === 'fr' ? 'fr' : 'en'
  const requestedType = req.nextUrl.searchParams.get(
    'type',
  ) as SearchContentType | null
  const limit = Math.min(
    Math.max(Number(req.nextUrl.searchParams.get('limit')) || 24, 1),
    50,
  )

  if (query.length < 2) {
    return NextResponse.json(emptyResponse(query))
  }

  if (!isConfigured) {
    return NextResponse.json(emptyResponse(query))
  }

  try {
    // Use the read token so search works even for larger datasets
    const client = readToken
      ? getClient({
          token: readToken,
          perspective: 'published',
          stega: false,
        } as any)
      : getClient()

    const term = query
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 8)
      .map((token) => `${token.replace(/[*?\\]/g, '')}*`)
      .join(' ')
    const documents = await searchAllContent(client, term)
    const ranked = documents
      .map((document) => normalizeResult(document, query, locale))
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)

    const counts = ranked.reduce<GlobalSearchResponse['counts']>(
      (all, result) => {
        all[result.type] = (all[result.type] || 0) + 1
        return all
      },
      {},
    )
    const filtered = requestedType
      ? ranked.filter((result) => result.type === requestedType)
      : ranked
    const suggestions = Array.from(
      new Set(
        ranked
          .flatMap((result) => [
            result.title,
            result.category,
            ...querySuggestions(result.title, query),
          ])
          .filter(Boolean),
      ),
    ).slice(0, 8) as string[]

    const response: GlobalSearchResponse = {
      query,
      results: filtered.slice(0, limit),
      suggestions,
      total: filtered.length,
      counts,
    }
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=30, stale-while-revalidate=120',
      },
    })
  } catch (error) {
    console.error('Search failed', error)
    return NextResponse.json(emptyResponse(query), { status: 500 })
  }
}

function emptyResponse(query: string): GlobalSearchResponse {
  return { query, results: [], suggestions: [], total: 0, counts: {} }
}

function normalizeResult(document: any, query: string, locale: 'en' | 'fr') {
  const type = document._type as SearchContentType
  const isFr = locale === 'fr'
  const title = stripInvalidStega(
    String(
      (isFr && (document.titleFr || document.nameFr)) ||
        document.title ||
        document.name ||
        '',
    ).trim(),
  )
  if (!title || !document.slug) return null

  const description = String(
    (isFr &&
      (document.excerptFr ||
        document.descriptionFr ||
        document.taglineFr ||
        document.bodyFr)) ||
      document.excerpt ||
      document.description ||
      document.tagline ||
      document.headline ||
      document.bio ||
      document.longBio ||
      document.body ||
      '',
  )
  const cleanDescription = stripInvalidStega(
    stripHtml(description).replace(/\s+/g, ' ').trim(),
  )
  const haystack = [
    title,
    cleanDescription,
    document.category?.title,
    ...(document.tags || []).map((tag: any) => tag?.title),
  ]
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase(locale)
  const needle = query.toLocaleLowerCase(locale)
  const words = needle.split(/\s+/).filter(Boolean)
  const titleLower = title.toLocaleLowerCase(locale)

  let score = 0
  if (titleLower === needle) score += 120
  if (titleLower.startsWith(needle)) score += 80
  if (titleLower.includes(needle)) score += 55
  score += words.filter((word) => titleLower.includes(word)).length * 20
  score += words.filter((word) => haystack.includes(word)).length * 8
  if (type === 'post') score += 8
  if (type === 'product') score += 6
  if (document.date) {
    const age = Date.now() - new Date(document.date).getTime()
    if (age < 1000 * 60 * 60 * 24 * 90) score += 4
  }

  return {
    id: document._id,
    type,
    subtype: document.contentType,
    title,
    description: cleanDescription.slice(0, 240),
    snippet: createSnippet(cleanDescription, words),
    href: hrefFor(type, document.slug),
    score,
    image: document.coverImage || document.picture || document.images?.[0],
    category: stripInvalidStega(document.category?.title),
    updatedAt: document._updatedAt,
  }
}

function createSnippet(text: string, words: string[]) {
  if (!text) return ''
  const lower = text.toLowerCase()
  const firstMatch = words
    .map((word) => lower.indexOf(word))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0]
  const start = Math.max(0, (firstMatch ?? 0) - 70)
  const end = Math.min(text.length, start + 220)
  return `${start > 0 ? '...' : ''}${text.slice(start, end).trim()}${
    end < text.length ? '...' : ''
  }`
}

function hrefFor(type: SearchContentType, slug: string) {
  const roots: Record<SearchContentType, string> = {
    post: '/posts',
    product: '/products',
    page: '/pages',
    category: '/categories',
    tag: '/tags',
    author: '/authors',
    series: '/series',
  }
  return `${roots[type]}/${slug}`
}

function querySuggestions(title: string, query: string) {
  const needle = query.toLowerCase()
  return title
    .split(/[:|,-]/)
    .map((part) => part.trim())
    .filter(
      (part) =>
        part.length > needle.length && part.toLowerCase().includes(needle),
    )
}
