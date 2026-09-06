import groq from 'groq'

import { stripInvalidStega, stripInvalidStegaDeep } from '@/lib/sanityStega'

/* ============================================================
   APPLE MAGIC BLOG — GROQ Query Library
   Centralized queries + TypeScript interfaces for the whole app.
   ============================================================ */

/* ---- Reusable projection fragments ---- */

const postFields = groq`
  _id,
  _type,
  title,
  titleFr,
  _updatedAt,
  excerpt,
  excerptFr,
  locale,
  status,
  date,
  featured,
  trending,
  contentType,
  noIndex,
  seoTitle,
  seoTitleFr,
  seoDescription,
  seoDescriptionFr,
  seoKeywords,
  focusKeyphrase,
  sources,
  correctionNote,
  correctionNoteFr,
  ogImage,
  sponsored,
  updatedAt,
  verdictVoteTotal,
  verdictVoteCount,
  coverImage,
  "slug": slug.current,
  "category": category->{_id, title, "slug": slug.current, color, description},
  "tags": tags[]->{_id, title, "slug": slug.current, type},
  "author": author->{_id, name, "slug": slug.current, headline, role, location, nationality, languages, yearsExperience, picture, bio, longBio, quote, expertise, achievements, education, social},
  "coAuthors": coAuthors[]->{_id, name, "slug": slug.current, picture, role},
  "series": series->{_id, title, "slug": slug.current},
  "productMentions": productMentions[]->{_id, name, "slug": slug.current, tagline, images, specs, pricing, rating, reviewCount, storeUrl, affiliateLink, "category": category->{title, "slug": slug.current, color}},
  "readingTime": round(length(pt::text(content)) / 1000)
`

const authorFields = groq`
  _id,
  name,
  "slug": slug.current,
  headline,
  role,
  location,
  nationality,
  languages,
  yearsExperience,
  picture,
  bio,
  longBio,
  quote,
  expertise,
  achievements,
  education,
  social,
`

const categoryFields = groq`
  _id,
  title,
  titleFr,
  "slug": slug.current,
  description,
  descriptionFr,
  seoTitle,
  seoTitleFr,
  seoDescription,
  seoDescriptionFr,
  color,
  image,
  displayOrder,
  showInNav,
  "parent": parent->{_id, title, titleFr, "slug": slug.current},
`

const productFields = groq`
  _id,
  name,
  nameFr,
  "slug": slug.current,
  tagline,
  taglineFr,
  description,
  descriptionFr,
  content,
  contentFr,
  officialUrl,
  imageSource,
  images,
  gallery,
  videoUrl,
  supportingLinks,
  seoTitle,
  seoDescription,
  specs,
  pricing,
  releaseDate,
  model,
  availability,
  rating,
  reviewCount,
  affiliateLink,
  storeUrl,
  "category": category->{title, "slug": slug.current, color}
`

/** Resolves each `productCard` block's product reference inside a portable-text array. */
const contentBlockMapping = groq`
  {
    ...,
    "media": media{
      ...,
      "asset": asset->{_id, url, mimeType, size, originalFilename}
    },
    "product": product->{
      _id,
      name,
      "slug": slug.current,
      tagline,
      images,
      specs,
      pricing,
      releaseDate,
      rating,
      reviewCount,
      affiliateLink,
      storeUrl,
      "category": category->{title, "slug": slug.current, color}
    }
  }
`

const sidebarSlideFields = groq`
  _key,
  enabled,
  title,
  titleFr,
  description,
  descriptionFr,
  mediaType,
  image,
  "video": video{
    "asset": asset->{_id, url, mimeType, size, originalFilename}
  },
  embedUrl,
  posterImage,
  destinationUrl,
  openInNewTab,
  startsAt,
  endsAt,
  sponsorLabel,
  sponsorLabelFr
`

const articleSidebarFields = groq`
  enabled,
  announcementsTitle,
  announcementsTitleFr,
  "announcements": announcements[
    coalesce(enabled, true) == true &&
    (!defined(startsAt) || startsAt <= now()) &&
    (!defined(endsAt) || endsAt > now())
  ]{
    ${sidebarSlideFields}
  },
  featuredTitle,
  featuredTitleFr,
  "featuredPosts": featuredPosts[]->{
    ${postFields}
  },
  recentTitle,
  recentTitleFr,
  recentPostsCount,
  trendingTitle,
  trendingTitleFr,
  "trendingProducts": trendingProducts[]->{
    ${productFields}
  },
  sponsoredTitle,
  sponsoredTitleFr,
  "sponsoredSlides": sponsoredSlides[
    coalesce(enabled, true) == true &&
    (!defined(startsAt) || startsAt <= now()) &&
    (!defined(endsAt) || endsAt > now())
  ]{
    ${sidebarSlideFields}
  }
`

