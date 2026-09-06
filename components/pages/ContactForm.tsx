'use client'

import { CheckCircle2, Loader2, Send } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { useState } from 'react'

const topics = ['general', 'editorial', 'partnerships', 'support', 'press']

export default function ContactForm() {
  const t = useTranslations('contactForm')
  const locale = useLocale()
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const form = e.currentTarget
    const payload = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      topic: (form.elements.namedItem('topic') as HTMLSelectElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement)
        .value,
      locale,
    }
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setSent(true)
        form.reset()
        return
      }
      setError(t('serverError'))
    } catch {
      setError(t('networkError'))
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-xl border border-gray-6 bg-gray-7 p-6 dark:border-gray-2 dark:bg-gray-1">
        <CheckCircle2 size={28} className="text-success dark:text-green-400" />
        <p className="text-[1.0625rem] font-medium text-ink dark:text-white">
          {t('successTitle')}
        </p>
        <p className="text-[0.9375rem] leading-relaxed text-gray-3 dark:text-gray-4">
          {t('successBody')}
        </p>
      </div>
    )
  }

  const inputClass =
    'h-12 w-full rounded-xl border border-gray-5 bg-white px-4 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-gray-3 focus:border-apple-blue focus:ring-2 focus:ring-apple-blue/30 dark:border-gray-2 dark:bg-gray-1 dark:text-white'
  const labelClass =
    'mb-1.5 block text-[0.8125rem] font-medium text-gray-3 dark:text-gray-4'

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-5 rounded-xl border border-gray-6 bg-gray-7 p-6 sm:grid-cols-2 dark:border-gray-2 dark:bg-gray-1"
    >
      <div>
        <label htmlFor="cf-name" className={labelClass}>
          {t('name')}
        </label>
        <input
          id="cf-name"
          name="name"
          required
          placeholder={t('namePlaceholder')}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="cf-email" className={labelClass}>
          {t('email')}
        </label>
        <input
          id="cf-email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className={inputClass}
        />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="cf-topic" className={labelClass}>
          {t('topic')}
        </label>
        <select
          id="cf-topic"
          name="topic"
          defaultValue="general"
          className={inputClass}
        >
          {topics.map((topic) => (
            <option key={topic} value={topic}>
              {t(`topic_${topic}`)}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="cf-message" className={labelClass}>
          {t('message')}
        </label>
        <textarea
          id="cf-message"
          name="message"
          required
          rows={5}
          placeholder={t('messagePlaceholder')}
          className="w-full rounded-xl border border-gray-5 bg-white px-4 py-3 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-gray-3 focus:border-apple-blue focus:ring-2 focus:ring-apple-blue/30 dark:border-gray-2 dark:bg-gray-1 dark:text-white"
        />
      </div>
      <div className="flex items-center gap-3 sm:col-span-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-apple-blue px-7 text-sm font-medium text-white transition-all hover:bg-apple-blue-hover active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
          {t('submit')}
        </button>
        {error && (
          <p className="text-sm text-danger dark:text-rose-400">{error}</p>
        )}
      </div>
    </form>
  )
}
