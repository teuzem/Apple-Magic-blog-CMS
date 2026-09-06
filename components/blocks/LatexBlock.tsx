import katex from 'katex'

export default function LatexBlock({
  block,
  locale = 'en',
}: {
  block: any
  locale?: string
}) {
  const caption =
    locale === 'fr'
      ? block?.captionFr || block?.caption
      : block?.caption || block?.captionFr
  if (!block?.formula) return null
  const html = katex.renderToString(block.formula, {
    displayMode: block.displayMode !== false,
    throwOnError: false,
    strict: 'warn',
    trust: false,
    output: 'htmlAndMathml',
  })
  return (
    <figure className="my-8 max-w-full overflow-hidden rounded-lg border border-gray-5 bg-gray-7 p-5 dark:border-gray-2 dark:bg-gray-1">
      <div
        className={`max-w-full overflow-x-auto font-serif text-ink dark:text-white ${
          block.displayMode === false ? 'text-lg' : 'py-3 text-center text-2xl'
        }`}
        role="math"
        aria-label={block.alt || block.formula}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {caption && (
        <figcaption className="mt-2 text-center text-sm text-gray-3">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