/* ---- Settings ---- */

export const settingsQuery = groq`
  coalesce(
    *[_id == "settings"][0],
    *[_type == "settings"] | order(_updatedAt desc)[0]
  ) {
    title,
    tagline,
    description,
    ogImage,
    "social": social,
    "seoDefaults": seoDefaults,
    "newsletter": newsletter,
    "analytics": analytics,
    "footer": footer,
    "articleSidebar": articleSidebar {
      ${articleSidebarFields}
    }
  }
`

/* ---- Navigation ---- */

export const navigationQuery = groq`
  *[_type == "navigation"][0] {
    title,
    items,
    footer
  }
`

/* ---- Categories ---- */

export const categoriesQuery = groq`
  *[_type == "category"] | order(displayOrder asc) {
    ${categoryFields}
    "articleCount": count(*[
      _type == "post" &&
      (category._ref == ^._id || category->parent._ref == ^._id) &&
      (!defined(status) || status == "published")
    ]),
    "subcategories": *[_type == "category" && references(^._id)] | order(displayOrder asc) {
      _id,
      title,
      titleFr,
      "slug": slug.current,
      description,
      descriptionFr,
      color,
      displayOrder
    }
  }
`

export const categoryBySlugQuery = groq`
  *[_type == "category" && slug.current == $slug][0] {
    ${categoryFields}
    "articleCount": count(*[
      _type == "post" &&
      (category._ref == ^._id || category->parent._ref == ^._id) &&
      (!defined(status) || status == "published")
    ]),
    "subcategories": *[_type == "category" && references(^._id)] | order(displayOrder asc) {
      _id,
      title,
      titleFr,
      "slug": slug.current,
      description,
      descriptionFr,
      color,
      displayOrder
    }
  }
`

/* ---- Tags ---- */

export const allTagsQuery = groq`
  *[_type == "tag"] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    type,
    "articleCount": count(*[
      _type == "post" &&
      references(^._id) &&
      (!defined(status) || status == "published")
    ])
  }
`

/* ---- Homepage ---- */

export const indexQuery = groq`
  *[_type == "post" && (!defined(status) || status == "published")]
    | order(date desc, _updatedAt desc) {
    ${postFields}
  }`

export const featuredPostQuery = groq`
  *[_type == "post" && featured == true && (!defined(status) || status == "published")][0] {
    content,
    contentFr,
    ${postFields}
  }`

export const trendingPostsQuery = groq`
  *[_type == "post" && trending == true && (!defined(status) || status == "published")]
    | order(date desc) [0...6] {
    ${postFields}
  }`

export const latestPostsQuery = groq`
  *[_type == "post" && (!defined(status) || status == "published")]
    | order(date desc, _updatedAt desc) [0...12] {
    ${postFields}
  }`

/* ---- Single post ---- */

export const postAndMoreStoriesQuery = groq`
  {
    "post": *[_type == "post" && slug.current == $slug && (!defined(status) || status == "published")] | order(_updatedAt desc) [0] {
      "content": content[] ${contentBlockMapping},
      "contentFr": contentFr[] ${contentBlockMapping},
      ${postFields}
    },
    "morePosts": *[_type == "post" && slug.current != $slug && (!defined(status) || status == "published")] | order(date desc, _updatedAt desc) [0...4] {
      "content": content[] ${contentBlockMapping},
      "contentFr": contentFr[] ${contentBlockMapping},
      ${postFields}
    },
    "articleSidebar": coalesce(
      *[_id == "settings"][0].articleSidebar,
      *[_type == "settings"] | order(_updatedAt desc)[0].articleSidebar
    ) {
      ${articleSidebarFields}
    },
    "fallbackFeaturedPosts": *[
      _type == "post" &&
      featured == true &&
      slug.current != $slug &&
      (!defined(status) || status == "published")
    ] | order(date desc, _updatedAt desc) [0...3] {
      ${postFields}
    },
    "recentPosts": *[
      _type == "post" &&
      slug.current != $slug &&
      (!defined(status) || status == "published")
    ] | order(date desc, _updatedAt desc) [0...10] {
      ${postFields}
    }
  }`

