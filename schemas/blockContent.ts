import { defineArrayMember, defineField, defineType } from 'sanity'

import HtmlImportInput from '../components/studio/HtmlImportInput'
import StockVideoInput from '../components/studio/StockVideoInput'
import UniversalEmbedInput from '../components/studio/UniversalEmbedInput'

/**
 * The heart of the Apple Magic editing experience.
 *
 * A highly opinionated Portable Text editor built around an Apple-products
 * blog: rich typography, callouts, pros/cons, comparison tables, product
 * cards, embeds, galleries and affiliate call-to-actions — all selectable
 * inline as blocks.
 */

export default defineType({
  name: 'blockContent',
  title: 'Rich Content',
  type: 'array',
  description:
    'Write visually, paste formatted content directly, or use Import HTML for a complete HTML article.',
  components: {
    input: HtmlImportInput,
  },
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'Lead paragraph', value: 'lead' },
        { title: 'Small text', value: 'small' },
        { title: 'Centered paragraph', value: 'center' },
        { title: 'H1', value: 'h1' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
        { title: 'H4', value: 'h4' },
        { title: 'Quote', value: 'blockquote' },
      ],
      lists: [
        { title: 'Bullet', value: 'bullet' },
        { title: 'Numbered', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Bold', value: 'strong' },
          { title: 'Italic', value: 'em' },
          { title: 'Code', value: 'code' },
          { title: 'Underline', value: 'underline' },
          { title: 'Strike', value: 'strike-through' },
          { title: 'Highlight', value: 'highlight' },
          { title: 'Superscript', value: 'sup' },
          { title: 'Subscript', value: 'sub' },
          { title: 'Keyboard key', value: 'kbd' },
        ],
        annotations: [
          {
            title: 'Internal Link',
            name: 'internalLink',
            type: 'object',
            fields: [
              {
                name: 'reference',
                type: 'reference',
                to: [
                  { type: 'post' },
                  { type: 'product' },
                  { type: 'category' },
                ],
              },
            ],
          },
          {
            title: 'External Link',
            name: 'link',
            type: 'object',
            fields: [
              { name: 'href', type: 'url', title: 'URL' },
              {
                name: 'openInNewTab',
                type: 'boolean',
                title: 'Open in new tab',
                initialValue: true,
              },
            ],
          },
          {
            title: 'Affiliate Link',
            name: 'affiliate',
            type: 'object',
            fields: [
              {
                name: 'label',
                type: 'string',
                title: 'Label',
                description: 'e.g. Check price on Amazon',
              },
              {
                name: 'href',
                type: 'url',
                title: 'URL',
                description: 'Your affiliate / partner URL',
              },
            ],
          },
        ],
      },
    }),

    // ---- Inline media ----
    defineArrayMember({
      type: 'image',
      title: 'Image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          description: 'Important for SEO & accessibility',
        },
        { name: 'caption', type: 'string', title: 'Caption' },
        {
          name: 'layout',
          type: 'string',
          title: 'Layout',
          options: {
            list: [
              { title: 'Full width', value: 'full' },
              { title: 'Wide', value: 'wide' },
              { title: 'Standard', value: 'standard' },
            ],
          },
          initialValue: 'wide',
        },
      ],
    }),

    // ---- Rich custom blocks ----
    defineArrayMember({
      type: 'callout',
      name: 'callout',
      title: 'Callout / Alert',
    }),
    defineArrayMember({
      type: 'prosCons',
      title: 'Pros & Cons',
    }),
    defineArrayMember({
      type: 'verdict',
      title: 'Verdict Box',
    }),
    defineArrayMember({
      type: 'comparisonTable',
      title: 'Comparison Table',
    }),
    defineArrayMember({
      type: 'productCard',
      title: 'Product Card',
    }),
    defineArrayMember({
      type: 'affiliateCta',
      title: 'Affiliate CTA',
    }),
    defineArrayMember({
      type: 'code',
      title: 'Code Block',
    }),
    defineArrayMember({
      type: 'embed',
      title: 'Universal Media Embed',
    }),
    defineArrayMember({
      type: 'stockVideo',
      title: 'Pexels / Pixabay Video',
    }),
    defineArrayMember({
      type: 'mediaFile',
      title: 'Uploaded Video / Audio / File',
    }),
    defineArrayMember({
      type: 'latex',
      title: 'Math / LaTeX',
    }),
    defineArrayMember({
      type: 'faq',
      title: 'Bilingual FAQ',
    }),
    defineArrayMember({
      type: 'gallery',
      title: 'Gallery',
    }),
    defineArrayMember({
      type: 'htmlContent',
      title: 'HTML Section',
    }),
  ],
})

