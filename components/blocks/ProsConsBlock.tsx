import { Check, X } from 'lucide-react'

interface ProsConsBlockProps {
  block: {
    pros?: Array<string | { value?: string }>
    cons?: Array<string | { value?: string }>
    score?: number
  }
  locale?: string
}

const LABELS: Record<string, { pros: string; cons: string }> = {
  en: { pros: 'Pros', cons: 'Cons' },
  fr: { pros: 'Avantages', cons: 'Inconvénients' },
}

function plain(items?: Array<string | { value?: string }>): string[] {
  return (items || [])
    .map((item) => {
      if (typeof item === 'string') return item
      if (!item || typeof item !== 'object') return ''
      const value = (item as any).value
      if (typeof value === 'string') return value
      if (
        value &&
        typeof value === 'object' &&
        typeof value.current === 'string'
      ) {
        return value.current
      }
      if (typeof (item as any).text === 'string') return (item as any).text
      return ''
    })
    .map((item) => item.trim())
    .filter(Boolean)
}

export default function ProsConsBlock({
  block,
  locale = 'en',
}: ProsConsBlockProps) {
  const lang = locale === 'fr' ? 'fr' : 'en'
  const t = LABELS[lang]
  const pros = plain(block.pros)
  const cons = plain(block.cons)
  const score = Math.max(0, Math.min(10, block.score ?? 0))

  return (
    <div className="my-8">
      {/* Big bold 0–10 score strip */}
      {block.score !== undefined && block.score > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-magic-purple/25 bg-magic-purple/5 px-5 py-4 dark:bg-magic-purple/10">
          <div className="flex items-center gap-3">
            <div className="flex items-baseline gap-1">
              <span className="bg-magic-gradient bg-clip-text text-4xl font-extrabold leading-none tracking-tight text-transparent">
                {score.toFixed(1)}
              </span>
              <span className="text-sm font-medium text-gray-3 dark:text-gray-4">
                /10
              </span>
            </div>
            <span className="hidden h-8 w-px bg-black/10 sm:block dark:bg-white/10" />
            <p className="text-sm font-medium text-ink dark:text-white">
              {lang === 'fr' ? 'Note finale' : 'Final score'}
            </p>
          </div>
          <div className="flex items-center gap-0.5 text-amber-400">
            {Array.from({ length: 10 }).map((_, i) => {
              const fill = Math.max(0, Math.min(1, score - i))
              return (
                <span
                  key={i}
                  className="text-lg leading-none"
                  style={{
                    color: fill >= 0.5 ? 'rgb(251 191 36)' : 'rgb(209 213 219)',
                  }}
                >
                  ★
                </span>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-success/30 bg-success/5 p-5">
          <h4 className="mb-3 flex items-center gap-2 text-[0.9375rem] font-semibold text-success">
            <Check size={18} /> {t.pros}
          </h4>
          <ul className="space-y-2.5">
            {pros.map((item, i) => (
              <li
                key={i}
                className="flex gap-2 text-[0.9375rem] leading-relaxed text-gray-2 dark:text-gray-8"
              >
                <Check size={16} className="mt-0.5 shrink-0 text-success" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-red-500/20 bg-red-50 p-5 dark:bg-red-500/5">
          <h4 className="mb-3 flex items-center gap-2 text-[0.9375rem] font-semibold text-red-500">
            <X size={18} /> {t.cons}
          </h4>
          <ul className="space-y-2.5">
            {cons.map((item, i) => (
              <li
                key={i}
                className="flex gap-2 text-[0.9375rem] leading-relaxed text-gray-2 dark:text-gray-8"
              >
                <X size={16} className="mt-0.5 shrink-0 text-red-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
