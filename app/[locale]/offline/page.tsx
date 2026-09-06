import { BookOpen, Wifi, WifiOff } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { AppleWordmark } from '@/components/brand/AppleWordmark'
import { StarSparkle } from '@/components/brand/StarSparkle'
import { Link } from '@/i18n/navigation'

const locales = ['en', 'fr']

/**
 * Offline fallback page. Served by the service worker when the network
 * is unavailable so users still get a beautiful, branded experience.
 */
export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function OfflinePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const safeLocale = locales.includes(locale) ? locale : 'en'
  setRequestLocale(safeLocale)
  const t = await getTranslations({ locale: safeLocale, namespace: 'pwa' })
  const tc = await getTranslations({ locale: safeLocale, namespace: 'common' })

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-20 text-center">
      <WifiOff size={40} className="mb-6 text-gray-3" />
      <AppleWordmark className="mb-4 text-ink dark:text-white" />
      <StarSparkle size={20} className="mb-3 text-magic-purple" />

      <h1 className="max-w-lg text-3xl font-bold tracking-tight text-ink sm:text-4xl dark:text-white">
        {t('offlineTitle')}
      </h1>
      <p className="mx-auto mt-4 max-w-md text-[1.0625rem] leading-relaxed text-gray-3 dark:text-gray-4">
        {t('offlineBody')}
      </p>

      <div className="mt-8 flex flex-col items-center gap-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-gray-7 px-5 py-2.5 text-sm font-medium text-ink dark:bg-gray-1 dark:text-white">
          <Wifi size={16} className="text-gray-3" />
          {t('goOnline')}
        </div>
        <p className="inline-flex items-center gap-2 text-sm text-gray-4">
          <BookOpen size={15} />
          {t('cachedArticles')}
        </p>
      </div>

      <Link
        href="/"
        className="mt-10 inline-flex items-center gap-2 rounded-full bg-apple-blue px-7 py-3 text-sm font-medium text-white transition-all hover:bg-apple-blue-hover"
      >
        {t('goOnline')} â†’ {tc('backHome')}
      </Link>
    </div>
  )
}
