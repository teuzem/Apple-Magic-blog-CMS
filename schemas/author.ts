import { UserIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

const socialPlatforms = [
  { title: 'X (Twitter)', value: 'x' },
  { title: 'Instagram', value: 'instagram' },
  { title: 'YouTube', value: 'youtube' },
  { title: 'LinkedIn', value: 'linkedin' },
  { title: 'Facebook', value: 'facebook' },
  { title: 'TikTok', value: 'tiktok' },
  { title: 'Reddit', value: 'reddit' },
  { title: 'Threads', value: 'threads' },
  { title: 'Bluesky', value: 'bluesky' },
  { title: 'Mastodon', value: 'mastodon' },
  { title: 'Twitch', value: 'twitch' },
  { title: 'Pinterest', value: 'pinterest' },
  { title: 'GitHub', value: 'github' },
  { title: 'GitLab', value: 'gitlab' },
  { title: 'Hugging Face', value: 'huggingface' },
  { title: 'Dribbble', value: 'dribbble' },
  { title: 'Behance', value: 'behance' },
  { title: 'Medium', value: 'medium' },
  { title: 'Substack', value: 'substack' },
  { title: 'Blog / Personal website', value: 'website' },
  { title: 'Other / RSS', value: 'other' },
]

export default defineType({
  name: 'author',
  title: 'Author',
  icon: UserIcon,
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
    }),
    defineField({
      name: 'headline',
      title: 'Professional headline',
      type: 'string',
      description:
        'One line that captures the author, e.g. "Apple technology journalist & reviewer".',
    }),
    defineField({
      name: 'role',
      title: 'Role / Title',
      type: 'string',
      description: 'e.g. Senior iOS Editor',
    }),
    defineField({
      name: 'picture',
      title: 'Picture',
      type: 'image',
      fields: [{ name: 'alt', type: 'string', title: 'Alternative text' }],
      options: { hotspot: true, metadata: ['lqip', 'palette'] },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'bio',
      title: 'Bio (short)',
      type: 'text',
      rows: 4,
      description: 'Short bio shown on the author card and author page.',
    }),
    defineField({
      name: 'longBio',
      title: 'Long bio (author page)',
      type: 'text',
      rows: 8,
      description:
        'Optional, richer biography displayed on the dedicated author page.',
    }),
    defineField({
      name: 'quote',
      title: 'Favorite quote',
      type: 'string',
      description: 'A short personal or professional quote.',
    }),
    defineField({
      name: 'yearsExperience',
      title: 'Years of experience',
      type: 'number',
      validation: (rule) => rule.min(0).max(70),
    }),
    defineField({
      name: 'expertise',
      title: 'Areas of expertise',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'achievements',
      title: 'Notable achievements',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description:
        'e.g. "Published 500+ Apple reviews", "Won 2025 Tech Media Award".',
    }),
    /* ---- Demographic & background ---- */
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'e.g. Nairobi, Kenya',
    }),
    defineField({
      name: 'nationality',
      title: 'Nationality',
      type: 'string',
      description: 'e.g. Ghanaian',
    }),
    defineField({
      name: 'languages',
      title: 'Languages spoken',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: 'e.g. English, French, Swahili',
    }),
    defineField({
      name: 'education',
      title: 'Education',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'degree', title: 'Degree', type: 'string' },
            { name: 'school', title: 'School / University', type: 'string' },
            { name: 'year', title: 'Year', type: 'string' },
          ],
        },
      ],
      description: 'Academic background (optional).',
    }),
    /* ---- Social networks ---- */
    defineField({
      name: 'social',
      title: 'Social & professional links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'platform',
              title: 'Platform',
              type: 'string',
              options: { list: socialPlatforms },
              validation: (rule) => rule.required(),
            },
            {
              name: 'url',
              title: 'Profile / URL',
              type: 'url',
              validation: (rule) => rule.required(),
            },
          ],
          preview: {
            select: { platform: 'platform', url: 'url' },
            prepare({ platform, url }) {
              return { title: platform, subtitle: url }
            },
          },
        },
      ],
      description: 'Add as many professional networks as you like.',
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'role', media: 'picture' },
  },
})