/**
 * Reusable schema pieces
 */

export const calloutSchema = defineType({
  name: 'callout',
  title: 'Callout',
  type: 'object',
  fields: [
    {
      name: 'icon',
      title: 'Icon',
      type: 'string',
      options: {
        list: [
          { title: '💡 Tip', value: 'tip' },
          { title: '⚠️ Warning', value: 'warning' },
          { title: 'ℹ️ Info', value: 'info' },
          { title: '✅ Pro tip', value: 'pro' },
          { title: '🔒 Privacy', value: 'privacy' },
        ],
      },
      initialValue: 'info',
    },
    {
      name: 'heading',
      title: 'Heading (optional)',
      type: 'string',
    },
    {
      name: 'text',
      title: 'Text',
      type: 'text',
      validation: (r) => r.required(),
    },
  ],
  preview: {
    select: { icon: 'icon', text: 'text', heading: 'heading' },
    prepare({ icon, text, heading }) {
      return { title: `${icon || 'Callout'}: ${heading || text?.slice(0, 50)}` }
    },
  },
})

export const prosConsSchema = defineType({
  name: 'prosCons',
  title: 'Pros & Cons',
  type: 'object',
  fields: [
    {
      name: 'score',
      title: 'Final score (out of 10)',
      description:
        'Showcased as a big bold score with stars on top of the Pros & Cons widget.',
      type: 'number',
      validation: (r) => r.min(0).max(10),
    },
    {
      name: 'pros',
      title: 'Pros',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'cons',
      title: 'Cons',
      type: 'array',
      of: [{ type: 'string' }],
    },
  ],
})

export const verdictSchema = defineType({
  name: 'verdict',
  title: 'Verdict',
  type: 'object',
  fields: [
    {
      name: 'rating',
      title: 'Rating (out of 10)',
      type: 'number',
      validation: (r) => r.min(0).max(10),
    },
    { name: 'title', title: 'Title', type: 'string' },
    { name: 'body', title: 'Body', type: 'text' },
    {
      name: 'recommended',
      title: 'Is it recommended?',
      type: 'boolean',
    },
  ],
})

export const comparisonTableSchema = defineType({
  name: 'comparisonTable',
  title: 'Comparison Table',
  type: 'object',
  fields: [
    {
      name: 'caption',
      title: 'Caption',
      type: 'string',
    },
    {
      name: 'columns',
      title: 'Columns',
      type: 'array',
      of: [{ type: 'string' }],
      description:
        'First cell should be the row label column header (e.g. "Specification")',
    },
    {
      name: 'rows',
      title: 'Rows',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'label', title: 'Row label', type: 'string' },
            {
              name: 'values',
              title: 'Values',
              type: 'array',
              of: [{ type: 'string' }],
              description: 'One value per column',
            },
          ],
        },
      ],
    },
  ],
})

export const productCardSchema = defineType({
  name: 'productCard',
  title: 'Product Card',
  type: 'object',
  fields: [
    {
      name: 'product',
      title: 'Product',
      type: 'reference',
      to: [{ type: 'product' }],
    },
    { name: 'title', title: 'Overridden title (optional)', type: 'string' },
    { name: 'tagline', title: 'Tagline (optional)', type: 'string' },
  ],
})

export const affiliateCtaSchema = defineType({
  name: 'affiliateCta',
  title: 'Affiliate CTA',
  type: 'object',
  fields: [
    {
      name: 'label',
      title: 'Button label',
      type: 'string',
      initialValue: 'Check price',
    },
    { name: 'url', title: 'URL', type: 'url' },
    { name: 'note', title: 'Note (optional)', type: 'string' },
  ],
})

