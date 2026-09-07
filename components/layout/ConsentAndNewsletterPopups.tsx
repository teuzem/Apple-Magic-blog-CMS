'use client'

import { BellRing, Check, Cookie, X } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { NewsletterForm } from '@/components/ui/NewsletterForm'
import { Link } from '@/i18n/navigation'

const CONSENT_KEY = 'apple-magic-cookie-consent'
const NEWSLETTER_KEY = 'apple-magic-newsletter-dismissed'

export function ConsentAndNewsletterPopups() {
  const locale = useLocale()
  const t = useTranslations('consent')
  const n = useTranslations('newsletterPopup')
  const [consent, setConsent] = useState<'accepted' | 'essential' | null>(null)
  const [newsletterOpen, setNewsletterOpen] = useState(false)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CONSENT_KEY)
      if (saved === 'accepted' || saved === 'essential') setConsent(saved)
    } catch {
      // Privacy UI remains usable when storage is blocked.
    }
  }, [])

  useEffect(() => {
    if (!consent) return
    try {
      if (window.localStorage.getItem(NEWSLETTER_KEY)) return
    } catch {
      // Continue without persistence when storage is blocked.
    }
    const timer = window.setTimeout(() => setNewsletterOpen(true), 8000)
    return () => window.clearTimeout(timer)
  }, [consent])

  function saveConsent(value: 'accepted' | 'essential') {
    setConsent(value)
    try {
      window.localStorage.setItem(CONSENT_KEY, value)
    } catch {}
  }

  function dismissNewsletter() {
    setNewsletterOpen(false)
    try {
      window.localStorage.setItem(NEWSLETTER_KEY, '1')
    } catch {}
  }

  return (
    <>
      {!consent && (
        <aside
          className="fixed inset-x-3 bottom-3 z-[90] rounded-2xl border border-gray-6 bg-white p-4 shadow-2xl dark:border-gray-2 dark:bg-gray-1 sm:inset-x-auto sm:left-6 sm:max-w-md sm:p-5"
          role="dialog"
          aria-label={t('title')}
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-apple-blue/10 text-apple-blue">
              <Cookie size={20} />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-ink dark:text-white">
                {t('title')}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-gray-3 dark:text-gray-5">
                {t('body')}
              </p>
              <Link
                href="/pages/privacy#cookies"
                locale={locale}
                className="mt-1 inline-block text-xs font-medium text-apple-blue hover:underline"
              >
                {t('learnMore')}
              </Link>
            </div>
          </div>
          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => saveConsent('essential')}
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-gray-5 px-4 text-xs font-semibold text-ink transition-colors hover:border-ink dark:border-gray-2 dark:text-white dark:hover:border-white"
            >
              {t('essential')}
            </button>
            <button
              type="button"
              onClick={() => saveConsent('accepted')}
              className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full bg-apple-blue px-4 text-xs font-semibold text-white transition-colors hover:bg-apple-blue-hover"
            >
              <Check size={14} /> {t('accept')}
            </button>
          </div>
        </aside>
      )}

      {newsletterOpen && (
        <aside
          className="fixed inset-x-3 bottom-3 z-[89] rounded-2xl border border-gray-6 bg-white p-5 shadow-2xl dark:border-gray-2 dark:bg-gray-1 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[min(92vw,400px)]"
          role="dialog"
          aria-label={n('title')}
        >
          <button
            type="button"
            onClick={dismissNewsletter}
            className="absolute right-3 top-3 rounded-full p-1.5 text-gray-3 transition-colors hover:bg-gray-7 hover:text-ink dark:hover:bg-gray-2 dark:hover:text-white"
            aria-label={t('close')}
          >
            <X size={17} />
          </button>
          <div className="flex items-start gap-3 pr-6">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-magic-purple/10 text-magic-purple">
              <BellRing size={19} />
            </span>
            <div>
              <h2 className="text-base font-semibold text-ink dark:text-white">
                {n('title')}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-gray-3 dark:text-gray-5">
                {n('body')}
              </p>
            </div>
          </div>
          <NewsletterForm className="mt-4 max-w-none" />
          <p className="mt-3 text-[0.6875rem] leading-relaxed text-gray-4">
            {n('privacy')}
          </p>
        </aside>
      )}
    </>
  )
}
