import { BookIcon } from '@sanity/icons'
import { format, parseISO } from 'date-fns'
import { defineArrayMember, defineField, defineType } from 'sanity'

import authorType from './author'
import categoryType from './category'
import productType from './product'
import seriesType from './series'
import tagType from './tag'

/**
 * The enterprise-grade Apple Magic blog post.
 * Rich editorial content with SEO control, monetisation (affiliate),
 * taxonomy, authoring, and personalization flags.
 */
export default defineType({
  name: 'post',
  title: 'Post',
  icon: BookIcon,
  type: 'document',
  fieldsets: [
    {
      name: 'meta',
      title: 'Meta & SEO',
      options: { collapsible: true, collapsed: true },
    },
    {
      name: 'monetize',
      title: 'Monetisation',
      options: { collapsible: true, collapsed: true },
    },
    {
      name: 'fr',
      title: 'Français (FR)',
      options: { collapsible: true, collapsed: true },
    },
    {
      name: 'publish',
      title: 'Publishing workflow',
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [
    defineField({
      name: 'locale',
      title: 'Content language',
      type: 'string',
      options: {
        list: [
          { title: 'English (EN)', value: 'en' },
          { title: 'Français (FR)', value: 'fr' },
        ],
        layout: 'radio',
      },
      initialValue: 'en',
      description:
        'The primary language of this article. Write the main title/excerpt/content below in this language. Use the “Français (FR)” section for the localized version when publishing bilingually.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 120,
        isUnique: (value, context) => context.defaultIsUnique(value, context),
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'content',
      title: 'Content (visual editor + HTML import)',
      type: 'blockContent',
      description:
        'Paste formatted content directly or open Import HTML to convert a complete HTML article into editable blocks.',
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(320),
    }),

    // ---- Français (FR) ----
    defineField({
      name: 'titleFr',
      title: 'Titre (FR)',
      type: 'string',
      description:
        'French title. Leave blank if this is an English-only article.',
      fieldset: 'fr',
    }),
    defineField({
      name: 'excerptFr',
      title: 'Extrait (FR)',
      type: 'text',
      rows: 3,
      description: 'French short description / meta description.',
      fieldset: 'fr',
    }),
    defineField({
      name: 'contentFr',
      title: 'Contenu (FR, éditeur visuel + import HTML)',
      type: 'blockContent',
      description:
        'Full French body content. If empty, French readers will fall back to the English content.',
      fieldset: 'fr',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        { name: 'alt', type: 'string', title: 'Alternative text' },
        { name: 'caption', type: 'string', title: 'Caption' },
      ],
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: categoryType.name }],
      description: 'Primary category (e.g. iPhone, Mac, Comparisons)',
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: tagType.name }] }],
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: authorType.name }],
    }),
    defineField({
      name: 'coAuthors',
      title: 'Co-authors',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: authorType.name }] }],
    }),
    defineField({
      name: 'series',
      title: 'Series / Collection',
      type: 'reference',
      to: [{ type: seriesType.name }],
      description:
        'Group this post with related articles (e.g. "iPhone 17 Buying Guide")',
    }),
    defineField({
      name: 'relatedPosts',
      title: 'Related Posts',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'post' }] }],
      description:
        'Manually curate related posts. If empty, related posts are auto-derived from tags.',
    }),
    defineField({
      name: 'productMentions',
      title: 'Products mentioned',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: productType.name }] }],
      description: 'Used for product cards and structured data.',
    }),
    defineField({
      name: 'status',
      title: 'Publishing status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft (hidden)', value: 'draft' },
          { title: 'In review', value: 'review' },
          { title: 'Scheduled', value: 'scheduled' },
          { title: 'Published', value: 'published' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      description:
        'Set to “Published” only when the article and its translation are final. Only posts with status “published” are shown on the live site. Use this to avoid accidentally publishing half-finished bilingual content.',
      fieldset: 'publish',
    }),
    defineField({
      name: 'date',
      title: 'Publish date',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'updatedAt',
      title: 'Last updated',
      type: 'datetime',
    }),
    defineField({
      name: 'featured',
      title: 'Featured (homepage hero story)',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'trending',
      title: 'Trending',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'allowComments',
      title: 'Allow comments',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'sponsored',
      title: 'Sponsored post',
      type: 'boolean',
      initialValue: false,
    }),

    // ---- Meta & SEO ----
    defineField({
      name: 'seoTitle',
      title: 'SEO title (English)',
      type: 'string',
      description: 'Overrides the <title>. Leave blank to auto-generate.',
      validation: (rule) => rule.max(70),
      fieldset: 'meta',
    }),
    defineField({
      name: 'seoTitleFr',
      title: 'SEO title (French)',
      type: 'string',
      validation: (rule) => rule.max(70),
      fieldset: 'meta',
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO description (English)',
      type: 'text',
      rows: 3,
      description:
        'Meta description. Leave blank to auto-generate from excerpt.',
      validation: (rule) => rule.max(170),
      fieldset: 'meta',
    }),
    defineField({
      name: 'seoDescriptionFr',
      title: 'SEO description (French)',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(170),
      fieldset: 'meta',
    }),
    defineField({
      name: 'seoKeywords',
      title: 'SEO keywords',
      type: 'string',
      fieldset: 'meta',
    }),
    defineField({
      name: 'focusKeyphrase',
      title: 'Focus keyphrase',
      type: 'string',
      description: 'Primary editorial search topic. Do not repeat unnaturally.',
      fieldset: 'meta',
    }),
    defineField({
      name: 'sources',
      title: 'Editorial sources',
      type: 'array',
      fieldset: 'meta',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            { name: 'title', title: 'Source title', type: 'string' },
            {
              name: 'url',
              title: 'Source URL',
              type: 'url',
              validation: (rule) => rule.uri({ scheme: ['https'] }),
            },
            { name: 'publisher', title: 'Publisher', type: 'string' },
            { name: 'accessedAt', title: 'Accessed on', type: 'date' },
          ],
          preview: { select: { title: 'title', subtitle: 'publisher' } },
        }),
      ],
    }),
    defineField({
      name: 'correctionNote',
      title: 'Correction or update note (English)',
      type: 'text',
      rows: 3,
      fieldset: 'meta',
    }),
    defineField({
      name: 'correctionNoteFr',
      title: 'Correction or update note (French)',
      type: 'text',
      rows: 3,
      fieldset: 'meta',
    }),
    defineField({
      name: 'ogImage',
      title: 'Open Graph image',
      type: 'image',
      options: { hotspot: true },
      description: 'Social share image. Defaults to cover image.',
      fieldset: 'meta',
    }),
    defineField({
      name: 'noIndex',
      title: 'No Index (hide from search engines)',
      type: 'boolean',
      initialValue: false,
      fieldset: 'meta',
    }),
    defineField({
      name: 'contentType',
      title: 'Content type (for structured data)',
      type: 'string',
      options: {
        list: [
          { title: 'Article', value: 'Article' },
          { title: 'Comparison', value: 'Comparison' },
          { title: 'Review', value: 'Review' },
          { title: 'Buying Guide', value: 'Guide' },
          { title: 'Tutorial / How-to', value: 'HowTo' },
          { title: 'News', value: 'NewsArticle' },
          { title: 'Opinion', value: 'Opinion' },
        ],
      },
      initialValue: 'Article',
      fieldset: 'meta',
    }),

    // ---- Monetisation ----
    defineField({
      name: 'affiliateDisclaimer',
      title: 'Affiliate disclaimer',
      type: 'text',
      rows: 2,
      description:
        'Shown automatically if the post has affiliate links or product cards.',
      fieldset: 'monetize',
    }),
    defineField({
      name: 'verdictVoteTotal',
      title: 'Verdict vote total',
      type: 'number',
      initialValue: 0,
      description: 'Sum of anonymous reader scores (0-10).',
      fieldset: 'monetize',
    }),
    defineField({
      name: 'verdictVoteCount',
      title: 'Verdict vote count',
      type: 'number',
      initialValue: 0,
      description: 'Number of reader votes included in the community average.',
      fieldset: 'monetize',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      category: 'category.title',
      date: 'date',
      media: 'coverImage',
    },
    prepare({ title, media, author, category, date }) {
      const subtitles = [
        category && `in ${category}`,
        author && `by ${author}`,
        date && `on ${format(parseISO(date), 'LLL d, yyyy')}`,
      ].filter(Boolean)

      return { title, media, subtitle: subtitles.join(' · ') }
    },
  },
})