export const embedSchema = defineType({
  name: 'embed',
  title: 'Universal Media Embed',
  type: 'object',
  components: { input: UniversalEmbedInput },
  fields: [
    {
      name: 'provider',
      title: 'Provider',
      type: 'string',
      options: {
        list: [
          { title: 'Automatic detection', value: 'auto' },
          { title: 'YouTube', value: 'youtube' },
          { title: 'Twitter / X', value: 'twitter' },
          { title: 'Instagram', value: 'instagram' },
          { title: 'TikTok', value: 'tiktok' },
          { title: 'Vimeo', value: 'vimeo' },
          { title: 'Dailymotion', value: 'dailymotion' },
          { title: 'Facebook', value: 'facebook' },
          { title: 'Twitch', value: 'twitch' },
          { title: 'Spotify', value: 'spotify' },
          { title: 'SoundCloud', value: 'soundcloud' },
          { title: 'Apple Podcasts / Music', value: 'apple' },
          { title: 'Custom HTTPS iframe', value: 'custom' },
        ],
      },
      initialValue: 'auto',
    },
    { name: 'url', title: 'URL', type: 'url' },
    { name: 'title', title: 'Accessible title', type: 'string' },
    { name: 'caption', title: 'Caption (English)', type: 'string' },
    { name: 'captionFr', title: 'Caption (French)', type: 'string' },
    {
      name: 'aspectRatio',
      title: 'Aspect ratio',
      type: 'string',
      options: {
        list: [
          { title: 'Landscape 16:9', value: '16/9' },
          { title: 'Square 1:1', value: '1/1' },
          { title: 'Portrait 9:16', value: '9/16' },
          { title: 'Classic 4:3', value: '4/3' },
        ],
      },
      initialValue: '16/9',
    },
  ],
})

export const stockVideoSchema = defineType({
  name: 'stockVideo',
  title: 'Pexels / Pixabay Video',
  type: 'object',
  components: { input: StockVideoInput },
  fields: [
    {
      name: 'url',
      title: 'Video URL',
      type: 'url',
      validation: (rule) => rule.required(),
    },
    { name: 'posterUrl', title: 'Poster URL', type: 'url' },
    { name: 'caption', title: 'Caption (English)', type: 'string' },
    { name: 'captionFr', title: 'Caption (French)', type: 'string' },
    { name: 'alt', title: 'Accessible description', type: 'string' },
    { name: 'provider', title: 'Provider', type: 'string', readOnly: true },
    { name: 'creator', title: 'Creator', type: 'string', readOnly: true },
    { name: 'sourceId', title: 'Source ID', type: 'string', readOnly: true },
    { name: 'sourceUrl', title: 'Source page', type: 'url', readOnly: true },
    { name: 'width', title: 'Width', type: 'number', readOnly: true },
    { name: 'height', title: 'Height', type: 'number', readOnly: true },
    { name: 'duration', title: 'Duration', type: 'number', readOnly: true },
    {
      name: 'searchQuery',
      title: 'Search query',
      type: 'string',
      readOnly: true,
    },
  ],
  preview: {
    select: { title: 'caption', subtitle: 'provider' },
    prepare({ title, subtitle }) {
      return {
        title: title || 'Stock video',
        subtitle: subtitle || 'Pexels / Pixabay',
      }
    },
  },
})

export const latexSchema = defineType({
  name: 'latex',
  title: 'Math / LaTeX',
  type: 'object',
  fields: [
    {
      name: 'formula',
      title: 'LaTeX formula',
      type: 'text',
      rows: 5,
      validation: (rule) => rule.required(),
    },
    {
      name: 'displayMode',
      title: 'Display equation',
      type: 'boolean',
      initialValue: true,
    },
    { name: 'alt', title: 'Accessible description', type: 'string' },
    { name: 'caption', title: 'Caption (English)', type: 'string' },
    { name: 'captionFr', title: 'Caption (French)', type: 'string' },
  ],
  preview: {
    select: { formula: 'formula' },
    prepare({ formula }) {
      return {
        title: 'Math / LaTeX',
        subtitle: String(formula || '').slice(0, 80),
      }
    },
  },
})

export const faqSchema = defineType({
  name: 'faq',
  title: 'Bilingual FAQ',
  type: 'object',
  fields: [
    { name: 'title', title: 'Heading (English)', type: 'string' },
    { name: 'titleFr', title: 'Heading (French)', type: 'string' },
    {
      name: 'items',
      title: 'Questions and answers',
      type: 'array',
      validation: (rule) => rule.min(2),
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'question',
              title: 'Question (English)',
              type: 'string',
              validation: (rule) => rule.required(),
            },
            {
              name: 'answer',
              title: 'Answer (English)',
              type: 'text',
              rows: 4,
              validation: (rule) => rule.required(),
            },
            { name: 'questionFr', title: 'Question (French)', type: 'string' },
            {
              name: 'answerFr',
              title: 'Answer (French)',
              type: 'text',
              rows: 4,
            },
          ],
          preview: { select: { title: 'question', subtitle: 'questionFr' } },
        },
      ],
    },
  ],
  preview: {
    select: { title: 'title', count: 'items.length' },
    prepare({ title, count }) {
      return { title: title || 'FAQ', subtitle: `${count || 0} questions` }
    },
  },
})

