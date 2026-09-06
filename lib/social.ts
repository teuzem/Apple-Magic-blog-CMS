export interface SocialLink {
  platform: string
  url: string
  label: string
}

const LEGACY_MAP: Record<string, string> = {
  twitter: 'x',
  x: 'x',
  instagram: 'instagram',
  youtube: 'youtube',
  linkedin: 'linkedin',
  facebook: 'facebook',
  tiktok: 'tiktok',
  reddit: 'reddit',
  threads: 'threads',
  bluesky: 'bluesky',
  mastodon: 'mastodon',
  twitch: 'twitch',
  pinterest: 'pinterest',
  github: 'github',
  gitlab: 'gitlab',
  huggingface: 'huggingface',
  dribbble: 'dribbble',
  behance: 'behance',
  medium: 'medium',
  substack: 'substack',
  website: 'website',
  blog: 'website',
  portfolio: 'website',
  personal: 'website',
  rss: 'rss',
}

const PLATFORM_LABELS: Record<string, string> = {
  x: 'X (Twitter)',
  instagram: 'Instagram',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  reddit: 'Reddit',
  threads: 'Threads',
  bluesky: 'Bluesky',
  mastodon: 'Mastodon',
  twitch: 'Twitch',
  pinterest: 'Pinterest',
  github: 'GitHub',
  gitlab: 'GitLab',
  huggingface: 'Hugging Face',
  dribbble: 'Dribbble',
  behance: 'Behance',
  medium: 'Medium',
  substack: 'Substack',
  website: 'Website',
  rss: 'RSS',
}

/**
 * Normalises author social data into a uniform list of {platform, url, label}.
 * Accepts BOTH the new fillable array form [{platform,url}] and the legacy
 * object form {twitter:'...'} so existing content keeps working.
 */
export function normalizeSocial(social: unknown): SocialLink[] {
  if (!social) return []
  if (Array.isArray(social)) {
    return social
      .map((item: any) => {
        const platform = String(item?.platform || item?.key || '').toLowerCase()
        const url = String(item?.url || '').trim()
        if (!platform || !url) return null
        const key = LEGACY_MAP[platform] || platform
        return { platform: key, url, label: PLATFORM_LABELS[key] || platform }
      })
      .filter(Boolean) as SocialLink[]
  }
  if (typeof social === 'object') {
    return Object.entries(social)
      .map(([platform, url]) => {
        const href = String(url || '')
        if (!href) return null
        const key = LEGACY_MAP[platform.toLowerCase()] || platform.toLowerCase()
        return {
          platform: key,
          url: href,
          label: PLATFORM_LABELS[key] || platform,
        }
      })
      .filter(Boolean) as SocialLink[]
  }
  return []
}
