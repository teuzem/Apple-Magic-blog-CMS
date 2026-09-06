import { SITE } from '@/lib/constants'
import { type EmbedProvider, getEmbedUrl } from '@/lib/embed'

/**
 * Responsive embed block for YouTube / Vimeo / Twitter / Instagram / TikTok.
 * Generates an iframe for the known providers.
 */
export default function EmbedBlock({ block }: { block: any }) {
  const { provider = 'auto', url } = block || {}
  const caption =
    block?.locale === 'fr'
      ? block.captionFr || block.caption
      : block.caption || block.captionFr

  if (!url) return null

  const parentHost = new URL(SITE.url).hostname
  const embedUrl = getEmbedUrl(url, provider as EmbedProvider, parentHost)
  const aspectRatio = String(block?.aspectRatio || '16/9').replace('/', ' / ')

  if (!embedUrl) {
    // Fall back to a link
    return (
      <div className="my-6">
        <p className="text-sm text-gray-3 dark:text-gray-4">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-apple-blue underline"
          >
            Open embedded content
          </a>
          {caption ? ` — ${caption}` : ''}
        </p>
      </div>
    )
  }

  return (
    <figure className="my-8 min-w-0 max-w-full">
      <div className="max-w-full overflow-hidden rounded-lg">
        <iframe
          src={embedUrl}
          title={block?.title || caption || 'Embedded content'}
          className="w-full border-0"
          style={{ aspectRatio }}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-[0.8125rem] text-gray-3 dark:text-gray-4">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
