import sanitizeHtml from 'sanitize-html'

const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    'a',
    'audio',
    'b',
    'blockquote',
    'br',
    'code',
    'del',
    'div',
    'em',
    'figcaption',
    'figure',
    'h2',
    'h3',
    'h4',
    'hr',
    'i',
    'iframe',
    'img',
    'li',
    'ol',
    'p',
    'pre',
    'source',
    's',
    'span',
    'strong',
    'table',
    'tbody',
    'td',
    'th',
    'thead',
    'tr',
    'u',
    'ul',
    'video',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel', 'title'],
    iframe: [
      'allow',
      'allowfullscreen',
      'height',
      'loading',
      'src',
      'title',
      'width',
    ],
    audio: ['controls', 'loop', 'muted', 'preload', 'src'],
    img: ['alt', 'height', 'loading', 'src', 'title', 'width'],
    source: ['src', 'type', 'media'],
    video: [
      'autoplay',
      'controls',
      'height',
      'loop',
      'muted',
      'playsinline',
      'poster',
      'preload',
      'src',
      'width',
    ],
    td: ['colspan', 'rowspan'],
    th: ['colspan', 'rowspan', 'scope'],
  },
  allowedIframeHostnames: [
    'www.youtube.com',
    'www.youtube-nocookie.com',
    'player.vimeo.com',
    'www.youtube-nocookie.com',
    'www.dailymotion.com',
    'www.tiktok.com',
    'platform.twitter.com',
    'www.instagram.com',
    'www.facebook.com',
    'player.twitch.tv',
    'open.spotify.com',
    'w.soundcloud.com',
    'embed.podcasts.apple.com',
  ],
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesAppliedToAttributes: ['href', 'src'],
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', {
      rel: 'noopener noreferrer',
      target: '_blank',
    }),
    iframe: sanitizeHtml.simpleTransform('iframe', {
      loading: 'lazy',
    }),
    img: sanitizeHtml.simpleTransform('img', {
      loading: 'lazy',
    }),
    video: sanitizeHtml.simpleTransform('video', {
      controls: 'controls',
      playsinline: 'playsinline',
      preload: 'metadata',
    }),
    audio: sanitizeHtml.simpleTransform('audio', {
      controls: 'controls',
      preload: 'metadata',
    }),
  },
}

export default function HtmlContentBlock({ html }: { html?: string }) {
  if (!html?.trim()) return null

  const cleanHtml = sanitizeHtml(html, sanitizeOptions)
  if (!cleanHtml.trim()) return null

  return (
    <section
      className="prose prose-lg my-8 min-w-0 max-w-none overflow-wrap-anywhere text-gray-2 prose-headings:text-center prose-headings:text-ink prose-a:break-words prose-a:text-apple-blue prose-img:h-auto prose-img:max-w-full prose-img:rounded-lg sm:prose-headings:text-left dark:text-gray-8 dark:prose-headings:text-white [&_audio]:w-full [&_figure]:max-w-full [&_iframe]:aspect-video [&_iframe]:h-auto [&_iframe]:max-w-full [&_iframe]:w-full [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto [&_video]:h-auto [&_video]:max-w-full [&_video]:w-full [&_video]:rounded-lg"
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  )
}
