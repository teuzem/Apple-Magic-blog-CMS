import { defineField, defineType } from 'sanity'

const MAX_VIDEO_BYTES = 50 * 1024 * 1024

export default defineType({
  name: 'articleSidebarSlide',
  title: 'Article sidebar media slide',
  type: 'object',
  fields: [
    defineField({
      name: 'enabled',
      title: 'Enabled',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'title',
      title: 'Title (English)',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'titleFr',
      title: 'Title (French)',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description (English)',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'descriptionFr',
      title: 'Description (French)',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'mediaType',
      title: 'Media type',
      type: 'string',
      initialValue: 'image',
      options: {
        layout: 'radio',
        list: [
          { title: 'Image', value: 'image' },
          { title: 'Uploaded video', value: 'video' },
          { title: 'Video or streaming embed', value: 'embed' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.mediaType !== 'image',
      fields: [
        defineField({ name: 'alt', title: 'Alternative text', type: 'string' }),
      ],
      validation: (rule) =>
        rule.custom((value, context) =>
          (context.parent as { mediaType?: string } | undefined)?.mediaType ===
            'image' && !value
            ? 'An image is required for an image slide.'
            : true,
        ),
    }),
    defineField({
      name: 'video',
      title: 'Uploaded video',
      description: 'Video files must be smaller than 50 MB.',
      type: 'file',
      options: { accept: 'video/*' },
      hidden: ({ parent }) => parent?.mediaType !== 'video',
      validation: (rule) =>
        rule.custom(async (value, context) => {
          const parent = context.parent as { mediaType?: string } | undefined
          if (parent?.mediaType !== 'video') return true
          const reference = (value as { asset?: { _ref?: string } } | undefined)
            ?.asset?._ref
          if (!reference) return 'An uploaded video is required.'

          const client = context.getClient({ apiVersion: '2026-09-04' })
          const asset = await client.fetch<{ size?: number } | null>(
            '*[_id == $id][0]{size}',
            { id: reference },
          )
          if (!asset?.size) return true
          return asset.size < MAX_VIDEO_BYTES
            ? true
            : 'The uploaded video must be smaller than 50 MB.'
        }),
    }),
    defineField({
      name: 'embedUrl',
      title: 'Video or streaming URL',
      description:
        'Paste an HTTPS video or streaming URL. YouTube, Vimeo, Twitch, Dailymotion, Streamable, Loom, Wistia, Spotify, TikTok, Instagram, Facebook and direct video URLs are supported.',
      type: 'url',
      hidden: ({ parent }) => parent?.mediaType !== 'embed',
      validation: (rule) =>
        rule
          .uri({ scheme: ['https'] })
          .custom((value, context) =>
            (context.parent as { mediaType?: string } | undefined)
              ?.mediaType === 'embed' && !value
              ? 'An HTTPS embed URL is required.'
              : true,
          ),
    }),
    defineField({
      name: 'posterImage',
      title: 'Video poster image',
      type: 'image',
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.mediaType === 'image',
      fields: [
        defineField({ name: 'alt', title: 'Alternative text', type: 'string' }),
      ],
    }),
    defineField({
      name: 'destinationUrl',
      title: 'Destination URL',
      description:
        'The entire slide opens this destination. Relative paths and HTTPS URLs are accepted.',
      type: 'string',
      validation: (rule) =>
        rule.required().custom((value) => {
          if (!value) return true
          return value.startsWith('/') || /^https:\/\//i.test(value)
            ? true
            : 'Use a relative path beginning with / or an HTTPS URL.'
        }),
    }),
    defineField({
      name: 'openInNewTab',
      title: 'Open in a new tab',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'startsAt',
      title: 'Start displaying',
      type: 'datetime',
    }),
    defineField({
      name: 'endsAt',
      title: 'Stop displaying',
      type: 'datetime',
      validation: (rule) =>
        rule.custom((value, context) => {
          const startsAt = (context.parent as { startsAt?: string } | undefined)
            ?.startsAt
          return value && startsAt && new Date(value) <= new Date(startsAt)
            ? 'The end date must be later than the start date.'
            : true
        }),
    }),
    defineField({
      name: 'sponsorLabel',
      title: 'Sponsor label (English)',
      type: 'string',
    }),
    defineField({
      name: 'sponsorLabelFr',
      title: 'Sponsor label (French)',
      type: 'string',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'description',
      media: 'image',
      enabled: 'enabled',
    },
    prepare({ title, subtitle, media, enabled }) {
      return {
        title: `${enabled === false ? '[Disabled] ' : ''}${title || 'Untitled slide'}`,
        subtitle,
        media,
      }
    },
  },
})
