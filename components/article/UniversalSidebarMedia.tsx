'use client'

import { useMemo } from 'react'

import SanityImage from '@/components/sanity/SanityImage'
import type { ArticleSidebarSlide } from '@/lib/sanity.queries'

function youtubeId(url: URL) {
  if (url.hostname === 'youtu.be') return url.pathname.split('/')[1]
  if (url.pathname.startsWith('/shorts/')) return url.pathname.split('/')[2]
  if (url.pathname.startsWith('/embed/')) return url.pathname.split('/')[2]
  return url.searchParams.get('v')
}

function getEmbedUrl(source: string): string | null {
  try {
    const url = new URL(source)
    if (url.protocol !== 'https:') return null
    const host = url.hostname.replace(/^www\./, '')

    if (
      host === 'youtube.com' ||
      host === 'm.youtube.com' ||
      host === 'youtu.be'
    ) {
      const id = youtubeId(url)
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null
    }
    if (host === 'vimeo.com' || host === 'player.vimeo.com') {
      const id = url.pathname.match(/(?:video\/)?(\d+)/)?.[1]
      return id ? `https://player.vimeo.com/video/${id}` : null
    }
    if (host === 'dailymotion.com' || host === 'dai.ly') {
      const id =
        host === 'dai.ly'
          ? url.pathname.split('/')[1]
          : url.pathname.match(/video\/([^_/?]+)/)?.[1]
      return id ? `https://www.dailymotion.com/embed/video/${id}` : null
    }
    if (host === 'streamable.com') {
      const id = url.pathname.split('/').filter(Boolean)[0]
      return id ? `https://streamable.com/e/${id}` : null
    }
    if (host === 'loom.com') {
      const id = url.pathname.match(/(?:share|embed)\/([^/?]+)/)?.[1]
      return id ? `https://www.loom.com/embed/${id}` : null
    }
    if (host.endsWith('wistia.com') || host.endsWith('wistia.net')) {
      const id = url.pathname.split('/').filter(Boolean).pop()
      return id ? `https://fast.wistia.net/embed/iframe/${id}` : null
    }
    if (host === 'open.spotify.com') {
      return `https://open.spotify.com/embed${url.pathname}`
    }
    if (host === 'twitch.tv' || host === 'player.twitch.tv') {
      const channel = url.pathname.split('/').filter(Boolean)[0]
      const parent =
        typeof window === 'undefined' ? 'localhost' : window.location.hostname
      return channel
        ? `https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&parent=${encodeURIComponent(parent)}`
        : null
    }
    if (host === 'facebook.com' || host === 'fb.watch') {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(source)}&show_text=false`
    }
    if (host === 'tiktok.com' || host === 'vm.tiktok.com') {
      const id = url.pathname.match(/video\/(\d+)/)?.[1]
      return id ? `https://www.tiktok.com/player/v1/${id}` : source
    }
    if (host === 'instagram.com') {
      const match = url.pathname.match(/\/(p|reel|tv)\/([^/]+)/)
      return match
        ? `https://www.instagram.com/${match[1]}/${match[2]}/embed`
        : source
    }

    if (/\.(mp4|webm|ogg)(?:$|\?)/i.test(url.pathname + url.search)) {
      return source
    }

    return source
  } catch {
    return null
  }
}

export default function UniversalSidebarMedia({
  slide,
  alt,
}: {
  slide: ArticleSidebarSlide
  alt: string
}) {
  const embedUrl = useMemo(
    () => (slide.embedUrl ? getEmbedUrl(slide.embedUrl) : null),
    [slide.embedUrl],
  )

  if (slide.mediaType === 'video' && slide.video?.asset?.url) {
    return (
      <video
        className="h-full w-full object-cover"
        src={slide.video.asset.url}
        poster={undefined}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={alt}
      />
    )
  }

  if (slide.mediaType === 'embed' && embedUrl) {
    if (/\.(mp4|webm|ogg)(?:$|\?)/i.test(embedUrl)) {
      return (
        <video
          className="h-full w-full object-cover"
          src={embedUrl}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={alt}
        />
      )
    }
    return (
      <iframe
        src={embedUrl}
        title={alt}
        className="h-full w-full border-0"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    )
  }

  if (slide.image) {
    return (
      <SanityImage
        asset={slide.image}
        alt={alt}
        fill
        rounded={false}
        sizes="(max-width: 1279px) 100vw, 420px"
        className="object-cover"
      />
    )
  }

  if (slide.posterImage) {
    return (
      <SanityImage
        asset={slide.posterImage}
        alt={alt}
        fill
        rounded={false}
        sizes="(max-width: 1279px) 100vw, 420px"
        className="object-cover"
      />
    )
  }

  return (
    <div className="flex h-full items-center justify-center bg-gray-7 px-6 text-center text-sm text-gray-3 dark:bg-gray-2 dark:text-gray-5">
      {alt}
    </div>
  )
}