export const postBySlugQuery = groq`
  *[_type == "post" && slug.current == $slug][0] {
    "content": content[] ${contentBlockMapping},
    "contentFr": contentFr[] ${contentBlockMapping},
    ${postFields}
  }`

export const postSlugsQuery = groq`
  *[_type == "post" && defined(slug.current) && (!defined(status) || status == "published")][].slug.current
`

/* ---- Archive / listing ---- */

export const postsByCategoryQuery = groq`
  *[
    _type == "post" &&
    (category->slug.current == $slug || category->parent->slug.current == $slug) &&
    (!defined(status) || status == "published")
  ]
    | order(date desc, _updatedAt desc) [$start...$end] {
    ${postFields}
  }`

export const postsByTagQuery = groq`
  *[_type == "post" && references($tagId) && (!defined(status) || status == "published")]
    | order(date desc, _updatedAt desc) [$start...$end] {
    ${postFields}
  }`

export const relatedPostsQuery = groq`
  *[_type == "post"
    && slug.current != $slug
    && (!defined(status) || status == "published")
    && count(tags[]._ref in $tagIds) > 0
  ] | order(date desc) [0...3] {
    ${postFields}
  }`

export const postsByAuthorQuery = groq`
  *[_type == "post" && author->slug.current == $authorSlug
    && (!defined(status) || status == "published")] | order(date desc) {
    ${postFields}
  }`

/* ---- Search ---- */

export const globalSearchQuery = groq`
  *[
    _type in ["post", "product", "page", "category", "tag", "author", "series"]
    && (_type != "post" || !defined(status) || status == "published")
    && (
      title match $term ||
      titleFr match $term ||
      name match $term ||
      nameFr match $term ||
      excerpt match $term ||
      excerptFr match $term ||
      description match $term ||
      descriptionFr match $term ||
      tagline match $term ||
      taglineFr match $term ||
      bio match $term ||
      longBio match $term ||
      headline match $term ||
      pt::text(content) match $term ||
      pt::text(contentFr) match $term
    )
  ][0...100] {
    _id,
    _type,
    _updatedAt,
    date,
    contentType,
    title,
    titleFr,
    name,
    nameFr,
    excerpt,
    excerptFr,
    description,
    descriptionFr,
    tagline,
    taglineFr,
    bio,
    longBio,
    headline,
    "slug": slug.current,
    "body": pt::text(content),
    "bodyFr": pt::text(contentFr),
    coverImage,
    picture,
    images,
    "category": category->{title, "slug": slug.current},
    "tags": tags[]->{title, "slug": slug.current}
  }`

/* ---- Products ---- */

export const productsQuery = groq`
  *[_type == "product"] | order(name asc) {
    ${productFields}
  }`

export const productBySlugQuery = groq`
  *[_type == "product" && slug.current == $slug][0] {
    ${productFields},
    relatedProducts[]->{${productFields}}
  }`

/* ---- Authors ---- */

export const authorsQuery = groq`
  *[_type == "author"] | order(name asc) {
    ${authorFields}
  }`

export const authorBySlugQuery = groq`
  *[_type == "author" && slug.current == $slug][0] {
    ${authorFields}
  }`

/* ---- Pages ---- */

export const pageBySlugQuery = groq`
  *[_type == "page" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    content,
    excerpt,
    coverImage,
    seoTitle,
    seoDescription
  }`

/* ---- Comments ---- */

export const approvedCommentsQuery = groq`
  *[_type == "comment" && post._ref == $postId && status == "approved"]
  | order(createdAt asc) {
    _id,
    name,
    content,
    createdAt,
    likes,
    dislikes,
    shares,
    images[]{
      _key,
      asset,
      alt
    },
    avatar,
    "parent": parent._ref
  }`

export const approvedAuthorReviewsQuery = groq`
  *[_type == "authorReview" && author->slug.current == $authorSlug && status == "approved"]
    | order(createdAt desc) [0...30] {
      _id, name, rating, title, content, createdAt
    }
`

/* ---- Data for sitemap / RSS ---- */

export const allPostsForSitemapQuery = groq`
  *[_type == "post" && defined(slug.current)][0...1000] {
    "slug": slug.current,
    date,
    _updatedAt,
    title,
    excerpt,
    "category": category->title,
    "author": author->name,
    "tags": tags[]->title,
    coverImage,
    "locale": *[_type == "settings"][0].locales
  }`

