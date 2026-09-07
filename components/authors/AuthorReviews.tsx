'use client'

import { ChevronLeft, ChevronRight, CircleCheck, Star, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import type { AuthorReview } from '@/lib/sanity.queries'

const stars = [1, 2, 3, 4, 5]

export default function AuthorReviews({
  authorSlug,
  locale,
}: {
  authorSlug: string
  locale: string
}) {
  const fr = locale === 'fr'
  const [reviews, setReviews] = useState<AuthorReview[]>([])
  const [average, setAverage] = useState(0)
  const [distribution, setDistribution] = useState<Record<string, number>>({})
  const [selected, setSelected] = useState(0)
  const [rating, setRating] = useState(0)
  const [name, setName] = useState('')
  const [reviewText, setReviewText] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>(
    'idle',
  )
  const [errorMessage, setErrorMessage] = useState('')
  const [open, setOpen] = useState(false)

  const load = useCallback(
    () =>
      fetch(`/api/author-reviews?author=${encodeURIComponent(authorSlug)}`)
        .then((response) => response.json())
        .then((data) => {
          setReviews(data.reviews || [])
          setAverage(Number(data.average || 0))
          setDistribution(data.distribution || {})
          setSelected((current) =>
            Math.min(current, Math.max((data.reviews || []).length - 1, 0)),
          )
        })
        .catch(() => {}),
    [authorSlug],
  )

  useEffect(() => {
    load()
  }, [load])

  const current = reviews[selected]
  const score = average ? average.toFixed(1) : '—'
  const total = reviews.length
  const summary = fr ? 'Avis sur cet auteur' : 'Reader rating for this author'
  const reviewLabel = fr ? 'avis' : 'reviews'
  const maxDistribution = Math.max(...Object.values(distribution), 1)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!rating || !name.trim()) return
    setStatus('saving')
    setErrorMessage('')
    try {
      const response = await fetch('/api/author-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorSlug,
          name: name.trim(),
          rating,
          content: reviewText.trim(),
          website: '',
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.error || 'failed')
      }
      if (Array.isArray(data.reviews)) {
        setReviews(data.reviews)
        setAverage(Number(data.average || 0))
        setDistribution(data.distribution || {})
        setSelected(0)
      } else {
        await load()
      }
      setStatus('success')
      setName('')
      setReviewText('')
      setRating(0)
      setOpen(false)
    } catch (error) {
      setStatus('error')
      setErrorMessage(
        error instanceof Error
          ? error.message
          : fr
            ? 'Impossible d’enregistrer votre avis.'
            : 'Could not save your review.',
      )
    }
  }

  return (
    <section
      className="mt-8 overflow-hidden rounded-md border border-gray-7 bg-white shadow-sm dark:border-gray-2 dark:bg-gray-1"
      aria-label={summary}
    >
      <div className="border-b border-gray-7 px-4 py-4 sm:px-6 dark:border-gray-2">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-3 dark:text-gray-5">
              {summary}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span className="text-4xl font-bold tracking-tight text-ink dark:text-white">
                {score}
              </span>
              <div>
                <div className="flex gap-0.5 text-orange">
                  {stars.map((star) => (
                    <Star
                      key={star}
                      size={16}
                      fill={
                        star <= Math.round(average) ? 'currentColor' : 'none'
                      }
                    />
                  ))}
                </div>
                <p className="mt-1 text-xs text-gray-3 dark:text-gray-4">
                  {total} {reviewLabel}
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-apple-blue px-5 text-sm font-semibold text-white transition-colors hover:bg-apple-blue-hover"
          >
            {fr ? 'Évaluer cet auteur' : 'Rate this author'}
          </button>
        </div>
      </div>

      <div className="grid min-w-0 gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="space-y-2">
          {stars
            .slice()
            .reverse()
            .map((star) => {
              const count = distribution[String(star)] || 0
              return (
                <div
                  key={star}
                  className="grid grid-cols-[34px_minmax(0,1fr)_26px] items-center gap-2 text-xs text-gray-3 dark:text-gray-4"
                >
                  <span>{star} ★</span>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-6 dark:bg-gray-2">
                    <div
                      className="h-full rounded-full bg-orange"
                      style={{ width: `${(count / maxDistribution) * 100}%` }}
                    />
                  </div>
                  <span className="text-right">{count}</span>
                </div>
              )
            })}
        </div>

        <div className="min-w-0">
          {current ? (
            <div className="flex min-w-0 items-start gap-1 sm:gap-3">
              <button
                type="button"
                onClick={() =>
                  setSelected((value) => (value - 1 + total) % total)
                }
                className="mt-8 shrink-0 rounded-full p-1 text-gray-3 hover:bg-gray-7 sm:p-1.5 dark:hover:bg-gray-2"
                aria-label={fr ? 'Avis précédent' : 'Previous review'}
              >
                <ChevronLeft size={18} />
              </button>
              <article className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold text-white shadow-sm ring-2 ring-white dark:ring-gray-1 sm:h-14 sm:w-14 sm:text-lg"
                    style={{
                      background:
                        'linear-gradient(135deg,#ff375f,#bf5af2,#2997ff)',
                    }}
                    aria-hidden="true"
                  >
                    {(current.name[0] || 'R').toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="truncate text-sm font-semibold text-ink dark:text-white">
                        {current.name}
                      </span>
                      <CircleCheck
                        size={15}
                        className="shrink-0 text-success"
                        aria-label={fr ? 'Avis vérifié' : 'Verified reader'}
                      />
                    </div>
                    <div className="mt-1 flex gap-0.5 text-orange">
                      {stars.map((star) => (
                        <Star
                          key={star}
                          size={15}
                          fill={
                            star <= current.rating ? 'currentColor' : 'none'
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <h3 className="mt-2 break-words text-base font-semibold text-ink dark:text-white">
                  {current.title || (fr ? 'Avis lecteur' : 'Reader review')}
                </h3>
                <p className="mt-1 line-clamp-4 break-words text-sm leading-relaxed text-gray-2 dark:text-gray-4">
                  {current.content}
                </p>
                {total > 1 && (
                  <div className="mt-3 flex gap-1.5">
                    {reviews.map((review, reviewIndex) => (
                      <button
                        key={review._id}
                        type="button"
                        onClick={() => setSelected(reviewIndex)}
                        className={`h-1.5 rounded-full transition-all ${reviewIndex === selected ? 'w-6 bg-apple-blue' : 'w-1.5 bg-gray-5 dark:bg-gray-3'}`}
                        aria-label={`${fr ? 'Afficher l’avis' : 'Show review'} ${reviewIndex + 1}`}
                      />
                    ))}
                  </div>
                )}
              </article>
              <button
                type="button"
                onClick={() => setSelected((value) => (value + 1) % total)}
                className="mt-8 shrink-0 rounded-full p-1 text-gray-3 hover:bg-gray-7 sm:p-1.5 dark:hover:bg-gray-2"
                aria-label={fr ? 'Avis suivant' : 'Next review'}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-3 dark:text-gray-4">
              {fr
                ? 'Les avis approuvés apparaîtront ici.'
                : 'Approved reader reviews will appear here.'}
            </p>
          )}
        </div>
      </div>

      {open && (
        <form
          onSubmit={submit}
          className="border-t border-gray-7 bg-gray-8 px-4 py-5 sm:px-6 dark:border-gray-2 dark:bg-black/20"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-ink dark:text-white">
              {fr ? 'Votre évaluation' : 'Your rating'}
            </h3>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-1 text-gray-3 hover:bg-gray-6 dark:hover:bg-gray-2"
              aria-label={fr ? 'Fermer' : 'Close'}
            >
              <X size={18} />
            </button>
          </div>
          <div
            className="flex flex-wrap gap-1"
            role="radiogroup"
            aria-label={fr ? 'Note de 1 à 5' : 'Rating from 1 to 5'}
          >
            {stars.map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="rounded p-1 text-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue"
                role="radio"
                aria-checked={rating === star}
                aria-label={`${star}/5`}
              >
                <Star
                  size={25}
                  fill={star <= rating ? 'currentColor' : 'none'}
                />
              </button>
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={80}
              placeholder={fr ? 'Votre nom' : 'Your name'}
              className="h-11 min-w-0 rounded-md border border-gray-5 bg-white px-4 text-sm outline-none focus:border-apple-blue focus:ring-2 focus:ring-apple-blue/20 dark:border-gray-2 dark:bg-gray-1 dark:text-white"
            />
            <input
              tabIndex={-1}
              autoComplete="off"
              name="website"
              className="hidden"
              aria-hidden="true"
            />
          </div>
          <textarea
            value={reviewText}
            onChange={(event) => setReviewText(event.target.value)}
            maxLength={1200}
            rows={3}
            placeholder={
              fr
                ? 'Partagez votre expérience (facultatif)'
                : 'Share your experience (optional)'
            }
            className="mt-3 w-full rounded-md border border-gray-5 bg-white px-4 py-3 text-sm outline-none focus:border-apple-blue focus:ring-2 focus:ring-apple-blue/20 dark:border-gray-2 dark:bg-gray-1 dark:text-white"
          />
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-3">
              {fr
                ? 'Votre avis sera publié après modération.'
                : 'Your review will appear after moderation.'}
            </p>
            <button
              type="submit"
              disabled={status === 'saving' || !rating || !name.trim()}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-apple-blue px-5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {status === 'saving'
                ? fr
                  ? 'Envoi…'
                  : 'Submitting…'
                : fr
                  ? 'Envoyer l’avis'
                  : 'Submit review'}
            </button>
          </div>
          {status === 'success' && (
            <p className="mt-3 text-sm text-success">
              {fr
                ? 'Merci. Votre avis est en attente de modération.'
                : 'Thank you. Your review is awaiting moderation.'}
            </p>
          )}
          {status === 'error' && (
            <p className="mt-3 text-sm text-red-500">
              {errorMessage ||
                (fr
                  ? 'Impossible d’enregistrer votre avis.'
                  : 'Could not save your review.')}
            </p>
          )}
        </form>
      )}
    </section>
  )
}
