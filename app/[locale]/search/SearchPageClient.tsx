'use client'

import { FileText, Loader2, Search } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

import HighlightText from '@/components/search/HighlightText'
import { Link, useRouter } from '@/i18n/navigation'
import type {
  GlobalSearchResponse,
  GlobalSearchResult,
  SearchContentType,
} from '@/lib/sanity.queries'

interface SearchPageClientProps {
  initialQuery: string
}

const EMPTY: GlobalSearchResponse = {
  query: '',
  results: [],
  suggestions: [],
  total: 0,
  counts: {},
}

const FILTERS: { value: SearchContentType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'post', label: 'Articles' },
  { value: 'product', label: 'Products' },
  { value: 'page', label: 'Pages' },
  { value: 'category', label: 'Categories' },
  { value: 'tag', label: 'Tags' },
  { value: 'author', label: 'Authors' },
]

export default function SearchPageClient({
  initialQuery,
}: SearchPageClientProps) {
  const t = useTranslations('search')
  const locale = useLocale()
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [debounced, setDebounced] = useState(initialQuery)
  const [type, setType] = useState<SearchContentType | 'all'>('all')
  const [data, setData] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setDebounced(query.trim()), 250)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [query])

  useEffect(() => {
    if (debounced.length < 2) {
      setData(EMPTY)
      setLoading(false)
      return
    }
    const controller = new AbortController()
    const params = new URLSearchParams({
      q: debounced,
      locale,
      limit: '50',
    })
    if (type !== 'all') params.set('type', type)
    setLoading(true)
    fetch(`/api/search?${params}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Search failed')
        return response.json()
      })
      .then(setData)
      .catch(() => {
        if (!controller.signal.aborted) setData(EMPTY)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    router.replace(
      (debounced
        ? `/search?q=${encodeURIComponent(debounced)}`
        : '/search') as any,
      { scroll: false },
    )
    return () => controller.abort()
  }, [debounced, locale, router, type])

  return (
    <div className="min-w-0">
      <div className="relative max-w-3xl min-w-0">
        <Search
          size={20}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-3"
        />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoFocus
          autoComplete="off"
          placeholder={t('placeholder')}
          className="h-14 w-full rounded-lg border border-gray-5 bg-white pl-12 pr-12 text-lg text-ink outline-none transition-colors placeholder:text-gray-3 focus:border-apple-blue focus:ring-2 focus:ring-apple-blue/30 dark:border-gray-2 dark:bg-gray-1 dark:text-white"
        />
        {loading && (
          <Loader2
            size={19}
            className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-apple-blue"
          />
        )}
      </div>

      {data.suggestions.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-gray-3">
            {t('suggestions')}:
          </span>
          {data.suggestions.slice(0, 6).map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setQuery(suggestion)}
              className="rounded-full bg-gray-7 px-3 py-1.5 text-xs text-gray-2 hover:bg-gray-6 dark:bg-gray-2 dark:text-gray-8"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {debounced.length >= 2 && (
        <div className="mt-6 flex max-w-full snap-x gap-2 overflow-x-auto overscroll-x-contain pb-2">
          {FILTERS.map((filter) => {
            const count =
              filter.value === 'all'
                ? Object.values(data.counts).reduce(
                    (sum, value) => sum + (value || 0),
                    0,
                  )
                : data.counts[filter.value] || 0
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setType(filter.value)}
                className={`shrink-0 snap-start rounded-full px-4 py-2 text-sm font-medium ${
                  type === filter.value
                    ? 'bg-ink text-white dark:bg-white dark:text-ink'
                    : 'bg-gray-7 text-gray-2 dark:bg-gray-2 dark:text-gray-8'
                }`}
              >
                {filter.label} {count > 0 ? `(${count})` : ''}
              </button>
            )
          })}
        </div>
      )}

      {!loading && debounced.length >= 2 && (
        <div className="mt-8">
          {data.results.length === 0 ? (
            <p className="text-gray-3 dark:text-gray-4">{t('noResults')}</p>
          ) : (
            <>
              <p className="mb-5 text-sm text-gray-3 dark:text-gray-4">
                {t('resultsFor', { query: debounced })} ({data.total})
              </p>
              <div className="divide-y divide-gray-6 border-y border-gray-6 dark:divide-gray-2 dark:border-gray-2">
                {data.results.map((result) => (
                  <SearchResultRow
                    key={result.id}
                    result={result}
                    query={debounced}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {!loading && debounced.length < 2 && (
        <p className="mt-8 text-gray-3 dark:text-gray-4">{t('startTyping')}</p>
      )}
    </div>
  )
}

function SearchResultRow({
  result,
  query,
}: {
  result: GlobalSearchResult
  query: string
}) {
  return (
    <Link
      href={result.href as any}
      className="grid min-w-0 grid-cols-[40px_minmax(0,1fr)] gap-3 py-5 transition-colors hover:bg-gray-7/60 sm:grid-cols-[44px_minmax(0,1fr)_auto] sm:gap-4 sm:px-3 dark:hover:bg-gray-2/50"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-7 text-gray-3 dark:bg-gray-2">
        <FileText size={18} />
      </span>
      <span className="min-w-0">
        <span className="block break-words text-base font-semibold text-ink dark:text-white">
          <HighlightText text={result.title} query={query} />
        </span>
        {result.snippet && (
          <span className="mt-1 block break-words text-sm leading-6 text-gray-3 dark:text-gray-4">
            <HighlightText text={result.snippet} query={query} />
          </span>
        )}
      </span>
      <span className="hidden self-start rounded-full bg-gray-7 px-2.5 py-1 text-[0.6875rem] font-semibold uppercase text-gray-3 sm:block dark:bg-gray-2">
        {result.type}
      </span>
    </Link>
  )
}
