export type EmbedProvider =
  | 'auto'
  | 'youtube'
  | 'vimeo'
  | 'dailymotion'
  | 'tiktok'
  | 'twitter'
  | 'instagram'
  | 'facebook'
  | 'twitch'
  | 'spotify'
  | 'soundcloud'
  | 'apple'
  | 'custom'

export function detectEmbedProvider(input: string): EmbedProvider {
  try {
    const host = new URL(input).hostname.replace(/^www\./, '')
    if (host.includes('youtube.com') || host === 'youtu.be') return 'youtube'
    if (host.includes('vimeo.com')) return 'vimeo'
    if (host.includes('dailymotion.com') || host === 'dai.ly')
      return 'dailymotion'
    if (host.includes('tiktok.com')) return 'tiktok'
    if (host.includes('twitter.com') || host === 'x.com') return 'twitter'
    if (host.includes('instagram.com')) return 'instagram'
    if (host.includes('facebook.com') || host === 'fb.watch') return 'facebook'
    if (host.includes('twitch.tv')) return 'twitch'
    if (host.includes('spotify.com')) return 'spotify'
    if (host.includes('soundcloud.com')) return 'soundcloud'
    if (host.includes('apple.com') || host.includes('podcasts.apple.com'))
      return 'apple'
  } catch {}
  return 'custom'
}

export function getEmbedUrl(
  input: string,
  requestedProvider: EmbedProvider = 'auto',
  parentHost = 'applemagic.blog',
) {
  if (!input) return null
  const provider =
    requestedProvider === 'auto'
      ? detectEmbedProvider(input)
      : requestedProvider
  const url = input.trim()

  if (provider === 'youtube') {
    const id = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?.*?v=|embed\/|shorts\/|live\/))([\w-]{6,})/,
    )?.[1]
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null
  }
  if (provider === 'vimeo') {
    const id = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1]
    return id ? `https://player.vimeo.com/video/${id}` : null
  }
  if (provider === 'dailymotion') {
    const id = url.match(/(?:video\/|dai\.ly\/)([a-zA-Z0-9]+)/)?.[1]
    return id ? `https://www.dailymotion.com/embed/video/${id}` : null
  }
  if (provider === 'tiktok') {
    const id = url.match(/video\/(\d+)/)?.[1]
    return id ? `https://www.tiktok.com/player/v1/${id}` : null
  }
  if (provider === 'twitter') {
    const id = url.match(/status\/(\d+)/)?.[1]
    return id ? `https://platform.twitter.com/embed/Tweet.html?id=${id}` : null
  }
  if (provider === 'instagram') {
    const match = url.match(/instagram\.com\/(p|reel|tv)\/([^/?#]+)/)
    return match
      ? `https://www.instagram.com/${match[1]}/${match[2]}/embed/`
      : null
  }
  if (provider === 'facebook') {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`
  }
  if (provider === 'twitch') {
    const video = url.match(/videos\/(\d+)/)?.[1]
    if (video)
      return `https://player.twitch.tv/?video=${video}&parent=${encodeURIComponent(parentHost)}`
    const channel = url.match(/twitch\.tv\/([^/?#]+)/)?.[1]
    return channel
      ? `https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&parent=${encodeURIComponent(parentHost)}`
      : null
  }
  if (provider === 'spotify') {
    return url.replace('open.spotify.com/', 'open.spotify.com/embed/')
  }
  if (provider === 'soundcloud') {
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}`
  }
  if (provider === 'apple') {
    return url.replace('podcasts.apple.com/', 'embed.podcasts.apple.com/')
  }
  if (provider === 'custom') {
    try {
      const parsed = new URL(url)
      return parsed.protocol === 'https:' ? parsed.toString() : null
    } catch {
      return null
    }
  }
  return null
}
