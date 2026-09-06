import createImageUrlBuilder from '@sanity/image-url'

import { dataset, projectId } from '@/lib/sanity.api'

const imageBuilder = createImageUrlBuilder({ projectId, dataset })

export const urlForImage = (source: any) =>
  imageBuilder.image(source).auto('format').fit('max')

/**
 * Build a small, blurry placeholder data-URI for an image.
 * Perfect for LQIP (low-quality image placeholder) during loading.
 */
export function urlForBlur(source: any, size = 20) {
  if (!source) return undefined
  return imageBuilder
    .image(source)
    .width(size)
    .height(size)
    .auto('format')
    .fit('max')
    .blur(20)
    .url()
}

/**
 * Build a responsive srcSet from an image source for the given widths.
 */
export function urlForSrcSet(
  source: any,
  widths = [320, 640, 750, 828, 1080, 1200, 1920],
) {
  if (!source) return ''
  return widths
    .map(
      (w) =>
        `${imageBuilder.image(source).width(w).auto('format').fit('max').url()} ${w}w`,
    )
    .join(', ')
}
