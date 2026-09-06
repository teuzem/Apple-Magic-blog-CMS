import {
  ArrowUpRight,
  Glasses,
  Headphones,
  Laptop,
  LayoutGrid,
  Rewind,
  Scale,
  Smartphone,
  Tablet,
  Watch,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import type { Category } from '@/lib/sanity.queries'
import { cn } from '@/lib/utils'

const fallbackIcons: Record<string, React.ReactNode> = {
  iphone: <Smartphone size={26} />,
  ipad: <Tablet size={26} />,
  mac: <Laptop size={26} />,
  'apple-watch': <Watch size={26} />,
  airpods: <Headphones size={26} />,
  'vision-pro': <Glasses size={26} />,
  news: <LayoutGrid size={26} />,
  comparisons: <Scale size={26} />,
  'buying-guides': <Rewind size={26} />,
}

interface CategoryNavProps {
  categories?: Category[]
}

/**
 * A rich Apple-style category showcase: gradient icon tiles, short
 * descriptions and a "browse all" affordance.
 */
export function CategoryNav({ categories = [] }: CategoryNavProps) {
  const t = useTranslations('nav')

  // Provide a sensible default set matching Apple's product lines
  const defaults = [
    {
      title: t('iphone'),
      description: 'iPhone reviews & buying guides',
      slug: 'iphone',
    },
    {
      title: t('ipad'),
      description: 'iPad guides & comparisons',
      slug: 'ipad',
    },
    { title: t('mac'), description: 'MacBooks & macOS', slug: 'mac' },
    {
      title: t('watch'),
      description: 'Apple Watch & health',
      slug: 'apple-watch',
    },
    { title: t('airpods'), description: 'AirPods & audio', slug: 'airpods' },
    {
      title: t('vision'),
      description: 'Vision Pro & spatial computing',
      slug: 'vision-pro',
    },
    {
      title: t('comparisons'),
      description: 'Head-to-head verdicts',
      slug: 'comparisons',
    },
    {
      title: t('guides'),
      description: 'Smart buying guides',
      slug: 'buying-guides',
    },
  ]

  const items = categories?.length
    ? categories
        .filter((c) => c.showInNav !== false)
        .slice(0, 8)
        .map((c) => ({
          title: c.title || '',
          description: c.description || '',
          slug: c.slug || '',
          color: c.color || undefined,
        }))
    : defaults.map((d) => ({
        title: d.title,
        description: d.description,
        slug: d.slug,
        color: undefined,
      }))

  return (
    <div className="space-y-6">
      <div className="no-scrollbar -mx-4 grid snap-x grid-flow-col grid-rows-1 gap-4 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid-flow-row lg:grid-cols-4 lg:overflow-visible lg:px-0">
        {items.map((cat) => {
          const slug = cat.slug.toLowerCase()
          const accent = cat.color || '#2997ff'
          return (
            <Link
              key={slug}
              href={`/categories/${slug}` as any}
              className="group flex min-w-[240px] snap-start flex-col justify-between gap-4 rounded-xl border border-gray-7 bg-white p-5 transition-colors duration-300 hover:border-apple-blue/30 sm:min-w-[260px] lg:min-w-0 dark:border-gray-2 dark:bg-gray-1"
            >
              <div className="flex items-start justify-between">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-lg text-white transition-transform duration-300 group-hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                  }}
                >
                  {fallbackIcons[slug] || <LayoutGrid size={26} />}
                </span>
                <ArrowUpRight
                  size={18}
                  className="text-gray-4 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 dark:text-gray-2"
                />
              </div>
              <div>
                <h3 className="text-[0.9375rem] font-semibold text-ink dark:text-white">
                  {cat.title || slug}
                </h3>
                {cat.description && (
                  <p className="mt-1 line-clamp-2 text-[0.8125rem] leading-relaxed text-gray-3 dark:text-gray-4">
                    {cat.description}
                  </p>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      <div className="flex justify-center">
        <Link
          href="/categories"
          className={cn(
            'inline-flex items-center gap-2 rounded-full border border-gray-7 px-5 py-2 text-sm font-medium',
            'text-ink transition-colors hover:border-apple-blue/40 hover:text-apple-blue dark:border-gray-2 dark:text-white',
          )}
        >
          {t('all')}
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </div>
  )
}
