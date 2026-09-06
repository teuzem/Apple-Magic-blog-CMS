import { ArrowRight, Star } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import SanityImage from '@/components/sanity/SanityImage'
import JsonLd from '@/components/seo/JsonLd'
import { collectionPageSchema, websiteSchema } from '@/components/seo/schema'
import Price from '@/components/ui/Price'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Link } from '@/i18n/navigation'
import { SITE } from '@/lib/constants'
import { safeSanityFetch } from '@/lib/safeSanity'
import { isConfigured } from '@/lib/sanity.api'
import { getClient, getProducts } from '@/lib/sanity.client'
import type { Product } from '@/lib/sanity.queries'

const locales = ['en', 'fr']
const siteUrl = SITE.url.replace(/\/$/, '')

interface ProductsPageProps {
  params: Promise<{ locale: string }>
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: ProductsPageProps) {
  const { locale } = await params
  const safeLocale = locales.includes(locale) ? locale : 'en'
  return {
    title: 'Apple Product Reviews',
    description:
      'In-depth reviews and specs for iPhone, Mac, iPad, Apple Watch and more.',
    alternates: { canonical: `${siteUrl}/${safeLocale}/products` },
  }
}

export default async function ProductsPage({ params }: ProductsPageProps) {
  const { locale } = await params
  const safeLocale = locales.includes(locale) ? locale : 'en'
  setRequestLocale(safeLocale)

  const products = isConfigured
    ? await safeSanityFetch((c) => getProducts(c), [] as Product[])
    : ([] as Product[])

  return (
    <div className="mx-auto w-full max-w-[1320px] min-w-0 px-4 pt-10 pb-14 sm:px-6 sm:pt-14 sm:pb-20 lg:px-8">
      <JsonLd
        data={[
          collectionPageSchema('Apple Product Reviews', '', safeLocale),
          websiteSchema(safeLocale),
        ]}
      />
      <SectionHeader
        eyebrow="Hardware"
        title="Apple Product Reviews"
        className="mb-8"
      />

      {products.length === 0 ? (
        <p className="py-12 text-center text-gray-3 dark:text-gray-4">
          No products published yet. Connect your Sanity dataset.
        </p>
      ) : (
        <div className="grid min-w-0 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {products.map((product) => {
            const firstImage = Array.isArray(product.images)
              ? product.images[0]
              : product.images
            return (
              <Link
                key={product._id}
                href={`/products/${product.slug}` as any}
                className="group flex min-w-0 flex-col overflow-hidden rounded-md border border-gray-7 bg-white transition-colors hover:border-apple-blue/30 dark:border-gray-2 dark:bg-gray-1"
              >
                <div className="relative h-52 w-full overflow-hidden bg-gray-7 dark:bg-gray-2">
                  {firstImage ? (
                    <SanityImage
                      asset={firstImage}
                      alt={product.name || ''}
                      fill
                      rounded={false}
                      className="transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-magic-gradient">
                      <span className="text-3xl font-bold text-white">
                        {product.name?.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
                  <h3 className="break-words text-lg font-semibold leading-tight text-ink dark:text-white">
                    {product.name}
                  </h3>
                  {product.tagline && (
                    <p className="mt-1 line-clamp-2 text-[0.875rem] text-gray-3 dark:text-gray-4">
                      {product.tagline}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-2 text-base">
                    <Price xaf={product.pricing?.XAF} />
                  </div>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      {product.rating ? (
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-500">
                          <Star size={14} fill="currentColor" />{' '}
                          {product.rating}
                          {product.reviewCount ? (
                            <span className="text-gray-3">
                              ({product.reviewCount})
                            </span>
                          ) : null}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-3">Specs</span>
                      )}
                    </div>
                    {product.storeUrl ? (
                      <a
                        href={product.storeUrl}
                        target="_blank"
                        rel="noopener noreferrer sponsored nofollow"
                        className="inline-flex items-center rounded-full bg-apple-blue px-4 py-1.5 text-[0.8125rem] font-semibold text-white transition-colors hover:bg-apple-blue-hover"
                      >
                        {safeLocale === 'fr' ? 'Commander' : 'Buy'}
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-apple-blue">
                        Review{' '}
                        <ArrowRight
                          size={15}
                          className="transition-transform group-hover:translate-x-0.5"
                        />
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
