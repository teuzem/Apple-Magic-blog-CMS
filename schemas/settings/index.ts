import { CogIcon } from '@sanity/icons'
import * as demo from 'lib/demo.data'
import { defineArrayMember, defineField, defineType } from 'sanity'

import OpenGraphInput from './OpenGraphInput'

export default defineType({
  name: 'settings',
  title: 'Site Settings',
  type: 'document',
  icon: CogIcon,
  preview: { select: { title: 'title', subtitle: 'tagline' } },
  groups: [
    { name: 'basic', title: 'Basics', default: true },
    { name: 'seo', title: 'SEO & Social' },
    { name: 'articleSidebar', title: 'Article Sidebar' },
    { name: 'newsletter', title: 'Newsletter' },
    { name: 'analytics', title: 'Analytics' },
    { name: 'footer', title: 'Footer' },
  ],
  fields: [
    // ---- Basics ----
    defineField({
      name: 'title',
      description: 'This field is the title of your blog.',
      title: 'Title',
      type: 'string',
      initialValue: demo.title,
      group: 'basic',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'e.g. "The magic of Apple, decoded"',
      group: 'basic',
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      description: 'Apple Magic logo (PNG with transparent background).',
      group: 'basic',
    }),
    defineField({
      name: 'favicon',
      title: 'Favicon',
      type: 'image',
      group: 'basic',
    }),
    defineField({
      name: 'description',
      description:
        'Used both for the <meta> description tag for SEO, and the blog subheader.',
      title: 'Description',
      type: 'array',
      initialValue: demo.description,
      group: 'basic',
      of: [
        defineArrayMember({
          type: 'block',
          options: {},
          styles: [],
          lists: [],
          marks: {
            decorators: [],
            annotations: [
              defineField({
                type: 'object',
                name: 'link',
                fields: [
                  {
                    type: 'string',
                    name: 'href',
                    title: 'URL',
                    validation: (rule) => rule.required(),
                  },
                ],
              }),
            ],
          },
        }),
      ],
      validation: (rule) => rule.max(400).required(),
    }),

    // ---- SEO & Social ----
    defineField({
      name: 'ogImage',
      title: 'Default Open Graph Image',
      description:
        'Used for social media previews when linking to the index page.',
      type: 'object',
      group: 'seo',
      components: {
        input: OpenGraphInput as any,
      },
      fields: [
        defineField({
          name: 'title',
          title: 'Title',
          type: 'string',
          initialValue: demo.ogImageTitle,
        }),
      ],
    }),
    defineField({
      name: 'social',
      title: 'Social links',
      type: 'object',
      group: 'seo',
      fields: [
        { name: 'twitter', title: 'Twitter / X', type: 'url' },
        { name: 'facebook', title: 'Facebook', type: 'url' },
        { name: 'instagram', title: 'Instagram', type: 'url' },
        { name: 'youtube', title: 'YouTube', type: 'url' },
        { name: 'tiktok', title: 'TikTok', type: 'url' },
        { name: 'pinterest', title: 'Pinterest', type: 'url' },
        { name: 'linkedin', title: 'LinkedIn', type: 'url' },
        { name: 'threads', title: 'Threads', type: 'url' },
        { name: 'whatsapp', title: 'WhatsApp', type: 'url' },
        { name: 'github', title: 'GitHub', type: 'url' },
        { name: 'rss', title: 'RSS feed', type: 'url' },
        { name: 'website', title: 'Website', type: 'url' },
      ],
    }),
    defineField({
      name: 'seoDefaults',
      title: 'Global SEO, publisher & Google News',
      type: 'object',
      group: 'seo',
      fields: [
        {
          name: 'titleSuffix',
          title: 'Title suffix',
          type: 'string',
          description: 'e.g. " — Apple Magic Blog"',
          initialValue: ' — Apple Magic Blog',
        },
        {
          name: 'organizationName',
          title: 'Public publisher name',
          type: 'string',
          initialValue: 'Apple Magic Blog',
        },
        { name: 'legalName', title: 'Legal organization name', type: 'string' },
        {
          name: 'description',
          title: 'Default description (English)',
          type: 'text',
          rows: 3,
          validation: (rule) => rule.max(320),
        },
        {
          name: 'descriptionFr',
          title: 'Description par défaut (français)',
          type: 'text',
          rows: 3,
          validation: (rule) => rule.max(320),
        },
        {
          name: 'newsPublicationName',
          title: 'Google News publication name',
          type: 'string',
          initialValue: 'Apple Magic Blog',
          description:
            'Use the same publication name consistently across the website.',
        },
        {
          name: 'enableNewsSitemap',
          title: 'Enable Google News sitemap',
          type: 'boolean',
          initialValue: true,
        },
        { name: 'foundingDate', title: 'Founding date', type: 'date' },
        { name: 'email', title: 'Public editorial email', type: 'string' },
        { name: 'telephone', title: 'Public telephone', type: 'string' },
        {
          name: 'address',
          title: 'Publisher address',
          type: 'object',
          fields: [
            { name: 'streetAddress', title: 'Street address', type: 'string' },
            { name: 'addressLocality', title: 'City', type: 'string' },
            { name: 'addressRegion', title: 'Region', type: 'string' },
            { name: 'postalCode', title: 'Postal code', type: 'string' },
            { name: 'addressCountry', title: 'Country code', type: 'string' },
          ],
        },
        {
          name: 'googleSiteVerification',
          title: 'Google Search Console verification code',
          type: 'string',
          description: 'Paste the content value only, not the full meta tag.',
        },
        {
          name: 'bingSiteVerification',
          title: 'Bing Webmaster verification code',
          type: 'string',
          description: 'Paste the content value only, not the full meta tag.',
        },
        {
          name: 'twitterHandle',
          title: '@handle (twitter cards)',
          type: 'string',
        },
        {
          name: 'defaultKeywords',
          title: 'Default topics / keywords',
          type: 'array',
          of: [{ type: 'string' }],
          options: { layout: 'tags' },
        },
      ],
    }),

    // ---- Article sidebar ----
    defineField({
      name: 'articleSidebar',
      title: 'Article sidebar',
      description:
        'Controls the wide article sidebar shown below the table of contents.',
      type: 'object',
      group: 'articleSidebar',
      fields: [
        defineField({
          name: 'enabled',
          title: 'Show article sidebar',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'announcementsTitle',
          title: 'Announcements heading (English)',
          type: 'string',
          initialValue: 'Apple news',
        }),
        defineField({
          name: 'announcementsTitleFr',
          title: 'Announcements heading (French)',
          type: 'string',
          initialValue: 'Actualites Apple',
        }),
        defineField({
          name: 'announcements',
          title: 'Apple news and information carousel',
          type: 'array',
          of: [{ type: 'articleSidebarSlide' }],
          validation: (rule) => rule.unique(),
        }),
        defineField({
          name: 'featuredTitle',
          title: 'Featured posts heading (English)',
          type: 'string',
          initialValue: 'Featured posts',
        }),
        defineField({
          name: 'featuredTitleFr',
          title: 'Featured posts heading (French)',
          type: 'string',
          initialValue: 'Articles a la une',
        }),
        defineField({
          name: 'featuredPosts',
          title: 'Featured posts',
          description:
            'Select up to three posts. If empty, posts marked Featured are used.',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'reference',
              to: [{ type: 'post' }],
              options: { disableNew: true },
            }),
          ],
          validation: (rule) => rule.unique().max(3),
        }),
        defineField({
          name: 'recentTitle',
          title: 'Recent posts heading (English)',
          type: 'string',
          initialValue: 'Latest posts',
        }),
        defineField({
          name: 'recentTitleFr',
          title: 'Recent posts heading (French)',
          type: 'string',
          initialValue: 'Articles recents',
        }),
        defineField({
          name: 'recentPostsCount',
          title: 'Number of recent posts',
          type: 'number',
          initialValue: 5,
          validation: (rule) => rule.integer().min(1).max(10),
        }),
        defineField({
          name: 'trendingTitle',
          title: 'Trending products heading (English)',
          type: 'string',
          initialValue: 'Trending products',
        }),
        defineField({
          name: 'trendingTitleFr',
          title: 'Trending products heading (French)',
          type: 'string',
          initialValue: 'Produits tendance',
        }),
        defineField({
          name: 'trendingProducts',
          title: 'Trending products',
          description:
            'Products link to their configured store destination, or to their product page when no store URL is provided.',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'reference',
              to: [{ type: 'product' }],
              options: { disableNew: true },
            }),
          ],
          validation: (rule) => rule.unique().max(12),
        }),
        defineField({
          name: 'sponsoredTitle',
          title: 'Sponsored carousel heading (English)',
          type: 'string',
          initialValue: 'Sponsored',
        }),
        defineField({
          name: 'sponsoredTitleFr',
          title: 'Sponsored carousel heading (French)',
          type: 'string',
          initialValue: 'Sponsorise',
        }),
        defineField({
          name: 'sponsoredSlides',
          title: 'Ads and sponsored carousel',
          type: 'array',
          of: [{ type: 'articleSidebarSlide' }],
          validation: (rule) => rule.unique(),
        }),
      ],
    }),

    // ---- Newsletter ----
    defineField({
      name: 'newsletter',
      title: 'Newsletter',
      type: 'object',
      group: 'newsletter',
      fields: [
        {
          name: 'title',
          title: 'Title',
          type: 'string',
          initialValue: 'Get the Magic delivered',
        },
        { name: 'description', title: 'Description', type: 'text', rows: 2 },
        {
          name: 'enabled',
          title: 'Enabled',
          type: 'boolean',
          initialValue: true,
        },
      ],
    }),

    // ---- Analytics ----
    defineField({
      name: 'analytics',
      title: 'Analytics',
      type: 'object',
      group: 'analytics',
      fields: [
        {
          name: 'ga4Id',
          title: 'Google Analytics 4 ID (G-XXXXXXX)',
          type: 'string',
        },
        {
          name: 'gtmId',
          title: 'Google Tag Manager ID (GTM-XXXX)',
          type: 'string',
        },
        { name: 'metaPixel', title: 'Meta Pixel ID', type: 'string' },
      ],
    }),

    // ---- Footer ----
    defineField({
      name: 'footer',
      title: 'Footer',
      type: 'object',
      group: 'footer',
      fields: [
        { name: 'aboutText', title: 'About text', type: 'text', rows: 3 },
        {
          name: 'aboutTextFr',
          title: 'About text (French)',
          type: 'text',
          rows: 3,
        },
        { name: 'copyright', title: 'Copyright line', type: 'string' },
        {
          name: 'copyrightFr',
          title: 'Copyright line (French)',
          type: 'string',
        },
        { name: 'email', title: 'Contact email', type: 'string' },
      ],
    }),
  ],
})
