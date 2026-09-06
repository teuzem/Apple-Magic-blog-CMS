import { TagIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'category',
  title: 'Category',
  icon: TagIcon,
  type: 'document',
  fields: [
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
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'parent',
      title: 'Parent category',
      type: 'reference',
      to: [{ type: 'category' }],
      description: 'For sub-categories (e.g. "MacBook" under "Mac").',
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
      name: 'image',
      title: 'Hero image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'color',
      title: 'Brand color',
      type: 'string',
      description: 'Accent color used for badges and highlights.',
      options: {
        list: [
          { title: 'iPhone Blue', value: '#2997ff' },
          { title: 'iPad Orange', value: '#ff9f0a' },
          { title: 'Mac Indigo', value: '#5e5ce6' },
          { title: 'Watch Pink', value: '#ff375f' },
          { title: 'AirPods Green', value: '#34c759' },
          { title: 'Vision Purple', value: '#bf5af2' },
          { title: 'Services Red', value: '#ff453a' },
          { title: 'Apple Blue', value: '#06c' },
          { title: 'Neutral Gray', value: '#86868b' },
        ],
      },
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display order',
      type: 'number',
      description: 'Lower numbers appear first in the navigation.',
    }),
    defineField({
      name: 'showInNav',
      title: 'Show in navigation',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO title (English)',
      type: 'string',
    }),
    defineField({
      name: 'seoTitleFr',
      title: 'SEO title (French)',
      type: 'string',
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO description (English)',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'seoDescriptionFr',
      title: 'SEO description (French)',
      type: 'text',
      rows: 2,
    }),
  ],
  preview: {
    select: { title: 'title', parent: 'parent.title', media: 'image' },
    prepare({ title, parent, media }) {
      return {
        title,
        media,
        subtitle: parent ? `under ${parent}` : 'Top-level',
      }
    },
  },
})
