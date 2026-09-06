import { urlForImage } from '@/lib/sanity.image'

export default function MediaFileBlock({
  block,
  locale = 'en',
}: {
  block: any
  locale?: string
}) {
  const asset = block?.media?.asset
  if (!asset?.url) return null
  const title =
    locale === 'fr'
      ? block.titleFr || block.title
      : block.title || block.titleFr
  const caption =
    locale === 'fr'
      ? block.captionFr || block.caption
      : block.caption || block.captionFr
  const transcript =
    locale === 'fr'
      ? block.transcriptFr || block.transcript
      : block.transcript || block.transcriptFr

  if (block.kind === 'audio') {
    return (
      <figure className="my-8 rounded-lg border border-gray-5 p-4 dark:border-gray-2">
        {title && <h4 className="mb-3 text-lg font-semibold">{title}</h4>}
        <audio controls preload="metadata" className="w-full" src={asset.url} />
        {caption && (
          <figcaption className="mt-2 text-sm text-gray-3">
            {caption}
          </figcaption>
        )}
        <Transcript text={transcript} locale={locale} />
      </figure>
    )
  }

  if (block.kind === 'file') {
    return (
      <aside className="my-8 rounded-lg border border-gray-5 p-5 dark:border-gray-2">
        <h4 className="text-lg font-semibold">
          {title || asset.originalFilename || 'Download'}
        </h4>
        {caption && <p className="mt-2 text-sm text-gray-3">{caption}</p>}
        <a
          href={asset.url}
          download
          className="mt-4 inline-flex min-h-11 items-center rounded-md bg-apple-blue px-5 py-3 text-sm font-semibold text-white"
        >
          {locale === 'fr' ? 'Télécharger le fichier' : 'Download file'}
        </a>
      </aside>
    )
  }

  const poster = block.poster
    ? urlForImage(block.poster).width(1600).url()
    : undefined
  return (
    <figure className="my-8">
      {title && (
        <h4 className="mb-3 text-center text-xl font-semibold sm:text-left">
          {title}
        </h4>
      )}
      <video
        controls
        playsInline
        muted={Boolean(block.autoplay)}
        autoPlay={Boolean(block.autoplay)}
        loop={Boolean(block.loop)}
        preload="metadata"
        poster={poster}
        className="aspect-video w-full rounded-lg bg-black object-contain"
      >
        <source src={asset.url} type={asset.mimeType || 'video/mp4'} />
      </video>
      {caption && (
        <figcaption className="mt-2 text-center text-sm text-gray-3">
          {caption}
        </figcaption>
      )}
      <Transcript text={transcript} locale={locale} />
    </figure>
  )
}

function Transcript({ text, locale }: { text?: string; locale: string }) {
  if (!text) return null
  return (
    <details className="mt-3">
      <summary className="cursor-pointer font-medium">
        {locale === 'fr' ? 'Transcription' : 'Transcript'}
      </summary>
      <p className="mt-2 whitespace-pre-wrap text-sm text-gray-2 dark:text-gray-8">
        {text}
      </p>
    </details>
  )
}