export const rssFeedQuery = groq`
  *[_type == "post"] | order(date desc) [0...50] {
    ${postFields}
  }`

/* ============================================================
   TypeScript interfaces
   ============================================================ */

export interface Author {
  _id?: string
  name?: string
  nameFr?: string
  slug?: string
  headline?: string
  role?: string
  location?: string
  nationality?: string
  languages?: string[]
  yearsExperience?: number
  picture?: any
  bio?: string
  longBio?: string
  quote?: string
  expertise?: string[]
  achievements?: string[]
  education?: { degree?: string; school?: string; year?: string }[]
  social?: any
}

export interface Category {
  _id: string
  title?: string
  titleFr?: string
  slug?: string
  description?: string
  descriptionFr?: string
  seoTitle?: string
  seoTitleFr?: string
  seoDescription?: string
  seoDescriptionFr?: string
  color?: string
  image?: any
  displayOrder?: number
  showInNav?: boolean
  parent?: { _id: string; title?: string; titleFr?: string; slug?: string }
  articleCount?: number
  subcategories?: Array<{
    _id: string
    title?: string
    titleFr?: string
    slug?: string
    description?: string
    descriptionFr?: string
    color?: string
    displayOrder?: number
  }>
}

export function getLocalizedCategory(category: Category, locale: string) {
  const isFr = locale === 'fr'
  return {
    title: stripInvalidStega(
      (isFr ? category.titleFr || category.title : category.title) || '',
    ),
    description: stripInvalidStega(
      (isFr
        ? category.descriptionFr || category.description
        : category.description) || '',
    ),
    seoTitle: stripInvalidStega(
      (isFr
        ? category.seoTitleFr ||
          category.seoTitle ||
          category.titleFr ||
          category.title
        : category.seoTitle || category.title) || '',
    ),
    seoDescription: stripInvalidStega(
      (isFr
        ? category.seoDescriptionFr ||
          category.seoDescription ||
          category.descriptionFr ||
          category.description
        : category.seoDescription || category.description) || '',
    ),
  }
}

export interface Product {
  _id: string
  name?: string
  nameFr?: string
  slug?: string
  tagline?: string
  taglineFr?: string
  description?: string
  descriptionFr?: string
  content?: any
  contentFr?: any
  officialUrl?: string
  imageSource?: string
  images?: any[]
  gallery?: any[]
  videoUrl?: string
  supportingLinks?: { label?: string; labelFr?: string; url?: string }[]
  seoTitle?: string
  seoDescription?: string
  specs?: { label?: string; value?: string }[]
  pricing?: {
    XAF?: number
    USD?: number
    EUR?: number
    ZAR?: number
    KES?: number
    NGN?: number
    EGP?: number
    GHS?: number
  }
  releaseDate?: string
  model?: string
  availability?: 'InStock' | 'PreOrder' | 'OutOfStock'
  rating?: number
  reviewCount?: number
  affiliateLink?: string
  storeUrl?: string
  category?: { title?: string; slug?: string; color?: string }
  relatedProducts?: Product[]
}

export interface Tag {
  _id: string
  title?: string
  slug?: string
  type?: string
  articleCount?: number
}

export interface Post {
  _id: string
  contentType?: string
  locale?: string
  status?: string
  title?: string
  titleFr?: string
  excerpt?: string
  excerptFr?: string
  coverImage?: any
  date?: string
  _updatedAt?: string
  featured?: boolean
  trending?: boolean
  noIndex?: boolean
  seoTitle?: string
  seoTitleFr?: string
  seoDescription?: string
  seoDescriptionFr?: string
  seoKeywords?: string
  focusKeyphrase?: string
  sources?: {
    _key?: string
    title?: string
    url?: string
    publisher?: string
    accessedAt?: string
  }[]
  correctionNote?: string
  correctionNoteFr?: string
  ogImage?: any
  sponsored?: boolean
  updatedAt?: string
  author?: Author
  coAuthors?: Author[]
  category?: Category
  tags?: Tag[]
  series?: { _id: string; title?: string; slug?: string }
  productMentions?: Product[]
  slug?: string
  content?: any
  contentFr?: any
  readingTime?: number
  relatedPosts?: Post[]
  verdictVoteTotal?: number
  verdictVoteCount?: number
}

