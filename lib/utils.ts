import { type ClassValue, clsx } from 'clsx'

// Minimal local `cn` without extra deps — clsx is already available
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}

export function cx(...classNames: (string | false | null | undefined)[]) {
  return classNames.filter(Boolean).join(' ')
}

/**
 * Estimate the reading time of a piece of plain text in minutes.
 * Apple blogs target ~200 words per minute for a comfortable read.
 */
export function getReadingTime(text: string, locale = 'en'): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  const wpm = 200
  const minutes = Math.max(1, Math.round(words / wpm))
  return minutes
}

export function formatDate(
  date: string | Date | undefined,
  locale: string = 'en',
): string {
  if (!date) return ''
  const d = new Date(date)
  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

export function formatRelativeTime(
  date: string | Date,
  locale: string = 'en',
): string {
  const d = new Date(date)
  const diff = Date.now() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  const rtf = new Intl.RelativeTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
    numeric: 'auto',
  })

  if (minutes < 1) return locale === 'fr' ? 'à l’instant' : 'just now'
  if (minutes < 60) return rtf.format(-minutes, 'minute')
  if (hours < 24) return rtf.format(-hours, 'hour')
  if (days < 7) return rtf.format(-days, 'day')
  return formatDate(d, locale)
}

export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFKD')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function isExternalUrl(url: string): boolean {
  return /^https?:\/\//.test(url) || url.startsWith('//')
}

export function absoluteUrl(path: string, base?: string): string {
  const baseUrl = base || process.env.NEXT_PUBLIC_URL || ''
  if (path.startsWith('http')) return path
  return `${baseUrl.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length).trimEnd() + '…'
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>?/gm, '')
}

export function extractTextFromPortableText(blocks: any[]): string {
  if (!Array.isArray(blocks)) return ''
  return blocks
    .map((block) => {
      if (block._type === 'block' && Array.isArray(block.children)) {
        return block.children.map((child) => child.text || '').join('')
      }
      return ''
    })
    .join(' ')
    .trim()
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text)
  }
  return new Promise((resolve) => {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    resolve()
  })
}
