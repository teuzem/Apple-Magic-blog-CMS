import { EnvelopeIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'contactMessage',
  title: 'Contact Message',
  icon: EnvelopeIcon,
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'topic',
      title: 'Topic',
      type: 'string',
      options: {
        list: [
          { title: 'General', value: 'general' },
          { title: 'Editorial / Story tips', value: 'editorial' },
          { title: 'Advertising / Partnerships', value: 'partnerships' },
          { title: 'Support / Corrections', value: 'support' },
          { title: 'Press & media', value: 'press' },
        ],
      },
      initialValue: 'general',
    }),
    defineField({
      name: 'message',
      title: 'Message',
      type: 'text',
      rows: 6,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'locale',
      title: 'Language',
      type: 'string',
      options: {
        list: [
          { title: 'English', value: 'en' },
          { title: 'French', value: 'fr' },
        ],
      },
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'New', value: 'new' },
          { title: 'In progress', value: 'in-progress' },
          { title: 'Resolved', value: 'resolved' },
          { title: 'Spam', value: 'spam' },
        ],
      },
      initialValue: 'new',
    }),
    defineField({
      name: 'receivedAt',
      title: 'Received at',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'topic', media: 'email' },
  },
})
