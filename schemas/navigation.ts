import { MenuIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

/**
 * Global navigation configuration — powers the Apple-style mega menu.
 */
export default defineType({
  name: 'navigation',
  title: 'Navigation',
  icon: MenuIcon,
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      initialValue: 'Main navigation',
    }),
    defineField({
      name: 'items',
      title: 'Navigation items',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'navItem',
          title: 'Navigation item',
          fields: [
            {
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (r) => r.required(),
            },
            { name: 'labelFr', title: 'Label (French)', type: 'string' },
            {
              name: 'url',
              title: 'URL',
              type: 'string',
              validation: (r) => r.required(),
            },
            {
              name: 'children',
              title: 'Mega menu children',
              type: 'array',
              of: [
                {
                  type: 'object',
                  name: 'childItem',
                  title: 'Child item',
                  fields: [
                    {
                      name: 'label',
                      title: 'Label',
                      type: 'string',
                      validation: (r) => r.required(),
                    },
                    {
                      name: 'labelFr',
                      title: 'Label (French)',
                      type: 'string',
                    },
                    { name: 'url', title: 'URL', type: 'string' },
                    {
                      name: 'description',
                      title: 'Description (mega menu)',
                      type: 'string',
                    },
                    {
                      name: 'descriptionFr',
                      title: 'Description (French)',
                      type: 'string',
                    },
                    {
                      name: 'featured',
                      title: 'Featured (highlighted)',
                      type: 'boolean',
                      initialValue: false,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'footer',
      title: 'Footer link groups',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'footerGroup',
          title: 'Footer group',
          fields: [
            { name: 'heading', title: 'Heading', type: 'string' },
            { name: 'headingFr', title: 'Heading (French)', type: 'string' },
            {
              name: 'links',
              title: 'Links',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    { name: 'label', title: 'Label', type: 'string' },
                    {
                      name: 'labelFr',
                      title: 'Label (French)',
                      type: 'string',
                    },
                    { name: 'url', title: 'URL', type: 'string' },
                    {
                      name: 'external',
                      title: 'External link',
                      type: 'boolean',
                      initialValue: false,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }),
  ],
  preview: { select: { title: 'title' } },
})