/** Bilingual helpers: pick title/excerpt/content for a given locale,
 *  falling back to the other language when a translation is missing. */
export function getLocalized(post: Post, locale: string) {
  const isFr = locale === 'fr'
  return {
    title: stripInvalidStega(
      (isFr ? post.titleFr || post.title : post.title) || '',
    ),
    excerpt: stripInvalidStega(
      (isFr ? post.excerptFr || post.excerpt : post.excerpt) || '',
    ),
    content: stripInvalidStegaDeep(
      (isFr ? post.contentFr || post.content : post.content) || post.content,
    ),
  }
}

export interface Settings {
  title?: string
  tagline?: string
  description?: any[]
  ogImage?: {
    title?: string
  }
  social?: Record<string, string>
  seoDefaults?: {
    titleSuffix?: string
    organizationName?: string
    legalName?: string
    description?: string
    descriptionFr?: string
    newsPublicationName?: string
    enableNewsSitemap?: boolean
    foundingDate?: string
    email?: string
    telephone?: string
    address?: {
      streetAddress?: string
      addressLocality?: string
      addressRegion?: string
      postalCode?: string
      addressCountry?: string
    }
    googleSiteVerification?: string
    bingSiteVerification?: string
    twitterHandle?: string
    defaultKeywords?: string[]
  }
  newsletter?: {
    title?: string
    description?: string
    enabled?: boolean
  }
  analytics?: {
    ga4Id?: string
    gtmId?: string
    metaPixel?: string
  }
  footer?: {
    aboutText?: string
    aboutTextFr?: string
    copyright?: string
    copyrightFr?: string
    email?: string
  }
  articleSidebar?: ArticleSidebar
}

export interface ArticleSidebarSlide {
  _key?: string
  enabled?: boolean
  title?: string
  titleFr?: string
  description?: string
  descriptionFr?: string
  mediaType?: 'image' | 'video' | 'embed'
  image?: any
  video?: {
    asset?: {
      _id?: string
      url?: string
      mimeType?: string
      size?: number
      originalFilename?: string
    }
  }
  embedUrl?: string
  posterImage?: any
  destinationUrl?: string
  openInNewTab?: boolean
  startsAt?: string
  endsAt?: string
  sponsorLabel?: string
  sponsorLabelFr?: string
}

export interface ArticleSidebar {
  enabled?: boolean
  announcementsTitle?: string
  announcementsTitleFr?: string
  announcements?: ArticleSidebarSlide[]
  featuredTitle?: string
  featuredTitleFr?: string
  featuredPosts?: Post[]
  recentTitle?: string
  recentTitleFr?: string
  recentPostsCount?: number
  trendingTitle?: string
  trendingTitleFr?: string
  trendingProducts?: Product[]
  sponsoredTitle?: string
  sponsoredTitleFr?: string
  sponsoredSlides?: ArticleSidebarSlide[]
}

export interface NavigationItem {
  label: string
  labelFr?: string
  url: string
  children?: {
    label: string
    labelFr?: string
    url?: string
    description?: string
    descriptionFr?: string
    featured?: boolean
  }[]
}

export interface Navigation {
  title?: string
  items?: NavigationItem[]
  footer?: {
    heading?: string
    headingFr?: string
    links?: {
      label?: string
      labelFr?: string
      url?: string
      external?: boolean
    }[]
  }[]
}

export interface Comment {
  _id: string
  name: string
  content: string
  createdAt: string
  parent?: string
  likes?: number
  dislikes?: number
  shares?: number
  images?: any[]
  avatar?: any
}

export interface AuthorReview {
  _id: string
  name: string
  rating: number
  title?: string
  content: string
  createdAt: string
}

export interface Page {
  _id: string
  title?: string
  slug?: string
  content?: any
  excerpt?: string
  coverImage?: any
  seoTitle?: string
  seoDescription?: string
}

export type SearchContentType =
  | 'post'
  | 'product'
  | 'page'
  | 'category'
  | 'tag'
  | 'author'
  | 'series'

export interface GlobalSearchResult {
  id: string
  type: SearchContentType
  subtype?: string
  title: string
  description: string
  snippet: string
  href: string
  score: number
  image?: any
  category?: string
  updatedAt?: string
}

export interface GlobalSearchResponse {
  query: string
  results: GlobalSearchResult[]
  suggestions: string[]
  total: number
  counts: Partial<Record<SearchContentType, number>>
}
