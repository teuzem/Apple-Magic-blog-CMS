import type { PortableTextComponents } from '@portabletext/react'
import { PortableText } from '@portabletext/react'
import { ExternalLink, Link2 } from 'lucide-react'

import SanityImage from '@/components/sanity/SanityImage'
import { Link } from '@/i18n/navigation'
import type { Product } from '@/lib/sanity.queries'

import AffiliateCtaBlock from './AffiliateCtaBlock'
import CalloutBlock from './CalloutBlock'
import CodeBlock from './CodeBlock'
import ComparisonTableBlock from './ComparisonTableBlock'
import EmbedBlock from './EmbedBlock'
import FaqBlock from './FaqBlock'
import GalleryBlock from './GalleryBlock'
import HtmlContentBlock from './HtmlContentBlock'
import LatexBlock from './LatexBlock'
import MediaFileBlock from './MediaFileBlock'
import ProductCardBlock from './ProductCardBlock'
import ProsConsBlock from './ProsConsBlock'
import StockVideoBlock from './StockVideoBlock'
import VerdictBlock from './VerdictBlock'

interface PortableTextRendererProps {
  content: any
  className?: string
  locale?: string
  productMentions?: Product[]
  postId?: string
  communityAverage?: number
  communityCount?: number
}

/**
 * The main renderer for Sanity Portable Text content.
 * Maps custom block types (callout, prosCons, verdict, comparisonTable,
 * productCard, affiliateCta, code, embed, gallery) plus inline annotations
 * to their React components.
 */
