import type { MetadataRoute } from 'next'

import { SITE } from '@/lib/constants'
import { isConfigured } from '@/lib/sanity.api'
import {
  getAllPosts,
  getAllTags,
  getAuthors,
  getCategories,
  getClient,
  getProducts,
} from '@/lib/sanity.client'

const locales = ['en', 'fr'] as const

function localizedEntry(
  path: string,
  lastModified: Date,
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'],
  priority: number,
): MetadataRoute.Sitemap[number][] {
  const base = SITE.url.replace(/\/$/, '')
  const languages = {
    en: `${base}/en${path}`,
    fr: `${base}/fr${path}`,
    'x-default': `${base}/en${path}`,
  }
  return locales.map((locale) => ({
    url: `${base}/${locale}${path}`,
    lastModified,
    changeFrequency,
    priority,
    alternates: { languages },
  }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const entries: MetadataRoute.Sitemap = [
    ...localizedEntry('', now, 'daily', 1),
    ...localizedEntry('/posts', now, 'daily', 0.9),
    ...localizedEntry('/categories', now, 'daily', 0.85),
    ...localizedEntry('/products', now, 'daily', 0.9),
    ...localizedEntry('/authors', now, 'weekly', 0.7),
    ...localizedEntry('/tags', now, 'weekly', 0.6),
    ...localizedEntry('/about', now, 'monthly', 0.7),
    ...localizedEntry('/search', now, 'weekly', 0.5),
    ...[
      'privacy',
      'terms',
      'editorial-policy',
      'contact',
      'transparency',
    ].flatMap((slug) => localizedEntry(`/pages/${slug}`, now, 'monthly', 0.6)),
  ]

  if (!isConfigured) return entries

  try {
    const client = getClient()
    const [posts, products, categories, tags, authors] = await Promise.all([
      getAllPosts(client),
      getProducts(client),
      getCategories(client),
      getAllTags(client),
      getAuthors(client),
    ])
    for (const post of posts) {
      if (!post.slug || post.noIndex) continue
      entries.push(
        ...localizedEntry(
          `/posts/${post.slug}`,
          new Date(post.updatedAt || post._updatedAt || post.date || now),
          'weekly',
          0.9,
        ),
      )
    }
    for (const product of products) {
      if (!product.slug) continue
      entries.push(
        ...localizedEntry(`/products/${product.slug}`, now, 'weekly', 0.8),
      )
    }
    for (const category of categories) {
      if (!category.slug) continue
      entries.push(
        ...localizedEntry(`/categories/${category.slug}`, now, 'daily', 0.8),
      )
    }
    for (const tag of tags) {
      if (!tag.slug) continue
      entries.push(...localizedEntry(`/tags/${tag.slug}`, now, 'weekly', 0.6))
    }
    for (const author of authors) {
      if (!author.slug) continue
      entries.push(
        ...localizedEntry(`/authors/${author.slug}`, now, 'weekly', 0.7),
      )
    }
  } catch {
    return entries
  }

  return entries
}
