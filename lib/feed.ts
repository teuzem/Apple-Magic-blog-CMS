import { SITE } from '@/lib/constants'
import { urlForImage } from '@/lib/sanity.image'
import { getLocalized, type Post } from '@/lib/sanity.queries'
import { stripHtml } from '@/lib/utils'

export function feedPost(post: Post, locale: string) {
  const localized = getLocalized(post, locale)
  const link = `${SITE.url.replace(/\/$/, '')}/${locale}/posts/${post.slug}`
  const image = post.coverImage
    ? urlForImage(post.coverImage).width(1200).url()
    : undefined
  const description = stripHtml(localized.excerpt || '').trim()
  return {
    post,
    title: localized.title,
    description:
      description || `Read ${localized.title || 'this story'} on ${SITE.name}.`,
    link,
    image,
    pubDate: new Date(post.date || post._updatedAt || Date.now()),
    author: post.author?.name,
    category: post.category?.title,
    tags: post.tags?.map((tag) => tag.title).filter(Boolean) as
      | string[]
      | undefined,
  }
}

export function xmlEscape(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function cdata(value: unknown) {
  return `<![CDATA[${String(value ?? '').replace(/]]>/g, ']]]]><![CDATA[>')}]]>`
}

export function getFeedPosts(posts: Post[], locale: string, category?: string) {
  return posts
    .filter((post) => !post.status || post.status === 'published')
    .filter((post) => !category || post.category?.slug === category)
    .sort(
      (a, b) =>
        new Date(b.date || b._updatedAt || 0).getTime() -
        new Date(a.date || a._updatedAt || 0).getTime(),
    )
    .slice(0, 50)
    .map((post) => feedPost(post, locale))
}
