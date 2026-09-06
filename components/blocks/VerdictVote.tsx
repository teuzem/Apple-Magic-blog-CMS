'use client'

import { useEffect, useState } from 'react'

export default function VerdictVote({
  postId,
  initialAverage = 0,
  initialCount = 0,
}: {
  postId: string
  initialAverage?: number
  initialCount?: number
}) {
  const [selected, setSelected] = useState<number | null>(null)
  const [community, setCommunity] = useState<{
    average: number
    count: number
  } | null>(
    initialCount > 0 ? { average: initialAverage, count: initialCount } : null,
  )

  useEffect(() => {
    const stored = window.localStorage.getItem(`verdict-vote:${postId}`)
    if (stored) setSelected(Number(stored))
  }, [postId])

  async function vote(value: number) {
    if (selected !== null) return
    setSelected(value)
    window.localStorage.setItem(`verdict-vote:${postId}`, String(value))
    const response = await fetch('/api/verdict-vote', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ postId, value }),
    })
    if (response.ok) setCommunity(await response.json())
  }

  return (
    <div className="mt-5 rounded-xl border border-apple-blue/20 bg-apple-blue/5 p-4 dark:bg-apple-blue/10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-ink dark:text-white">
          Community rating
        </p>
        {community && (
          <p className="text-sm font-bold text-apple-blue">
            {community.average.toFixed(1)}
            <span className="font-medium text-gray-3">/10</span>
          </p>
        )}
      </div>
      <p className="mt-1 text-xs text-gray-3 dark:text-gray-4">
        How would you rate this verdict?
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => vote(value)}
            disabled={selected !== null}
            className={`h-8 w-8 rounded-md border text-sm font-semibold ${
              selected === value
                ? 'border-apple-blue bg-apple-blue text-white'
                : 'border-gray-6 text-gray-2 hover:border-apple-blue dark:border-gray-2 dark:text-gray-8'
            }`}
            aria-label={`Rate ${value} out of 10`}
          >
            {value}
          </button>
        ))}
      </div>
      {community && (
        <p className="mt-2 text-xs text-gray-3 dark:text-gray-4">
          Community score {community.average.toFixed(1)}/10 from{' '}
          {community.count} vote{community.count === 1 ? '' : 's'}
        </p>
      )}
    </div>
  )
}
