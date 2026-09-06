import { CheckCircle2 } from 'lucide-react'

export interface ContentSection {
  heading?: string
  body?: string[]
  bullets?: string[]
}

/**
 * Renders structured bilingual page content: repeated sections of
 * paragraphs and bullet lists.
 */
export default function ContentSections({
  sections,
}: {
  sections: ContentSection[]
}) {
  return (
    <div className="space-y-10">
      {sections.map((section, i) => (
        <section key={i}>
          {section.heading && (
            <h2 className="mb-3 text-2xl font-bold tracking-tight text-ink dark:text-white">
              {section.heading}
            </h2>
          )}
          {section.body?.map((p, j) => (
            <p
              key={j}
              className="mb-3 text-[1.0625rem] leading-[1.8] text-gray-2 dark:text-gray-8"
            >
              {p}
            </p>
          ))}
          {section.bullets && section.bullets.length > 0 && (
            <ul className="mt-3 space-y-2.5">
              {section.bullets.map((b, j) => (
                <li
                  key={j}
                  className="flex gap-2.5 text-[1.0625rem] leading-relaxed text-gray-2 dark:text-gray-8"
                >
                  <CheckCircle2
                    size={18}
                    className="mt-1 shrink-0 text-apple-blue"
                  />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  )
}
