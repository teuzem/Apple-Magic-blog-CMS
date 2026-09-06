import type { PreviewData } from 'next'
import { createClient, type SanityClient } from 'next-sanity'

import {
  apiVersion,
  dataset,
  projectId,
  studioUrl,
  useCdn,
} from '@/lib/sanity.api'
import type {
  ArticleSidebar,
  Author,
  AuthorReview,
  Category,
  Comment,
  Navigation,
  Page,
  Post,
  Product,
  Settings,
  Tag,
} from '@/lib/sanity.queries'
import {
  allTagsQuery,
  approvedAuthorReviewsQuery,
  approvedCommentsQuery,
  authorBySlugQuery,
  authorsQuery,
  categoriesQuery,
  categoryBySlugQuery,
  featuredPostQuery,
  globalSearchQuery,
  indexQuery,
  latestPostsQuery,
  navigationQuery,
  pageBySlugQuery,
  postAndMoreStoriesQuery,
  postBySlugQuery,
  postsByAuthorQuery,
  postsByCategoryQuery,
  postsByTagQuery,
  postSlugsQuery,
  productBySlugQuery,
  productsQuery,
  relatedPostsQuery,
  settingsQuery,
  trendingPostsQuery,
} from '@/lib/sanity.queries'
import { stripInvalidStegaDeep } from '@/lib/sanityStega'

export function getClient(preview?: {
  token: string
  perspective: PreviewData
  stega?: boolean
}): SanityClient {
  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn,
    perspective: 'published',
    // Opt in explicitly. Draft tokens alone must not inject stega markers into
    // transformed Portable Text, where copied/localized strings can become
    // invalid and trigger decoder errors in the browser.
    stega: { enabled: preview?.stega === true, studioUrl },
  })
  if (preview) {
    if (!preview.token) {
      throw new Error('You must provide a token to preview drafts')
    }
    return client.withConfig({
      token: preview.token,
      useCdn: false,
      ignoreBrowserTokenWarning: true,
      perspective:
        typeof preview.perspective === 'string'
          ? preview.perspective.split(',')
          : 'drafts',
    })
  }
  return client
}

export const getSanityImageConfig = () => getClient()

/* ---- Settings ---- */

export async function getSettings(client: SanityClient): Promise<Settings> {
  return (await client.fetch(settingsQuery)) || {}
}

/* ---- Navigation ---- */

export async function getNavigation(
  client: SanityClient,
): Promise<Navigation | null> {
  return await client.fetch(navigationQuery)
}

/* ---- Categories & Tags ---- */

export async function getCategories(client: SanityClient): Promise<Category[]> {
  return (await client.fetch(categoriesQuery)) || []
}

export async function getCategoryBySlug(
  client: SanityClient,
  slug: string,
): Promise<Category | null> {
  return await client.fetch(categoryBySlugQuery, { slug })
}

export async function getAllTags(client: SanityClient): Promise<Tag[]> {
  return (await client.fetch(allTagsQuery)) || []
}

/* ---- Posts ---- */

export async function getAllPosts(client: SanityClient): Promise<Post[]> {
  return (await client.fetch(indexQuery)) || []
}

export async function getFeaturedPost(
  client: SanityClient,
): Promise<Post | null> {
  return (await client.fetch(featuredPostQuery)) || null
}

export async function getTrendingPosts(client: SanityClient): Promise<Post[]> {
  return (await client.fetch(trendingPostsQuery)) || []
}

export async function getLatestPosts(client: SanityClient): Promise<Post[]> {
  return (await client.fetch(latestPostsQuery)) || []
}

export async function getAllPostsSlugs(): Promise<Pick<Post, 'slug'>[]> {
  const client = getClient()
  const slugs = (await client.fetch<string[]>(postSlugsQuery)) || []
  return slugs.map((slug) => ({ slug }))
}

export async function getPostBySlug(
  client: SanityClient,
  slug: string,
): Promise<Post> {
  const post = (await client.fetch(postBySlugQuery, { slug })) || ({} as Post)
  return stripInvalidStegaDeep(post)
}

export async function getPostAndMoreStories(
  client: SanityClient,
  slug: string,
): Promise<{
  post: Post
  morePosts: Post[]
  articleSidebar?: ArticleSidebar
  fallbackFeaturedPosts?: Post[]
  recentPosts?: Post[]
}> {
  const result = await client.fetch(postAndMoreStoriesQuery, { slug })
  return stripInvalidStegaDeep(result)
}

export async function getPostsByCategory(
  client: SanityClient,
  slug: string,
  start = 0,
  end = 20,
): Promise<Post[]> {
  return (await client.fetch(postsByCategoryQuery, { slug, start, end })) || []
}

export async function getPostsByTag(
  client: SanityClient,
  tagId: string,
  start = 0,
  end = 20,
): Promise<Post[]> {
  return (await client.fetch(postsByTagQuery, { tagId, start, end })) || []
}

export async function getRelatedPosts(
  client: SanityClient,
  slug: string,
  tagIds: string[],
): Promise<Post[]> {
  return (await client.fetch(relatedPostsQuery, { slug, tagIds })) || []
}

export async function getPostsByAuthor(
  client: SanityClient,
  authorSlug: string,
): Promise<Post[]> {
  return (await client.fetch(postsByAuthorQuery, { authorSlug })) || []
}

export async function searchAllContent(
  client: SanityClient,
  term: string,
): Promise<any[]> {
  return (await client.fetch(globalSearchQuery, { term } as any)) || []
}

/* ---- Products ---- */

export async function getProducts(client: SanityClient): Promise<Product[]> {
  return (await client.fetch(productsQuery)) || []
}

export async function getProductBySlug(
  client: SanityClient,
  slug: string,
): Promise<Product | null> {
  return await client.fetch(productBySlugQuery, { slug })
}

/* ---- Authors ---- */

export async function getAuthors(client: SanityClient): Promise<Author[]> {
  return (await client.fetch(authorsQuery)) || []
}

export async function getAuthorBySlug(
  client: SanityClient,
  slug: string,
): Promise<Author | null> {
  return await client.fetch(authorBySlugQuery, { slug })
}

/* ---- Pages ---- */

export async function getPageBySlug(
  client: SanityClient,
  slug: string,
): Promise<Page | null> {
  return await client.fetch(pageBySlugQuery, { slug })
}

/* ---- Comments ---- */

export async function getApprovedComments(
  client: SanityClient,
  postId: string,
): Promise<Comment[]> {
  return (await client.fetch(approvedCommentsQuery, { postId })) || []
}

export async function getApprovedAuthorReviews(
  client: SanityClient,
  authorSlug: string,
): Promise<AuthorReview[]> {
  return (await client.fetch(approvedAuthorReviewsQuery, { authorSlug })) || []
}

export type { Page }
