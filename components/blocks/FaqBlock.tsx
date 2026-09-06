export default function FaqBlock({
  block,
  locale = 'en',
}: {
  block: any
  locale?: string
}) {
  const items = Array.isArray(block?.items) ? block.items : []
  if (!items.length) return null
  const heading =
    locale === 'fr'
      ? block.titleFr || block.title || 'Questions fréquentes'
      : block.title || block.titleFr || 'Frequently asked questions'

  return (
    <section
      className="my-10"
      aria-labelledby={`faq-${block._key || 'article'}`}
    >
      <h2
        id={`faq-${block._key || 'article'}`}
        className="mb-5 text-center text-3xl font-bold tracking-tight text-ink sm:text-left dark:text-white"
      >
        {heading}
      </h2>
      <div className="divide-y divide-gray-6 border-y border-gray-6 dark:divide-gray-2 dark:border-gray-2">
        {items.map((item: any) => {
          const question =
            locale === 'fr'
              ? item.questionFr || item.question
              : item.question || item.questionFr
          const answer =
            locale === 'fr'
              ? item.answerFr || item.answer
              : item.answer || item.answerFr
          if (!question || !answer) return null
          return (
            <details key={item._key || question} className="group py-4">
              <summary className="cursor-pointer list-none pr-8 text-lg font-semibold text-ink marker:hidden dark:text-white">
                {question}
              </summary>
              <p className="mt-3 max-w-3xl text-base leading-7 text-gray-2 dark:text-gray-8">
                {answer}
              </p>
            </details>
          )
        })}
      </div>
    </section>
  )
}
