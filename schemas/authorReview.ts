import { StarIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'authorReview',
  title: 'Author review',
  icon: StarIcon,
  type: 'document',
  fields: [
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'name',
      title: 'Reviewer name',
      type: 'string',
      validation: (rule) => rule.required().min(2).max(80),
    }),
    defineField({
      name: 'email',
      title: 'Email (private)',
      type: 'string',
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: 'rating',
      title: 'Rating',
      type: 'number',
      validation: (rule) => rule.required().integer().min(1).max(5),
    }),
    defineField({
      name: 'title',
      title: 'Review title',
      type: 'string',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'content',
      title: 'Review',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required().min(5).max(1200),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Approved', value: 'approved' },
          { title: 'Rejected', value: 'rejected' },
        ],
      },
      initialValue: 'pending',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created at',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'name', rating: 'rating' },
    prepare: ({ title, subtitle, rating }) => ({
      title: title || 'Author review',
      subtitle: `${subtitle || 'Anonymous'} · ${rating || 0}/5`,
    }),
  },
})
