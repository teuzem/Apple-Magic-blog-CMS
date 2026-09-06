import { PackageIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

/**
 * Apple product database — powering product cards, price comparisons and
 * structured Product schema. Includes Africa-focused pricing across
 * multiple currencies.
 */
export default defineType({
  name: 'product',
  title: 'Product',
  icon: PackageIcon,
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
      options: { source: 'name', maxLength: 120 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description:
        'Short Apple-style descriptor, e.g. "Titanium. So strong. So light. So Pro."',
    }),
    defineField({ name: 'nameFr', title: 'Nom (FR)', type: 'string' }),
    defineField({ name: 'taglineFr', title: 'Accroche (FR)', type: 'string' }),
    defineField({
      name: 'description',
      title: 'Editorial description',
      type: 'text',
      rows: 4,
      description:
        'Long-form product summary shown on the product detail page.',
    }),
    defineField({
      name: 'descriptionFr',
      title: 'Description (FR)',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'content',
      title: 'Rich product description (visual editor + HTML import)',
      type: 'blockContent',
      description:
        'Native editorial content with text, images, video, links, tables and callouts.',
    }),
    defineField({
      name: 'contentFr',
      title: 'Description produit enrichie (FR, import HTML)',
      type: 'blockContent',
      description:
        'Contenu éditorial français avec texte, images, vidéos et liens intégrés.',
    }),
    defineField({
      name: 'officialUrl',
      title: 'Official product URL',
      type: 'url',
      description:
        'Canonical Apple or retailer product page used for verification.',
    }),
    defineField({
      name: 'imageSource',
      title: 'Image source / attribution',
      type: 'url',
      description: 'Source page for the product image used in the gallery.',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
    }),
    defineField({
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
    }),
    defineField({
      name: 'gallery',
      title: 'Supporting gallery',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'image',
              title: 'Image',
              type: 'image',
              options: { hotspot: true },
            },
            { name: 'alt', title: 'Alt text', type: 'string' },
            { name: 'caption', title: 'Caption', type: 'string' },
            { name: 'captionFr', title: 'Caption (FR)', type: 'string' },
            {
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 2,
            },
            {
              name: 'descriptionFr',
              title: 'Description (FR)',
              type: 'text',
              rows: 2,
            },
          ],
        },
      ],
    }),
    defineField({ name: 'videoUrl', title: 'Product video URL', type: 'url' }),
    defineField({
      name: 'supportingLinks',
      title: 'Supporting links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'label', title: 'Label', type: 'string' },
            { name: 'labelFr', title: 'Label (FR)', type: 'string' },
            { name: 'url', title: 'URL', type: 'url' },
          ],
        },
      ],
    }),
    defineField({
      name: 'specs',
      title: 'Specifications',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'label', title: 'Label', type: 'string' },
            { name: 'value', title: 'Value', type: 'string' },
          ],
        },
      ],
      description:
        'Key specs shown on the product card (display, chip, battery, etc.)',
    }),
    defineField({
      name: 'pricing',
      title: 'Pricing',
      type: 'object',
      description: 'Starting prices across Africa-focused currencies.',
      fields: [
        { name: 'XAF', title: 'FCFA (default)', type: 'number' },
        { name: 'USD', title: 'USD ($)', type: 'number' },
        { name: 'EUR', title: 'EUR (€)', type: 'number' },
        { name: 'ZAR', title: 'ZAR (R)', type: 'number' },
        { name: 'KES', title: 'KES (KSh)', type: 'number' },
        { name: 'NGN', title: 'NGN (₦)', type: 'number' },
        { name: 'EGP', title: 'EGP (E£)', type: 'number' },
        { name: 'GHS', title: 'GHS (GH₵)', type: 'number' },
      ],
    }),
    defineField({
      name: 'storeUrl',
      title: 'Official Apple Magic store URL',
      type: 'url',
      description:
        'Buy-link to our own store on applemagicstore.tech. Used for the primary "Buy / Order" CTA button.',
      placeholder: 'https://applemagicstore.tech/product/...',
    }),
    defineField({
      name: 'releaseDate',
      title: 'Release date',
      type: 'datetime',
    }),
    defineField({
      name: 'model',
      title: 'Model identifier',
      type: 'string',
      description: 'Public model or generation name used in structured data.',
    }),
    defineField({
      name: 'availability',
      title: 'Availability',
      type: 'string',
      options: {
        list: [
          { title: 'In stock', value: 'InStock' },
          { title: 'Pre-order', value: 'PreOrder' },
          { title: 'Out of stock', value: 'OutOfStock' },
        ],
      },
      initialValue: 'InStock',
    }),
    defineField({
      name: 'rating',
      title: 'Average rating (out of 5)',
      type: 'number',
      validation: (r) => r.min(0).max(5),
    }),
    defineField({
      name: 'reviewCount',
      title: 'Review count',
      type: 'number',
    }),
    defineField({
      name: 'affiliateLink',
      title: 'Affiliate / Buy link',
      type: 'url',
      description: 'Amazon/Jumuaa/Konga/partner URL for "Buy now".',
    }),
    defineField({
      name: 'relatedProducts',
      title: 'Related products',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'product' }] }],
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO title',
      type: 'string',
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO description',
      type: 'text',
      rows: 2,
    }),
  ],
  preview: {
    select: { title: 'name', tagline: 'tagline', media: 'images.0' },
    prepare({ title, tagline, media }) {
      return { title, media, subtitle: tagline }
    },
  },
})