export const gallerySchema = defineType({
  name: 'gallery',
  title: 'Image Gallery',
  type: 'object',
  fields: [
    {
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [{ name: 'alt', type: 'string', title: 'Alternative text' }],
        },
      ],
    },
    { name: 'caption', title: 'Caption', type: 'string' },
  ],
})

export const codeBlockSchema = defineType({
  name: 'code',
  title: 'Code Block',
  type: 'object',
  fields: [
    { name: 'language', title: 'Language', type: 'string' },
    { name: 'filename', title: 'Filename (optional)', type: 'string' },
    { name: 'code', title: 'Code', type: 'text' },
    { name: 'caption', title: 'Caption (English)', type: 'string' },
    { name: 'captionFr', title: 'Caption (French)', type: 'string' },
    {
      name: 'showLineNumbers',
      title: 'Show line numbers',
      type: 'boolean',
      initialValue: true,
    },
    {
      name: 'wrapLines',
      title: 'Wrap long lines',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'highlightLines',
      title: 'Highlighted lines',
      type: 'string',
      description: 'Examples: 2,4-7,12',
    },
  ],
})

const MAX_MEDIA_BYTES = 50 * 1024 * 1024

export const mediaFileSchema = defineType({
  name: 'mediaFile',
  title: 'Uploaded Video / Audio / File',
  type: 'object',
  fields: [
    {
      name: 'kind',
      title: 'Media type',
      type: 'string',
      options: {
        layout: 'radio',
        list: [
          { title: 'Video', value: 'video' },
          { title: 'Audio', value: 'audio' },
          { title: 'Downloadable file', value: 'file' },
        ],
      },
      initialValue: 'video',
      validation: (rule) => rule.required(),
    },
    {
      name: 'media',
      title: 'Upload',
      type: 'file',
      options: {
        accept: 'video/*,audio/*,.pdf,.zip,.doc,.docx,.xls,.xlsx,.ppt,.pptx',
      },
      validation: (rule) =>
        rule.custom(async (value, context) => {
          const reference = (value as { asset?: { _ref?: string } } | undefined)
            ?.asset?._ref
          if (!reference) return 'A media file is required.'
          const client = context.getClient({ apiVersion: '2026-09-04' })
          const asset = await client.fetch<{ size?: number } | null>(
            '*[_id == $id][0]{size}',
            { id: reference },
          )
          return !asset?.size || asset.size < MAX_MEDIA_BYTES
            ? true
            : 'Uploaded media must be smaller than 50 MB.'
        }),
    },
    {
      name: 'poster',
      title: 'Video poster',
      type: 'image',
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.kind !== 'video',
      fields: [{ name: 'alt', title: 'Alternative text', type: 'string' }],
    },
    { name: 'title', title: 'Title (English)', type: 'string' },
    { name: 'titleFr', title: 'Title (French)', type: 'string' },
    { name: 'caption', title: 'Caption (English)', type: 'string' },
    { name: 'captionFr', title: 'Caption (French)', type: 'string' },
    {
      name: 'transcript',
      title: 'Transcript (English)',
      type: 'text',
      rows: 6,
    },
    {
      name: 'transcriptFr',
      title: 'Transcript (French)',
      type: 'text',
      rows: 6,
    },
    {
      name: 'autoplay',
      title: 'Autoplay muted video',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'loop',
      title: 'Loop playback',
      type: 'boolean',
      initialValue: false,
    },
  ],
})

export const htmlContentSchema = defineType({
  name: 'htmlContent',
  title: 'HTML Section',
  type: 'object',
  fields: [
    {
      name: 'html',
      title: 'HTML',
      type: 'text',
      rows: 18,
      description:
        'Paste advanced article HTML here. Scripts, event handlers, unsafe URLs and unsupported embeds are removed on the website.',
      validation: (rule) => rule.required(),
    },
  ],
  preview: {
    select: { html: 'html' },
    prepare({ html }) {
      const text = String(html || '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
      return {
        title: 'HTML section',
        subtitle: text.slice(0, 90) || 'Empty HTML section',
      }
    },
  },
})
