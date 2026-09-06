import { SITE, SOCIAL_LINKS } from '@/lib/constants'
import { urlForImage } from '@/lib/sanity.image'
import {
  type Author,
  type Category,
  getLocalized,
  type Post,
  type Product,
} from '@/lib/sanity.queries'

const siteUrl = SITE.url.replace(/\/$/, '')

/**
 * Builders that return JSON-LD graph fragments per page type.
 * Each returns an object (or array of objects) to embed via <script type="application/ld+json">.
 */

export function websiteSchema(locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/${locale}/#website`,
    name: SITE.name,
    url: `${siteUrl}/${locale}`,
    inLanguage: locale,
    publisher: { '@id': `${siteUrl}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/${locale}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

export function organizationSchema(locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: SITE.name,
    legalName: SITE.name,
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/icons/apple-magic-512.png`,
      width: 512,
      height: 512,
    },
    image: `${siteUrl}/icons/apple-magic-512.png`,
    description: locale === 'fr' ? SITE.description.fr : SITE.description.en,
    email: 'mailto:hello@applemagic.blog',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Douala',
      addressCountry: 'CM',
    },
    sameAs: Object.values(SOCIAL_LINKS),
  }
}

export function personSchema(
  name: string,
  headline: string,
  image: any,
  sameAs: string[],
  locale: string,
) {
  const base: any = {
    '@type': 'Person',
    name,
    headline,
    inLanguage: locale,
  }
  if (image) {
    base.image = image?.asset?.url
  }
  if (sameAs && sameAs.length > 0) {
    base.sameAs = sameAs
  }
  return base
}

export function articleSchema(post: Post, locale: string) {
  const l = getLocalized(post, locale)
  const url = `${siteUrl}/${locale}/posts/${post.slug}`
  const imageSource = post.ogImage || post.coverImage
  const images = imageSource
    ? [
        [1200, 1200],
        [1200, 900],
        [1200, 675],
      ]
        .map(([width, height]) => {
          try {
            return urlForImage(imageSource)
              ?.width(width)
              .height(height)
              .fit('crop')
              .url()
          } catch {
            return undefined
          }
        })
        .filter(Boolean)
    : []
  const authors = [post.author, ...(post.coAuthors || [])]
    .filter((author) => author?.name)
    .map((author) => ({
      '@type': 'Person',
      name: author?.name,
      url: author?.slug
        ? `${siteUrl}/${locale}/authors/${author.slug}`
        : undefined,
      jobTitle: author?.role,
      sameAs: Array.isArray(author?.social)
        ? author.social.map((item: any) => item?.url).filter(Boolean)
        : undefined,
    }))
  const base: any = {
    '@context': 'https://schema.org',
    '@type': post.contentType === 'NewsArticle' ? 'NewsArticle' : 'Article',
    '@id': `${url}#article`,
    headline: l.title,
    url,
    mainEntityOfPage: url,
    datePublished: post.date || post._updatedAt,
    dateModified: post._updatedAt || post.date,
    inLanguage: locale,
    publisher: { '@id': `${siteUrl}/#organization` },
    author: authors.length ? authors : { '@id': `${siteUrl}/#organization` },
    description:
      (locale === 'fr'
        ? post.seoDescriptionFr || post.seoDescription
        : post.seoDescription) ||
      l.excerpt ||
      undefined,
    image: images,
    keywords:
      post.seoKeywords ||
      post.tags
        ?.map((t) => t.title)
        .filter(Boolean)
        .join(', '),
    isAccessibleForFree: true,
    isPartOf: { '@id': `${siteUrl}/${locale}/#website` },
  }
  if (post.category?.title) {
    base.articleSection = post.category.title
  }
  return base
}

export function faqPageSchema(content: any, locale: string) {
  const blocks = Array.isArray(content)
    ? content.filter((block) => block?._type === 'faq')
    : []
  const questions = blocks.flatMap((block) =>
    (block.items || []).map((item: any) => ({
      question:
        locale === 'fr'
          ? item.questionFr || item.question
          : item.question || item.questionFr,
      answer:
        locale === 'fr'
          ? item.answerFr || item.answer
          : item.answer || item.answerFr,
    })),
  )
  const mainEntity = questions
    .filter((item) => item.question && item.answer)
    .map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    }))
  if (!mainEntity.length) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: locale,
    mainEntity,
  }
}

export function breadcrumbSchema(
  items: { name: string; path: string }[],
  locale: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${siteUrl}/${locale}`,
      },
      ...items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 2,
        name: item.name,
        item: `${siteUrl}${
          item.path.startsWith(`/${locale}/`)
            ? item.path
            : `/${locale}${item.path}`
        }`,
      })),
    ],
  }
}

export function collectionPageSchema(
  name: string,
  description: string,
  locale: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url: `${siteUrl}/${locale}`,
    inLanguage: locale,
    isPartOf: websiteSchema(locale),
  }
}

export function productSchema(product: Product, locale: string) {
  const url = `${siteUrl}/${locale}/products/${product.slug}`
  const name = locale === 'fr' ? product.nameFr || product.name : product.name
  const description =
    locale === 'fr'
      ? product.descriptionFr ||
        product.description ||
        product.taglineFr ||
        product.tagline
      : product.description || product.tagline
  const images = [
    ...(product.images || []),
    ...(product.gallery || []).map((item) => item?.image).filter(Boolean),
  ]
    .map((image) => {
      try {
        return urlForImage(image)?.width(1200).height(900).fit('max').url()
      } catch {
        return undefined
      }
    })
    .filter(Boolean)
  const offers = Object.entries(product.pricing || {})
    .filter(([, price]) => typeof price === 'number' && price > 0)
    .map(([currency, price]) => ({
      '@type': 'Offer',
      price,
      priceCurrency: currency,
      availability: `https://schema.org/${product.availability || 'InStock'}`,
      url: product.storeUrl || product.affiliateLink || url,
      seller: { '@type': 'Organization', name: 'Apple Magic Store' },
    }))
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    url,
    image: images,
    description,
    sku: product.slug,
    mpn: product.model || product.slug,
    model: product.model,
    category: product.category?.title,
    aggregateRating:
      product.rating && product.reviewCount
        ? {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          }
        : undefined,
    offers:
      offers.length > 1
        ? {
            '@type': 'AggregateOffer',
            offerCount: offers.length,
            offers,
          }
        : offers[0],
    brand: { '@type': 'Brand', name: 'Apple' },
    sameAs: [product.officialUrl, product.imageSource].filter(Boolean),
    isRelatedTo: product.relatedProducts?.map((item) => ({
      '@type': 'Product',
      name: item.name,
      url: `${siteUrl}/${locale}/products/${item.slug}`,
    })),
    subjectOf: product.videoUrl
      ? {
          '@type': 'VideoObject',
          name: `${name} product video`,
          description,
          embedUrl: product.videoUrl,
          uploadDate: product.releaseDate,
        }
      : undefined,
  }
}
