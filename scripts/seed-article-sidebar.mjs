/**
 * Non-destructive article sidebar seed.
 *
 * Creates the canonical `settings` singleton from the legacy settings document
 * when necessary, then fills only missing article-sidebar fields using existing
 * published posts, products and Sanity image assets.
 *
 * Usage: node scripts/seed-article-sidebar.mjs
 */
import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const env = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8')
const get = (name) => {
  const match = env.match(new RegExp(`^${name}=(.*)$`, 'm'))
  return match ? match[1].trim().replace(/^"|"$/g, '') : ''
}

const projectId = get('NEXT_PUBLIC_SANITY_PROJECT_ID')
const dataset = get('NEXT_PUBLIC_SANITY_DATASET') || 'production'
const token = get('SANITY_API_WRITE_TOKEN')

if (!projectId || !token) {
  throw new Error(
    'NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN are required.',
  )
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2026-09-04',
  useCdn: false,
})

const cleanDocument = (document) => {
  const {
    _rev: _ignoredRev,
    _createdAt: _ignoredCreatedAt,
    _updatedAt: _ignoredUpdatedAt,
    ...content
  } = document
  return content
}

const reference = (document, prefix, index) => ({
  _type: 'reference',
  _key: `${prefix}-${index + 1}-${document._id.replace(/[^a-z0-9]/gi, '-')}`,
  _ref: document._id,
})

const slideFromPost = (post, index) => ({
  _type: 'articleSidebarSlide',
  _key: `announcement-${index + 1}-${post._id.replace(/[^a-z0-9]/gi, '-')}`,
  enabled: true,
  title: post.title || 'Apple Magic update',
  titleFr: post.titleFr || post.title || 'Actualite Apple Magic',
  description:
    post.excerpt ||
    'Read the latest Apple news, analysis and practical recommendations.',
  descriptionFr:
    post.excerptFr ||
    post.excerpt ||
    'Decouvrez les dernieres actualites, analyses et recommandations Apple.',
  mediaType: 'image',
  image: post.coverImage,
  destinationUrl: `/posts/${post.slug}`,
  openInNewTab: false,
})

const slideFromProduct = (product, index) => {
  const image = product.images?.[0] || product.gallery?.[0]?.image
  return {
    _type: 'articleSidebarSlide',
    _key: `sponsored-${index + 1}-${product._id.replace(/[^a-z0-9]/gi, '-')}`,
    enabled: true,
    title: product.name || 'Apple Magic selection',
    titleFr: product.nameFr || product.name || 'Selection Apple Magic',
    description:
      product.tagline ||
      'Discover product details, specifications and current buying options.',
    descriptionFr:
      product.taglineFr ||
      product.tagline ||
      "Decouvrez la fiche, les caracteristiques et les options d'achat.",
    mediaType: 'image',
    image,
    destinationUrl: product.storeUrl || `/products/${product.slug}`,
    openInNewTab: Boolean(product.storeUrl),
    sponsorLabel: 'Apple Magic selection',
    sponsorLabelFr: 'Selection Apple Magic',
  }
}

const [canonical, legacy, posts, products] = await Promise.all([
  client.fetch('*[_id == "settings"][0]'),
  client.fetch(
    '*[_type == "settings" && _id != "settings"] | order(_updatedAt desc)[0]',
  ),
  client.fetch(
    '*[_type == "post" && defined(slug.current) && (!defined(status) || status == "published")] | order(featured desc, date desc, _updatedAt desc)[0...8]{_id,title,titleFr,excerpt,excerptFr,"slug":slug.current,coverImage,featured}',
  ),
  client.fetch(
    '*[_type == "product" && defined(slug.current)] | order(rating desc, reviewCount desc, _updatedAt desc)[0...8]{_id,name,nameFr,tagline,taglineFr,"slug":slug.current,images,gallery,storeUrl}',
  ),
])

let settings = canonical
if (!settings) {
  settings = legacy
    ? await client.createIfNotExists({
        ...cleanDocument(legacy),
        _id: 'settings',
        _type: 'settings',
      })
    : await client.createIfNotExists({
        _id: 'settings',
        _type: 'settings',
        title: 'Apple Magic Blog',
      })
}

const featured = posts.filter((post) => post.featured).slice(0, 3)
const featuredPosts = (featured.length >= 3 ? featured : posts.slice(0, 3)).map(
  (post, index) => reference(post, 'featured', index),
)
const trendingProducts = products
  .slice(0, 6)
  .map((product, index) => reference(product, 'trending', index))
const announcements = posts
  .filter((post) => post.coverImage)
  .slice(0, 3)
  .map(slideFromPost)
const sponsoredSlides = products
  .filter((product) => product.images?.[0] || product.gallery?.[0]?.image)
  .slice(0, 3)
  .map(slideFromProduct)

await client
  .patch(settings._id)
  .setIfMissing({
    articleSidebar: {},
    'articleSidebar.enabled': true,
    'articleSidebar.announcementsTitle': 'Apple news',
    'articleSidebar.announcementsTitleFr': 'Actualites Apple',
    'articleSidebar.announcements': announcements,
    'articleSidebar.featuredTitle': 'Featured posts',
    'articleSidebar.featuredTitleFr': 'Articles a la une',
    'articleSidebar.featuredPosts': featuredPosts,
    'articleSidebar.recentTitle': 'Latest posts',
    'articleSidebar.recentTitleFr': 'Articles recents',
    'articleSidebar.recentPostsCount': 5,
    'articleSidebar.trendingTitle': 'Trending products',
    'articleSidebar.trendingTitleFr': 'Produits tendance',
    'articleSidebar.trendingProducts': trendingProducts,
    'articleSidebar.sponsoredTitle': 'Sponsored',
    'articleSidebar.sponsoredTitleFr': 'Sponsorise',
    'articleSidebar.sponsoredSlides': sponsoredSlides,
  })
  .commit({ autoGenerateArrayKeys: true })

console.log(
  JSON.stringify(
    {
      settingsId: settings._id,
      announcements: announcements.length,
      featuredPosts: featuredPosts.length,
      recentPostsCount: 5,
      trendingProducts: trendingProducts.length,
      sponsoredSlides: sponsoredSlides.length,
    },
    null,
    2,
  ),
)
