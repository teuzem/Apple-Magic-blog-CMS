import { AppleWordmark } from '@/components/brand/AppleWordmark'
import { StarSparkle } from '@/components/brand/StarSparkle'

interface ContentPageProps {
  eyebrow?: string
  title: string
  intro?: string
  lastUpdated?: string
  children: React.ReactNode
}

/**
 * Reusable shell for rich, bilingual content pages (about, legal, editorial).
 */
export default function ContentPage({
  eyebrow,
  title,
  intro,
  lastUpdated,
  children,
}: ContentPageProps) {
  return (
    <div className="min-w-0 pt-10 pb-16 sm:pt-16 sm:pb-24">
      <div className="mx-auto w-full max-w-[820px] min-w-0 px-4 sm:px-6">
        <div className="mb-8 flex items-center gap-3">
          <AppleWordmark className="text-ink dark:text-white" />
          <StarSparkle size={22} className="text-magic-purple" />
        </div>

        {eyebrow && (
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-magic-purple">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 break-words text-center text-3xl font-bold tracking-tight text-ink sm:text-left sm:text-5xl dark:text-white">
          {title}
        </h1>

        {intro && (
          <p className="mt-4 break-words text-center text-[1.0625rem] leading-relaxed text-gray-3 sm:text-left sm:text-[1.125rem] dark:text-gray-4">
            {intro}
          </p>
        )}

        {lastUpdated && (
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-gray-7 px-3 py-1 text-xs font-medium text-gray-3 dark:bg-gray-2 dark:text-gray-4">
            <StarSparkle size={11} className="text-magic-purple" />
            {lastUpdated}
          </p>
        )}

        <div className="mt-10">{children}</div>
      </div>
    </div>
  )
}
