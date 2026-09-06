'use client'

import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useState } from 'react'

import { PostCard } from '@/components/ui/PostCard'
import { type Category, getLocalized, type Post } from '@/lib/sanity.queries'

const PAGE_SIZE = 9
type SortMode = 'newest' | 'oldest' | 'az'
type DateFilter = 'all' | '30d' | '90d' | 'year'

interface PostsListClientProps {
  posts: Post[]
  categories: Category[]
  locale: string
}

export default function PostsListClient({
  posts,
  categories,
  locale,
}: PostsListClientProps) {
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [contentType, setContentType] = useState('all')
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [sort, setSort] = useState<SortMode>('newest')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const categoryOptions = useMemo(
    () =>
      categories
        .filter((item) => item.slug)
        .map((item) => ({
          slug: item.slug as string,
          title:
            locale === 'fr'
              ? item.titleFr || item.title || item.slug
              : item.title || item.slug,
        })),
    [categories, locale],
  )

  const typeOptions = useMemo(
    () =>
      Array.from(
        new Set(posts.map((post) => post.contentType).filter(Boolean)),
      ) as string[],
    [posts],
  )

  const suggestions = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase(locale)
    if (needle.length < 2) return []
    const values = posts.flatMap((post) => {
      const localized = getLocalized(post, locale)
      return [
        localized.title,
        localized.excerpt,
        post.category?.title,
        post.category?.titleFr,
        ...(post.tags || []).map((tag) => tag.title),
      ]
    })
    return Array.from(
      new Set(
        values
          .filter(Boolean)
          .map((value) => String(value).trim())
          .filter((value) => value.toLocaleLowerCase(locale).includes(needle)),
      ),
    ).slice(0, 6)
  }, [locale, posts, query])

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase(locale)
    const now = Date.now()
    const cutoff =
      dateFilter === '30d'
        ? now - 30 * 86400000
        : dateFilter === '90d'
          ? now - 90 * 86400000
          : dateFilter === 'year'
            ? now - 365 * 86400000
            : 0
    return posts
      .filter((post) => {
        const localized = getLocalized(post, locale)
        const haystack = [
          localized.title,
          localized.excerpt,
          post.category?.title,
          post.category?.titleFr,
          ...(post.tags || []).flatMap((tag) => [tag.title, tag.slug]),
          post.author?.name,
          post.contentType,
        ]
          .filter(Boolean)
          .join(' ')
          .toLocaleLowerCase(locale)
        const matchesQuery = !needle || haystack.includes(needle)
        const matchesCategory =
          category === 'all' || post.category?.slug === category
        const matchesType =
          contentType === 'all' || post.contentType === contentType
        const timestamp = post.date ? new Date(post.date).getTime() : 0
        return (
          matchesQuery &&
          matchesCategory &&
          matchesType &&
          (!cutoff || timestamp >= cutoff)
        )
      })
      .sort((a, b) => {
        if (sort === 'az') {
          return getLocalized(a, locale).title.localeCompare(
            getLocalized(b, locale).title,
            locale,
          )
        }
        const first = new Date(a.date || 0).getTime()
        const second = new Date(b.date || 0).getTime()
        return sort === 'oldest' ? first - second : second - first
      })
  }, [category, contentType, dateFilter, locale, posts, query, sort])

  const shown = filtered.slice(0, visible)
  const hasMore = visible < filtered.length
  const hasFilters =
    query.trim().length > 0 ||
    category !== 'all' ||
    contentType !== 'all' ||
    dateFilter !== 'all' ||
    sort !== 'newest'

  function resetFilters() {
    setQuery('')
    setCategory('all')
    setContentType('all')
    setDateFilter('all')
    setSort('newest')
    setVisible(PAGE_SIZE)
  }

  return (
    <>
      <section className="mb-10 min-w-0 rounded-lg border border-gray-7 bg-gray-8/60 p-4 dark:border-gray-2 dark:bg-gray-1/70">
        <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">
              {locale === 'fr'
                ? 'Rechercher dans les articles'
                : 'Search articles'}
            </span>
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-3"
            />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setVisible(PAGE_SIZE)
              }}
              placeholder={
                locale === 'fr'
                  ? 'Rechercher par titre, thème, auteur ou mot-clé…'
                  : 'Search by title, topic, author or keyword…'
              }
              className="h-12 w-full min-w-0 rounded-md border border-gray-5 bg-white pl-11 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-gray-3 focus:border-apple-blue focus:ring-2 focus:ring-apple-blue/20 dark:border-gray-2 dark:bg-black dark:text-white"
            />
          </label>
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-gray-5 px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-apple-blue hover:text-apple-blue dark:border-gray-2 dark:text-white"
          >
            <SlidersHorizontal size={17} />
            {locale === 'fr' ? 'Filtres' : 'Filters'}
          </button>
          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-3 hover:text-apple-blue dark:text-gray-4"
            >
              <X size={16} />
              {locale === 'fr' ? 'Réinitialiser' : 'Clear'}
            </button>
          )}
        </div>

        {suggestions.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-gray-3 dark:text-gray-4">
              {locale === 'fr' ? 'Suggestions' : 'Suggestions'}
            </span>
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setQuery(suggestion)}
                className="rounded-full bg-gray-7 px-3 py-1.5 text-xs text-gray-2 transition-colors hover:bg-gray-6 dark:bg-gray-2 dark:text-gray-8"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {filtersOpen && (
          <div className="mt-4 grid gap-3 border-t border-gray-7 pt-4 sm:grid-cols-2 lg:grid-cols-4 dark:border-gray-2">
            <FilterSelect
              label={locale === 'fr' ? 'Catégorie' : 'Category'}
              value={category}
              onChange={(value) => {
                setCategory(value)
                setVisible(PAGE_SIZE)
              }}
              options={[
                {
                  value: 'all',
                  label: locale === 'fr' ? 'Toutes' : 'All categories',
                },
                ...categoryOptions.map((item) => ({
                  value: item.slug,
                  label: item.title,
                })),
              ]}
            />
            <FilterSelect
              label={locale === 'fr' ? 'Type de contenu' : 'Content type'}
              value={contentType}
              onChange={(value) => {
                setContentType(value)
                setVisible(PAGE_SIZE)
              }}
              options={[
                {
                  value: 'all',
                  label: locale === 'fr' ? 'Tous les types' : 'All types',
                },
                ...typeOptions.map((item) => ({ value: item, label: item })),
              ]}
            />
            <FilterSelect
              label={locale === 'fr' ? 'Période' : 'Published'}
              value={dateFilter}
              onChange={(value) => {
                setDateFilter(value as DateFilter)
                setVisible(PAGE_SIZE)
              }}
              options={[
                {
                  value: 'all',
                  label: locale === 'fr' ? 'Toutes les dates' : 'Any time',
                },
                {
                  value: '30d',
                  label: locale === 'fr' ? '30 derniers jours' : 'Last 30 days',
                },
                {
                  value: '90d',
                  label: locale === 'fr' ? '90 derniers jours' : 'Last 90 days',
                },
                {
                  value: 'year',
                  label: locale === 'fr' ? 'Dernière année' : 'Last year',
                },
              ]}
            />
            <FilterSelect
              label={locale === 'fr' ? 'Trier par' : 'Sort by'}
              value={sort}
              onChange={(value) => {
                setSort(value as SortMode)
                setVisible(PAGE_SIZE)
              }}
              options={[
                {
                  value: 'newest',
                  label: locale === 'fr' ? 'Plus récents' : 'Newest',
                },
                {
                  value: 'oldest',
                  label: locale === 'fr' ? 'Plus anciens' : 'Oldest',
                },
                { value: 'az', label: locale === 'fr' ? 'A à Z' : 'A to Z' },
              ]}
            />
          </div>
        )}
      </section>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-3 dark:text-gray-4">
        <span>
          {filtered.length} {locale === 'fr' ? 'article(s)' : 'article(s)'}
        </span>
        {query.trim() && (
          <span>
            {locale === 'fr' ? 'Résultats pour' : 'Results for'} “{query.trim()}
            ”
          </span>
        )}
      </div>

      {shown.length === 0 ? (
        <div className="rounded-lg border border-gray-7 px-6 py-16 text-center dark:border-gray-2">
          <Search className="mx-auto mb-4 text-gray-4" size={30} />
          <p className="text-gray-3 dark:text-gray-4">
            {locale === 'fr'
              ? 'Aucun article ne correspond à ces critères.'
              : 'No articles match these filters.'}
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-5 rounded-full bg-apple-blue px-5 py-2.5 text-sm font-semibold text-white"
          >
            {locale === 'fr' ? 'Réinitialiser les filtres' : 'Clear filters'}
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((post, index) => (
            <PostCard
              key={post._id}
              post={post}
              index={index}
              locale={locale}
            />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={() => setVisible((value) => value + PAGE_SIZE)}
            className="inline-flex min-h-11 items-center rounded-full border border-gray-5 bg-white px-8 py-3 text-[0.9375rem] font-medium text-apple-blue transition-all hover:border-apple-blue dark:border-gray-2 dark:bg-gray-1 dark:text-white"
          >
            {locale === 'fr'
              ? 'Afficher plus d’articles'
              : 'Load more articles'}
          </button>
        </div>
      )}
    </>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <label className="flex flex-col gap-1.5 text-xs font-medium text-gray-3 dark:text-gray-4">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-md border border-gray-5 bg-white px-3 text-sm text-ink outline-none focus:border-apple-blue dark:border-gray-2 dark:bg-black dark:text-white"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