export default function PortableTextRenderer({
  content,
  className,
  locale = 'en',
  productMentions = [],
  postId,
  communityAverage,
  communityCount,
}: PortableTextRendererProps) {
  // Fallback final score for the Pros & Cons widget: reuse the first
  // verdict rating found in the article so the big /10 strip is always shown.
  const verdictRating = Array.isArray(content)
    ? ((
        content.find(
          (b: any) => b?._type === 'verdict' && typeof b?.rating === 'number',
        ) as any
      )?.rating ?? undefined)
    : undefined

  // Resolve product references that the portable-text blocks carry as raw
  // `_ref`s against the already-fetched (and dereferenced) product mentions.
  const mentionsById = new Map<string, any>()
  for (const p of productMentions ?? []) {
    if (p?._id) mentionsById.set(p._id, p)
    if (p?.slug) mentionsById.set(`product-${p.slug}`, p)
  }
  const resolveProduct = (ref: string | undefined): any | undefined => {
    if (!ref) return undefined
    return (
      mentionsById.get(ref) || mentionsById.get(ref.replace(/^drafts\./, ''))
    )
  }

  const components: PortableTextComponents = {
    block: {
      h1: ({ children, value }) => (
        <h2
          id={headingId(value)}
          className="mt-12 mb-4 scroll-mt-24 break-words text-center text-3xl font-bold tracking-tight text-ink sm:text-left dark:text-white"
        >
          {children}
        </h2>
      ),
      h2: ({ children, value }) => (
        <h2
          id={headingId(value)}
          className="mt-12 mb-4 scroll-mt-24 break-words text-center text-3xl font-bold tracking-tight text-ink sm:text-left dark:text-white"
        >
          {children}
        </h2>
      ),
      h3: ({ children, value }) => (
        <h3
          id={headingId(value)}
          className="mt-10 mb-3 scroll-mt-24 break-words text-center text-2xl font-semibold tracking-tight text-ink sm:text-left dark:text-white"
        >
          {children}
        </h3>
      ),
      h4: ({ children, value }) => (
        <h4
          id={headingId(value)}
          className="mt-8 mb-2 scroll-mt-24 break-words text-center text-xl font-semibold tracking-tight text-ink sm:text-left dark:text-white"
        >
          {children}
        </h4>
      ),
      blockquote: ({ children }) => (
        <blockquote className="my-8 border-l-4 border-apple-blue pl-5 text-lg italic text-gray-2 dark:text-gray-8">
          {children}
        </blockquote>
      ),
      normal: ({ children }) => (
        <p className="my-5 max-w-full break-words text-[1.0625rem] leading-[1.8] text-gray-2 dark:text-gray-8">
          {children}
        </p>
      ),
      lead: ({ children }) => (
        <p className="my-6 max-w-full break-words text-xl leading-[1.75] text-gray-1 dark:text-gray-7">
          {children}
        </p>
      ),
      small: ({ children }) => (
        <p className="my-4 max-w-full break-words text-sm leading-relaxed text-gray-3 dark:text-gray-4">
          {children}
        </p>
      ),
      center: ({ children }) => (
        <p className="my-5 max-w-full break-words text-center text-[1.0625rem] leading-[1.8] text-gray-2 dark:text-gray-8">
          {children}
        </p>
      ),
    },
    list: {
      bullet: ({ children }) => (
        <ul className="my-5 list-disc space-y-2 pl-6 text-[1.0625rem] leading-relaxed text-gray-2 marker:text-apple-blue dark:text-gray-8">
          {children}
        </ul>
      ),
      number: ({ children }) => (
        <ol className="my-5 list-decimal space-y-2 pl-6 text-[1.0625rem] leading-relaxed text-gray-2 marker:text-apple-blue dark:text-gray-8">
          {children}
        </ol>
      ),
    },
    marks: {
      strong: ({ children }) => (
        <strong className="font-semibold">{children}</strong>
      ),
      em: ({ children }) => <em>{children}</em>,
      code: ({ children }) => (
        <code className="rounded-md bg-gray-7 px-1.5 py-0.5 font-mono text-[0.85em] text-magic-purple dark:bg-gray-2">
          {children}
        </code>
      ),
      underline: ({ children }) => (
        <span className="underline underline-offset-2">{children}</span>
      ),
      'strike-through': ({ children }) => (
        <span className="line-through">{children}</span>
      ),
      highlight: ({ children }) => (
        <mark className="rounded-md bg-magic-purple/15 px-1 text-magic-purple">
          {children}
        </mark>
      ),
      sup: ({ children }) => <sup>{children}</sup>,
      sub: ({ children }) => <sub>{children}</sub>,
      kbd: ({ children }) => (
        <kbd className="rounded border border-gray-5 bg-gray-7 px-1.5 py-0.5 font-mono text-[0.8em] shadow-sm dark:border-gray-2 dark:bg-gray-1">
          {children}
        </kbd>
      ),
      link: ({ value, children }) => (
        <a
          href={value?.href}
          target={value?.openInNewTab === false ? undefined : '_blank'}
          rel={
            value?.openInNewTab === false ? undefined : 'noopener noreferrer'
          }
          className="font-medium text-apple-blue underline underline-offset-2 hover:text-apple-blue-hover"
        >
          {children}{' '}
          <ExternalLink size={13} className="inline align-baseline" />
        </a>
      ),
      internalLink: ({ value, children }) => {
        const ref = value?.reference
        const targetType = ref?._type
        const href =
          targetType === 'category' && ref?.slug
            ? `/categories/${ref.slug}`
            : targetType === 'product' && ref?.slug
              ? `/products/${ref.slug}`
              : ref?.slug
                ? `/posts/${ref.slug}`
                : '#'
        return (
          <Link
            href={href as any}
            className="font-medium text-apple-blue underline underline-offset-2 hover:text-apple-blue-hover"
          >
            <Link2 size={13} className="mr-1 inline align-baseline" />
            {children}
          </Link>
        )
      },
      affiliate: ({ value, children }) => (
        <a
          href={value?.href}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="font-semibold text-magic-purple underline underline-offset-2 hover:text-magic-blue"
        >
          {children || value?.label}
        </a>
      ),
    },
    types: {
      image: ({ value }) => (
        <ImageBlock value={value} caption={value?.caption} alt={value?.alt} />
      ),
      callout: ({ value }) => <CalloutBlock block={value} />,
      prosCons: ({ value }) => (
        <ProsConsBlock
          block={{
            ...value,
            score: value?.score ?? verdictRating,
          }}
          locale={locale}
        />
      ),
      verdict: ({ value }) => (
        <VerdictBlock
          block={{ ...value, communityAverage, communityCount }}
          locale={locale}
          postId={postId}
        />
      ),
      comparisonTable: ({ value }) => <ComparisonTableBlock block={value} />,
      productCard: ({ value }) => (
        <ProductCardBlock
          block={{
            ...value,
            product: value?.product?.slug
              ? value.product
              : resolveProduct(value?.product?._ref),
          }}
          locale={locale}
        />
      ),
      affiliateCta: ({ value }) => (
        <AffiliateCtaBlock block={value} locale={locale} />
      ),
      code: ({ value }) => <CodeBlock block={value} locale={locale} />,
      embed: ({ value }) => <EmbedBlock block={{ ...value, locale }} />,
      stockVideo: ({ value }) => (
        <StockVideoBlock block={value} locale={locale} />
      ),
      latex: ({ value }) => <LatexBlock block={value} locale={locale} />,
      mediaFile: ({ value }) => (
        <MediaFileBlock block={value} locale={locale} />
      ),
      faq: ({ value }) => <FaqBlock block={value} locale={locale} />,
      gallery: ({ value }) => <GalleryBlock block={value} />,
      htmlContent: ({ value }) => <HtmlContentBlock html={value?.html} />,
    },
  }

  return (
    <div
      className={`min-w-0 max-w-full overflow-wrap-anywhere ${className || ''}`}
    >
      <PortableText value={content} components={components} />
    </div>
  )
}

/** Inline image figure with caption, honoring the chosen layout. */
function ImageBlock({
  value,
  caption,
  alt,
}: {
  value: any
  caption?: string
  alt?: string
}) {
  const layout = value?.layout || 'wide'
  const maxW =
    layout === 'full'
      ? 'w-full'
      : layout === 'standard'
        ? 'max-w-2xl'
        : 'max-w-4xl'

  return (
    <figure className={`my-8 ${maxW}`}>
      <div className="overflow-hidden rounded-xl">
        <SanityImage asset={value} alt={alt || caption || ''} rounded={false} />
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-[0.8125rem] text-gray-3 dark:text-gray-4">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

/** Derive a URL-safe anchor id from a Portable Text block's text. */
function headingId(block: any): string | undefined {
  if (!block || !Array.isArray(block.children)) return undefined
  const text = block.children
    .map((c: any) => c.text || '')
    .join(' ')
    .trim()
  if (!text) return undefined
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
