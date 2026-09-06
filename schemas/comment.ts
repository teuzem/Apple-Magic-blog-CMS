import { CommentIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'comment',
  title: 'Comment',
  icon: CommentIcon,
  type: 'document',
  fields: [
    defineField({
      name: 'post',
      title: 'Post',
      type: 'reference',
      to: [{ type: 'post' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required().min(2),
    }),
    defineField({
      name: 'email',
      title: 'Email (not shown publicly)',
      type: 'string',
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: 'content',
      title: 'Comment',
      type: 'text',
      validation: (rule) => rule.required().min(1).max(2000),
    }),
    defineField({
      name: 'images',
      title: 'Images (up to 10)',
      type: 'array',
      validation: (rule) => rule.max(10),
      of: [
        {
          type: 'image',
          options: { hotspot: true, metadata: ['lqip', 'palette'] },
          fields: [{ name: 'alt', type: 'string', title: 'Alternative text' }],
        },
      ],
    }),
    defineField({
      name: 'avatar',
      title: 'Commenter avatar',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', title: 'Alternative text', type: 'string' }],
    }),
    defineField({
      name: 'parent',
      title: 'Reply to',
      type: 'reference',
      to: [{ type: 'comment' }],
      description: 'If this is a reply, select the parent comment.',
    }),
    defineField({
      name: 'likes',
      title: 'Likes',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'dislikes',
      title: 'Dislikes',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'shares',
      title: 'Shares',
      type: 'number',
      initialValue: 0,
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
          { title: 'Spam', value: 'spam' },
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
    select: { title: 'name', subtitle: 'content', post: 'post.title' },
    prepare({ title, subtitle, post }) {
      return { title, subtitle: `${post} — ${subtitle?.slice(0, 60)}` }
    },
  },
  orderings: [
    {
      title: 'Newest first',
      name: 'createdAtDesc',
      by: [{ field: 'createdAt', direction: 'desc' }],
    },
  ],
})
