import { Calendar, ExternalLink, Store } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import PortableTextRenderer from '@/components/blocks/PortableTextRenderer'
import ProductLiveRating from '@/components/products/ProductLiveRating'
import ProductMediaGallery from '@/components/products/ProductMediaGallery'
import SanityImage from '@/components/sanity/SanityImage'
import JsonLd from '@/components/seo/JsonLd'
import {
  breadcrumbSchema,
  productSchema,
  websiteSchema,
} from '@/components/seo/schema'
import { Badge } from '@/components/ui/Badge'
import Price from '@/components/ui/Price'
import { SITE } from '@/lib/constants'
import { safeSanityFetch } from '@/lib/safeSanity'
import { isConfigured } from '@/lib/sanity.api'
import { getClient, getProductBySlug } from '@/lib/sanity.client'
import type { Product } from '@/lib/sanity.queries'

const locales = ['en', 'fr']
const siteUrl = SITE.url.replace(/\/$/, '')

interface ProductPageProps {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateStaticParams() {
  if (!isConfigured) return []
  try {
    const client = getClient()
    const { getProducts } = await import('@/lib/sanity.client')
    const rows = await getProducts(client)
    const slugs = (rows || []).map((r) => r.slug).filter(Boolean) as string[]
    return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
  } catch (error) {
    return []
  }
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const safeLocale = locales.includes(locale) ? locale : 'en'
  const product = await safeSanityFetch(
    (c) => getProductBySlug(c, slug),
    null as Product | null,
  )
  if (!product) return {}
  const localizedName =
    safeLocale === 'fr' ? product.nameFr || product.name : product.name
  const localizedDescription =
    safeLocale === 'fr'
      ? product.descriptionFr ||
        product.description ||
        product.taglineFr ||
        product.tagline
      : product.seoDescription || product.description || product.tagline
  return {
    title: product.seoTitle || localizedName,
    description: localizedDescription,
    alternates: {
      canonical: `${siteUrl}/${safeLocale}/products/${slug}`,
      languages: {
        en: `${siteUrl}/en/products/${slug}`,
        fr: `${siteUrl}/fr/products/${slug}`,
        'x-default': `${siteUrl}/en/products/${slug}`,
      },
    },
    openGraph: {
      title: product.seoTitle || localizedName,
      description: localizedDescription,
      url: `${siteUrl}/${safeLocale}/products/${slug}`,
      type: 'website',
      siteName: SITE.name,
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, slug } = await params
  const safeLocale = locales.includes(locale) ? locale : 'en'
  setRequestLocale(safeLocale)
  const t = await getTranslations({ locale: safeLocale, namespace: 'product' })

  if (!isConfigured) notFound()

  const product = await safeSanityFetch(
    (c) => getProductBySlug(c, slug),
    null as Product | null,
  )
  if (!product) notFound()

  const gallery = [
    ...(Array.isArray(product.images) ? product.images : []),
    ...(Array.isArray(product.gallery) ? product.gallery : []),
  ]
  const supportingGallery: any[] = []
  const xaf = product.pricing?.XAF
  const buyUrl = product.storeUrl || product.affiliateLink
  const productName =
    safeLocale === 'fr' ? product.nameFr || product.name : product.name
  const tagline =
    safeLocale === 'fr' ? product.taglineFr || product.tagline : product.tagline
  const description =
    safeLocale === 'fr'
      ? product.descriptionFr || product.description
      : product.description

  return (
    <div className="mx-auto w-full max-w-[1320px] overflow-hidden px-4 pt-8 pb-14 sm:px-6 sm:pt-12 sm:pb-20 lg:px-8">
      <JsonLd
        data={[
          productSchema(product, safeLocale),
          breadcrumbSchema(
            [{ name: product.name || slug, path: `/products/${slug}` }],
            safeLocale,
          ),
          websiteSchema(safeLocale),
        ]}
      />

      <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-12">
        {/* Gallery */}
        <div className="min-w-0">
          {gallery.length ? (
            <ProductMediaGallery
              images={gallery}
              productName={productName || ''}
            />
          ) : (
            <div className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-lg bg-magic-gradient">
              <span className="text-6xl font-bold text-white">
                {productName?.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {product.category?.title && (
              <Badge color={product.category.color}>
                {product.category.title}
              </Badge>
            )}
          </div>
          <h1 className="mt-3 break-words text-3xl font-bold tracking-tight text-ink sm:text-4xl dark:text-white">
            {productName}
          </h1>
          {tagline && (
            <p className="mt-2 break-words text-[1.0625rem] text-gray-3 dark:text-gray-4">
              {tagline}
            </p>
          )}
          {description && (
            <p className="mt-4 max-w-xl break-words text-[0.95rem] leading-relaxed text-gray-2 dark:text-gray-8">
              {description}
            </p>
          )}

          {/* Rating */}
          <ProductLiveRating
            slug={slug}
            initialRating={product.rating}
            initialReviewCount={product.reviewCount}
          />

          {/* Price */}
          {xaf ? (
            <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-sm text-gray-3">{t('priceFrom')}</span>
              <Price xaf={xaf} className="text-3xl font-bold" />
              <span className="text-[0.8125rem] text-gray-3 dark:text-gray-4">
                {safeLocale === 'fr'
                  ? 'prix local selon votre situation'
                  : 'local price for you'}
              </span>
            </div>
          ) : (
            <p className="mt-6 text-sm text-gray-3">{t('noPricing')}</p>
          )}

          {product.releaseDate && (
            <p className="mt-2 inline-flex items-center gap-1.5 text-[0.875rem] text-gray-3 dark:text-gray-4">
              <Calendar size={14} />
              {new Date(product.releaseDate).toLocaleDateString(
                safeLocale === 'fr' ? 'fr-FR' : 'en-US',
                { month: 'long', year: 'numeric' },
              )}
            </p>
          )}

          {/* Specs */}
          {product.specs && product.specs.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 text-lg font-semibold text-ink dark:text-white">
                {t('specs')}
              </h2>
              <dl className="divide-y divide-gray-7 overflow-hidden rounded-lg border border-gray-7 dark:divide-gray-2 dark:border-gray-2">
                {product.specs.map((spec, i) => (
                  <div
                    key={i}
                    className="grid min-w-0 gap-1 px-4 py-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:gap-4"
                  >
                    <dt className="min-w-0 break-words text-[0.875rem] text-gray-3 dark:text-gray-4">
                      {spec.label}
                    </dt>
                    <dd className="min-w-0 break-words text-[0.875rem] font-medium text-ink sm:text-right dark:text-white">
                      {spec.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* CTA */}
          {buyUrl && (
            <a
              href={buyUrl}
              target="_blank"
              rel="noopener noreferrer sponsored nofollow"
              className="mt-8 inline-flex max-w-full items-center justify-center gap-2 rounded-full bg-apple-blue px-6 py-3 text-center text-[0.9375rem] font-semibold break-words text-white transition-all hover:bg-apple-blue-hover sm:px-7"
            >
              {product.storeUrl ? <Store size={16} /> : null}
              {product.storeUrl
                ? safeLocale === 'fr'
                  ? 'Commander sur Apple Magic'
                  : 'Buy on Apple Magic'
                : t('buyNow')}{' '}
              <ExternalLink size={16} />
            </a>
          )}
        </div>
      </div>
      {false && supportingGallery.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-5 text-2xl font-bold text-ink dark:text-white">
            {safeLocale === 'fr' ? 'Galerie et détails' : 'Gallery and details'}
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            {supportingGallery.map((item, i) => (
              <figure
                key={item?._key || i}
                className="overflow-hidden rounded-xl border border-gray-7 dark:border-gray-2"
              >
                <div className="relative aspect-[4/3]">
                  {item?.image && (
                    <SanityImage
                      asset={item.image}
                      alt={item.alt || productName || ''}
                      fill
                      rounded={false}
                    />
                  )}
                </div>
                {(item?.caption || item?.description) && (
                  <figcaption className="p-4">
                    {item.caption && (
                      <p className="font-semibold text-ink dark:text-white">
                        {safeLocale === 'fr'
                          ? item.captionFr || item.caption
                          : item.caption}
                      </p>
                    )}
                    {item.description && (
                      <p className="mt-1 text-sm leading-relaxed text-gray-3 dark:text-gray-4">
                        {safeLocale === 'fr'
                          ? item.descriptionFr || item.description
                          : item.description}
                      </p>
                    )}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </section>
      )}
      {false && product.videoUrl && (
        <section className="mt-14">
          <h2 className="mb-5 text-2xl font-bold text-ink dark:text-white">
            {safeLocale === 'fr' ? 'Vidéo' : 'Video'}
          </h2>
          {isEmbeddableVideo(product.videoUrl) ? (
            <div className="aspect-video overflow-hidden rounded-xl border border-gray-7 dark:border-gray-2">
              <iframe
                src={toEmbedUrl(product.videoUrl)}
                title={`${productName} video`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <a
              href={product.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-4 rounded-xl border border-apple-blue/20 bg-apple-blue/5 p-5 text-apple-blue hover:border-apple-blue/40"
            >
              <span className="font-semibold">
                {safeLocale === 'fr'
                  ? 'Voir la présentation officielle du produit'
                  : 'Watch the official product presentation'}
              </span>
              <ExternalLink size={18} />
            </a>
          )}
        </section>
      )}
      {false && product.supportingLinks?.length ? (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-bold text-ink dark:text-white">
            {safeLocale === 'fr' ? 'Ressources' : 'Resources'}
          </h2>
          <div className="flex flex-wrap gap-3">
            {product.supportingLinks.map((link, i) =>
              link?.url ? (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-apple-blue underline"
                >
                  {safeLocale === 'fr'
                    ? link.labelFr || link.label
                    : link.label}
                </a>
              ) : null,
            )}
          </div>
        </section>
      ) : null}
      {(safeLocale === 'fr'
        ? product.contentFr || product.content
        : product.content) && (
        <section className="mx-auto mt-12 min-w-0 max-w-[820px] sm:mt-16">
          <PortableTextRenderer
            content={
              safeLocale === 'fr'
                ? product.contentFr || product.content
                : product.content
            }
            locale={safeLocale}
          />
        </section>
      )}
    </div>
  )
}

function isEmbeddableVideo(url: string) {
  return /youtube\.com|youtu\.be|vimeo\.com/.test(url)
}

function toEmbedUrl(url: string) {
  const youtube = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?/]+)/,
  )
  if (youtube?.[1]) return `https://www.youtube.com/embed/${youtube[1]}`
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeo?.[1]) return `https://player.vimeo.com/video/${vimeo[1]}`
  return url
}
