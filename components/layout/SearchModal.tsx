'use client'

import { Command } from 'cmdk'
import { Boxes, FileText, Folder, Search, Tag, User } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

import { Link } from '@/i18n/navigation'
import type {
  GlobalSearchResponse,
  GlobalSearchResult,
} from '@/lib/sanity.queries'

import HighlightText from '../search/HighlightText'

interface SearchModalProps {
  open: boolean
  onClose: () => void
}

const EMPTY: GlobalSearchResponse = {
  query: '',
  results: [],
  suggestions: [],
  total: 0,
  counts: {},
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const t = useTranslations('search')
  const locale = useLocale()
  const [query, setQuery] = useState('')
  const [data, setData] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = ''
      return
    }
    setQuery('')
    setData(EMPTY)
    document.body.style.overflow = 'hidden'
    setTimeout(() => inputRef.current?.focus(), 40)
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!open || query.trim().length < 2) {
      setData(EMPTY)
      setLoading(false)
      return
    }
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          q: query.trim(),
          locale,
          limit: '10',
        })
        const response = await fetch(`/api/search?${params}`, {
          signal: controller.signal,
        })
        if (!response.ok) throw new Error('Search request failed')
        setData(await response.json())
      } catch {
        if (!controller.signal.aborted) setData(EMPTY)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 220)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [locale, open, query])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/45 p-2 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-sm sm:p-4 sm:pt-[8vh]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl min-w-0 overflow-hidden rounded-lg bg-white shadow-2xl ring-1 ring-black/10 dark:bg-gray-1 dark:ring-white/10"
        onClick={(event) => event.stopPropagation()}
      >
        <Command shouldFilter={false} loop>
          <div className="flex min-w-0 items-center gap-2 border-b border-gray-6 px-3 sm:gap-3 sm:px-4 dark:border-gray-2">
            <Search size={19} className="shrink-0 text-gray-3" />
            <Command.Input
              ref={inputRef}
              value={query}
              onValueChange={setQuery}
              placeholder={t('placeholder')}
              className="h-14 min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-gray-3 dark:text-white"
            />
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-5 border-t-apple-blue" />
            ) : (
              <kbd className="hidden rounded border border-gray-5 px-1.5 py-0.5 text-[0.625rem] text-gray-3 sm:block">
                ESC
              </kbd>
            )}
          </div>
          <Command.List className="max-h-[65vh] overflow-y-auto p-2">
            {query.trim().length < 2 && (
              <p className="px-3 py-8 text-center text-sm text-gray-3">
                {t('startTyping')}
              </p>
            )}
            {data.suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 px-2 py-2">
                {data.suggestions.slice(0, 5).map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setQuery(suggestion)}
                    className="rounded-full bg-gray-7 px-3 py-1 text-xs text-gray-2 hover:bg-gray-6 dark:bg-gray-2 dark:text-gray-8"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            {!loading &&
              query.trim().length >= 2 &&
              data.results.length === 0 && (
                <p className="px-3 py-8 text-center text-sm text-gray-3">
                  {t('noResults')}
                </p>
              )}
            {data.results.map((result) => (
              <Command.Item
                key={result.id}
                value={result.id}
                onSelect={onClose}
                className="rounded-md aria-selected:bg-gray-7 dark:aria-selected:bg-gray-2"
              >
                <Link
                  href={result.href as any}
                  onClick={onClose}
                  className="flex w-full gap-3 px-3 py-3"
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gray-7 text-gray-3 dark:bg-gray-2">
                    <ResultIcon type={result.type} />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-ink dark:text-white">
                        <HighlightText text={result.title} query={query} />
                      </span>
                      <span className="text-[0.625rem] font-semibold uppercase text-gray-3">
                        {result.type}
                      </span>
                    </span>
                    {result.snippet && (
                      <span className="mt-1 block line-clamp-2 text-xs leading-5 text-gray-3 dark:text-gray-4">
                        <HighlightText text={result.snippet} query={query} />
                      </span>
                    )}
                  </span>
                </Link>
              </Command.Item>
            ))}
            {data.results.length > 0 && (
              <Command.Item value="view-all" onSelect={onClose}>
                <Link
                  href={`/search?q=${encodeURIComponent(query.trim())}` as any}
                  onClick={onClose}
                  className="mt-1 flex w-full justify-center border-t border-gray-6 px-3 py-3 text-sm font-semibold text-apple-blue dark:border-gray-2"
                >
                  {t('viewAll', { count: data.total })}
                </Link>
              </Command.Item>
            )}
          </Command.List>
        </Command>
      </div>
    </div>
  )
}

function ResultIcon({ type }: { type: GlobalSearchResult['type'] }) {
  const props = { size: 16, 'aria-hidden': true }
  if (type === 'product') return <Boxes {...props} />
  if (type === 'category') return <Folder {...props} />
  if (type === 'tag') return <Tag {...props} />
  if (type === 'author') return <User {...props} />
  return <FileText {...props} />
}
