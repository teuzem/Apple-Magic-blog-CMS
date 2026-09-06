'use client'

import { CheckCircle2, Loader2, Send } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { useState } from 'react'

import { cn } from '@/lib/utils'

interface NewsletterFormProps {
  className?: string
  compact?: boolean
}

/**
 * Newsletter subscription form.
 * Posts to /api/newsletter. When offline, queues the submission for
 * background sync via the service worker.
 */
export function NewsletterForm({
  className,
  compact = false,
}: NewsletterFormProps) {
  const t = useTranslations('home')
  const locale = useLocale()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')

    const payload = { email: email.trim(), locale }

    // Try to submit; if offline, queue for background sync
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setStatus('success')
        setEmail('')
        return
      }
      throw new Error('Network error')
    } catch (error) {
      // Queue for background sync when offline
      queueOffline(payload)
      setStatus('success')
      setEmail('')
    }
  }

  async function queueOffline(payload: Record<string, unknown>) {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready
        const cache = await caches.open('offline-queue')
        const request = new Request(
          `/api/newsletter-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: '/api/newsletter', body: payload }),
          },
        )
        await cache.put(request, new Response(JSON.stringify(request)))
        // @ts-ignore
        await registration.sync.register('queue-submissions')
      } catch (error) {
        // Fallback: just note success client-side
        console.warn('Queue failed, offline submission lost', error)
      }
    }
  }

  if (status === 'success') {
    return (
      <div
        className={cn(
          'flex items-center gap-2 text-[0.875rem] text-success dark:text-green-400',
          className,
        )}
      >
        <CheckCircle2 size={18} />
        <span>{t('subscribed')}</span>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'flex w-full max-w-xl flex-col gap-2 sm:flex-row',
        className,
      )}
    >
      <label htmlFor="newsletter-email" className="sr-only">
        Email
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t('emailPlaceholder')}
        className="h-12 min-w-0 flex-1 rounded-full border border-gray-5 bg-white px-5 text-sm text-ink outline-none transition-colors placeholder:text-gray-3 focus:border-apple-blue focus:ring-2 focus:ring-apple-blue/30 dark:border-gray-2 dark:bg-gray-1 dark:text-white"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-apple-blue px-5 text-sm font-medium text-white transition-all hover:bg-apple-blue-hover active:scale-[0.98] sm:w-auto sm:px-6 disabled:opacity-60"
      >
        {status === 'loading' ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Send size={18} />
        )}
        {!compact && t('subscribe')}
      </button>
    </form>
  )
}
