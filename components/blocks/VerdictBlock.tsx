import { BadgeCheck, ThumbsDown, ThumbsUp } from 'lucide-react'

import { cn } from '@/lib/utils'

import VerdictVote from './VerdictVote'

interface VerdictBlockProps {
  block: {
    rating?: number
    title?: string
    body?: string
    recommended?: boolean
    communityAverage?: number
    communityCount?: number
  }
  locale?: string
  postId?: string
}

const LABELS: Record<
  string,
  { verdict: string; recommended: string; notRecommended: string }
> = {
  en: {
    verdict: 'Our verdict',
    recommended: 'Recommended',
    notRecommended: 'Not recommended',
  },
  fr: {
    verdict: 'Notre verdict',
    recommended: 'Recommandé',
    notRecommended: 'Non recommandé',
  },
}

/** Render a 0–10 scale filled in half-star steps. */
function StarRow({ value, size = 22 }: { value: number; size?: number }) {
  const stars = []
  for (let i = 0; i < 10; i++) {
    const fill = Math.max(0, Math.min(1, value - i))
    stars.push(
      <span
        key={i}
        className="relative inline-flex"
        style={{ width: size, height: size }}
      >
        <span
          className="absolute inset-0 text-gray-7 dark:text-gray-2"
          style={{ fontSize: size }}
        >
          ★
        </span>
        <span
          className="absolute inset-0 overflow-hidden text-amber-400"
          style={{ fontSize: size, width: `${fill * 100}%` }}
        >
          ★
        </span>
      </span>,
    )
  }
  return <span className="inline-flex items-center gap-0.5">{stars}</span>
}

export default function VerdictBlock({
  block,
  locale = 'en',
  postId,
}: VerdictBlockProps) {
  const lang = locale === 'fr' ? 'fr' : 'en'
  const t = LABELS[lang]
  const rating = Math.max(0, Math.min(10, block.rating ?? 0))
  const score = rating.toFixed(1)

  return (
    <div className="my-8 overflow-hidden rounded-xl border border-magic-purple/30 bg-gradient-to-br from-magic-blue/5 via-magic-purple/5 to-magic-pink/5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 px-5 py-4 dark:border-white/10">
        <h4 className="flex items-center gap-2 text-[0.9375rem] font-semibold text-ink dark:text-white">
          <BadgeCheck size={18} className="text-magic-purple" />
          {t.verdict}
        </h4>

        {/* Big bold 0–10 score */}
        <div className="flex items-center gap-3">
          <StarRow value={rating} size={20} />
          <div className="text-right">
            <div className="flex items-baseline gap-1">
              <span className="bg-magic-gradient bg-clip-text text-4xl font-extrabold leading-none tracking-tight text-transparent">
                {score}
              </span>
              <span className="text-sm font-medium text-gray-3 dark:text-gray-4">
                /10
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended / not-recommended pill */}
      {block.recommended !== undefined && (
        <div className="flex items-center justify-between gap-3 border-b border-black/5 bg-black/[0.02] px-5 py-3 dark:border-white/10 dark:bg-white/[0.02]">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold',
              block.recommended
                ? 'bg-success/10 text-success'
                : 'bg-red-500/10 text-red-500',
            )}
          >
            {block.recommended ? (
              <ThumbsUp size={15} />
            ) : (
              <ThumbsDown size={15} />
            )}
            {block.recommended ? t.recommended : t.notRecommended}
          </span>
        </div>
      )}

      <div className="p-5">
        {block.title && (
          <p className="mb-2 text-lg font-semibold text-ink dark:text-white">
            {block.title}
          </p>
        )}
        {block.body && (
          <p className="text-[0.9375rem] leading-relaxed text-gray-2 dark:text-gray-8">
            {block.body}
          </p>
        )}
        {postId && (
          <VerdictVote
            postId={postId}
            initialAverage={block.communityAverage}
            initialCount={block.communityCount}
          />
        )}
      </div>
    </div>
  )
}
