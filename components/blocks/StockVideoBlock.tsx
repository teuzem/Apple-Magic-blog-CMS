export default function StockVideoBlock({
  block,
  locale = 'en',
}: {
  block: any
  locale?: string
}) {
  if (!block?.url) return null
  const caption =
    locale === 'fr'
      ? block.captionFr || block.caption
      : block.caption || block.captionFr
  return (
    <figure className="my-8 min-w-0 max-w-full">
      <video
        controls
        playsInline
        preload="metadata"
        poster={block.posterUrl}
        className="aspect-video w-full rounded-lg bg-black object-contain"
      >
        <source src={block.url} type="video/mp4" />
      </video>
      <figcaption className="mt-2 text-center text-[0.8125rem] text-gray-3 dark:text-gray-4">
        {caption && <span>{caption} </span>}
        {block.sourceUrl && (
          <a
            href={block.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-apple-blue underline"
          >
            {block.creator || 'Contributor'} via {block.provider}
          </a>
        )}
      </figcaption>
    </figure>
  )
}
