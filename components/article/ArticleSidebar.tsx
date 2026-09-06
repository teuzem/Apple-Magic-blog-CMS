import { ArrowUpRight, Clock, ShoppingBag } from 'lucide-react'

import SidebarMediaCarousel from '@/components/article/SidebarMediaCarousel'
import SanityImage from '@/components/sanity/SanityImage'
import TableOfContents, {
  type TocHeading,
} from '@/components/ui/TableOfContents'
import { Link } from '@/i18n/navigation'
import {
  type ArticleSidebar as ArticleSidebarData,
  getLocalized,
  type Post,
  type Product,
} from '@/lib/sanity.queries'
import { formatDate } from '@/lib/utils'

function SidebarHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-[0.8125rem] font-bold uppercase tracking-[0.08em] text-gray-3 dark:text-gray-5">
      {children}
    </h2>
  )
}

function SidebarPosts({
  posts,
  locale,
  heading,
}: {
  posts: Post[]
  locale: string
  heading: string
}) {
  if (posts.length === 0) return null
  return (
    <section>
      <SidebarHeading>{heading}</SidebarHeading>
      <div className="divide-y divide-gray-7 overflow-hidden rounded-lg border border-gray-7 bg-white dark:divide-gray-2 dark:border-gray-2 dark:bg-gray-1">
        {posts.map((post) => {
          const localized = getLocalized(post, locale)
          return (
            <Link
              key={post._id}
              href={`/posts/${post.slug}` as any}
              className="group grid grid-cols-[92px_minmax(0,1fr)] gap-3 p-3 transition-colors hover:bg-gray-8 dark:hover:bg-gray-2/60"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-gray-7 dark:bg-gray-2">
                {post.coverImage && (
                  <SanityImage
                    asset={post.coverImage}
                    alt={localized.title}
                    fill
                    rounded={false}
                    sizes="92px"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                )}
              </div>
              <div className="min-w-0 self-center">
                <h3 className="line-clamp-3 text-[0.875rem] font-semibold leading-snug text-ink transition-colors group-hover:text-apple-blue dark:text-white">
                  {localized.title}
                </h3>
                {post.date && (
                  <p className="mt-1.5 flex items-center gap-1 text-[0.6875rem] text-gray-3 dark:text-gray-5">
                    <Clock size={11} />
                    {formatDate(post.date, locale)}
                  </p>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

function ProductDestination({
  product,
  locale,
  children,
}: {
  product: Product
  locale: string
  children: React.ReactNode
}) {
  const externalUrl = product.storeUrl || product.affiliateLink
  if (externalUrl) {
    return (
      <a
        href={externalUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="group grid grid-cols-[76px_minmax(0,1fr)_18px] items-center gap-3 p-3 transition-colors hover:bg-gray-8 dark:hover:bg-gray-2/60"
      >
        {children}
      </a>
    )
  }
  return (
    <Link
      href={`/products/${product.slug}` as any}
      locale={locale}
      className="group grid grid-cols-[76px_minmax(0,1fr)_18px] items-center gap-3 p-3 transition-colors hover:bg-gray-8 dark:hover:bg-gray-2/60"
    >
      {children}
    </Link>
  )
}

function SidebarProducts({
  products,
  locale,
  heading,
}: {
  products: Product[]
  locale: string
  heading: string
}) {
  if (products.length === 0) return null
  const isFrench = locale === 'fr'
  return (
    <section>
      <SidebarHeading>{heading}</SidebarHeading>
      <div className="divide-y divide-gray-7 overflow-hidden rounded-lg border border-gray-7 bg-white dark:divide-gray-2 dark:border-gray-2 dark:bg-gray-1">
        {products.map((product) => {
          const name =
            (isFrench ? product.nameFr || product.name : product.name) || ''
          const tagline =
            (isFrench
              ? product.taglineFr || product.tagline
              : product.tagline) || ''
          const image = product.images?.[0] || product.gallery?.[0]?.image
          return (
            <ProductDestination
              key={product._id}
              product={product}
              locale={locale}
            >
              <div className="relative aspect-square overflow-hidden rounded-md bg-gray-7 dark:bg-gray-2">
                {image ? (
                  <SanityImage
                    asset={image}
                    alt={name}
                    fill
                    rounded={false}
                    sizes="76px"
                    className="object-contain p-1.5 transition-transform duration-300 group-hover:scale-[1.05]"
                  />
                ) : (
                  <ShoppingBag
                    size={22}
                    className="absolute inset-0 m-auto text-gray-4"
                  />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="line-clamp-2 text-[0.875rem] font-semibold leading-snug text-ink group-hover:text-apple-blue dark:text-white">
                  {name}
                </h3>
                {tagline && (
                  <p className="mt-1 line-clamp-2 text-[0.75rem] leading-relaxed text-gray-3 dark:text-gray-5">
                    {tagline}
                  </p>
                )}
              </div>
              <ArrowUpRight
                size={16}
                className="text-gray-4 transition-colors group-hover:text-apple-blue"
              />
            </ProductDestination>
          )
        })}
      </div>
    </section>
  )
}

export default function ArticleSidebar({
  headings,
  sidebar,
  fallbackFeaturedPosts,
  recentPosts,
  locale,
}: {
  headings: TocHeading[]
  sidebar?: ArticleSidebarData
  fallbackFeaturedPosts: Post[]
  recentPosts: Post[]
  locale: string
}) {
  const isFrench = locale === 'fr'
  const localized = (english?: string, french?: string, fallback = '') =>
    (isFrench ? french || english : english) || fallback
  const featured = (
    sidebar?.featuredPosts?.length
      ? sidebar.featuredPosts
      : fallbackFeaturedPosts
  ).slice(0, 3)
  const recentCount = Math.min(Math.max(sidebar?.recentPostsCount || 5, 1), 10)

  return (
    <aside
      className="hidden min-w-0 xl:block"
      aria-label={
        isFrench
          ? 'Navigation et contenus associes'
          : 'Navigation and related content'
      }
    >
      <div className="sticky top-20 z-10 bg-white pb-5 dark:bg-black">
        <TableOfContents headings={headings} />
      </div>
      {sidebar?.enabled !== false && (
        <div className="space-y-8 pb-12">
          <SidebarMediaCarousel
            slides={sidebar?.announcements || []}
            locale={locale}
            heading={localized(
              sidebar?.announcementsTitle,
              sidebar?.announcementsTitleFr,
              isFrench ? 'Actualites Apple' : 'Apple news',
            )}
          />
          <SidebarPosts
            posts={featured}
            locale={locale}
            heading={localized(
              sidebar?.featuredTitle,
              sidebar?.featuredTitleFr,
              isFrench ? 'Articles a la une' : 'Featured posts',
            )}
          />
          <SidebarPosts
            posts={recentPosts.slice(0, recentCount)}
            locale={locale}
            heading={localized(
              sidebar?.recentTitle,
              sidebar?.recentTitleFr,
              isFrench ? 'Articles recents' : 'Latest posts',
            )}
          />
          <SidebarProducts
            products={sidebar?.trendingProducts || []}
            locale={locale}
            heading={localized(
              sidebar?.trendingTitle,
              sidebar?.trendingTitleFr,
              isFrench ? 'Produits tendance' : 'Trending products',
            )}
          />
          <SidebarMediaCarousel
            slides={sidebar?.sponsoredSlides || []}
            locale={locale}
            heading={localized(
              sidebar?.sponsoredTitle,
              sidebar?.sponsoredTitleFr,
              isFrench ? 'Sponsorise' : 'Sponsored',
            )}
            sponsored
          />
        </div>
      )}
    </aside>
  )
}
