import { ArrowRight, Store } from 'lucide-react'

import { cn } from '@/lib/utils'

interface AffiliateCtaBlockProps {
  block: {
    label?: string
    url?: string
    note?: string
    store?: string
  }
  locale?: string
}

const APPLE_MAGIC_STORE = 'https://applemagicstore.tech'

const DEFAULT_LABEL: Record<string, string> = {
  en: 'Order on Apple Magic',
  fr: 'Commander sur Apple Magic',
}
const CHECK_LABEL: Record<string, string> = {
  en: 'Check price',
  fr: 'Voir le prix',
}

export default function AffiliateCtaBlock({
  block,
  locale = 'en',
}: AffiliateCtaBlockProps) {
  const lang = locale === 'fr' ? 'fr' : 'en'
  const href = block.url || block.store || APPLE_MAGIC_STORE
  if (!href) return null

  const isStore = Boolean(block.url === APPLE_MAGIC_STORE || block.store)

  return (
    <div
      className={cn(
        'my-8 flex flex-col items-center gap-2 rounded-xl border border-magic-purple/30 bg-gradient-to-br from-magic-blue/5 to-magic-pink/5 p-6 text-center sm:flex-row sm:justify-between sm:text-left',
      )}
    >
      <div className="flex-1">
        <p className="text-[0.9375rem] font-medium text-ink dark:text-white">
          {block.label || DEFAULT_LABEL[lang]}
        </p>
        {block.note && (
          <p className="mt-1 text-[0.8125rem] text-gray-3 dark:text-gray-4">
            {block.note}
          </p>
        )}
      </div>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer sponsored nofollow"
        className="inline-flex shrink-0 items-center gap-2 rounded-full bg-apple-blue px-6 py-3 text-[0.875rem] font-semibold text-white transition-all hover:bg-apple-blue-hover"
      >
        {isStore ? <Store size={16} /> : null}
        {block.label || (isStore ? DEFAULT_LABEL[lang] : CHECK_LABEL[lang])}
        <ArrowRight size={16} />
      </a>
    </div>
  )
}
