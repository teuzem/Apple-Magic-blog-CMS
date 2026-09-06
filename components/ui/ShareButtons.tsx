'use client'

import { Check, Copy } from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
  FacebookShareButton,
  LinkedinShareButton,
  TwitterShareButton,
  WhatsappShareButton,
} from 'next-share'
import { useState } from 'react'

import { SocialBrandIcon } from '@/components/brand/SocialBrandIcon'

interface ShareButtonsProps {
  url: string
  title: string
}

const iconBtn =
  'inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-7 text-gray-3 transition-all hover:-translate-y-0.5 hover:bg-apple-blue hover:text-white dark:bg-gray-2 dark:text-gray-8'

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const t = useTranslations('post')
  const [copied, setCopied] = useState(false)
  const shareUrl = typeof window !== 'undefined' ? window.location.href : url

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch (error) {
      // ignore
    }
  }

  return (
    <div className="mt-8 flex items-center gap-3 border-t border-gray-7 pt-6 dark:border-gray-2">
      <span className="text-[0.9375rem] font-medium text-gray-3 dark:text-gray-4">
        {t('shareOn')}
      </span>
      <div className="flex items-center gap-2">
        <FacebookShareButton url={shareUrl} quote={title}>
          <span className={iconBtn}>
            <SocialBrandIcon platform="facebook" size={18} />
          </span>
        </FacebookShareButton>
        <TwitterShareButton url={shareUrl} title={title}>
          <span className={iconBtn}>
            <SocialBrandIcon platform="x" size={18} />
          </span>
        </TwitterShareButton>
        <LinkedinShareButton url={shareUrl} title={title}>
          <span className={iconBtn}>
            <SocialBrandIcon platform="linkedin" size={18} />
          </span>
        </LinkedinShareButton>
        <WhatsappShareButton url={shareUrl} title={title} separator=": ">
          <span className={iconBtn}>
            <SocialBrandIcon platform="whatsapp" size={18} />
          </span>
        </WhatsappShareButton>
        <button
          onClick={copy}
          className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-7 transition-colors hover:bg-gray-6 dark:bg-gray-2"
          aria-label={t('copyLink')}
        >
          {copied ? (
            <Check size={15} className="text-success" />
          ) : (
            <Copy size={15} className="text-gray-3 dark:text-gray-4" />
          )}
        </button>
      </div>
    </div>
  )
}
