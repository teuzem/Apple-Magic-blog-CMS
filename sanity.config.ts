'use client'
/**
 * This config is used to set up Sanity Studio that's mounted on the `/studio` route.
 */

import { visionTool } from '@sanity/vision'
import {
  apiVersion,
  dataset,
  PREVIEW_MODE_ROUTE,
  projectId,
} from 'lib/sanity.api'
import { locate } from 'plugins/locate'
import { previewDocumentNode } from 'plugins/previewPane'
import { settingsPlugin, settingsStructure } from 'plugins/settings'
import { stockImageAssetSources } from 'plugins/stockImageAssetSources'
import { defineConfig } from 'sanity'
import { presentationTool } from 'sanity/presentation'
import { structureTool } from 'sanity/structure'
import { unsplashImageAsset } from 'sanity-plugin-asset-source-unsplash'
import articleSidebarSlideType from 'schemas/articleSidebarSlide'
import authorType from 'schemas/author'
import authorReviewType from 'schemas/authorReview'
import blockContentType from 'schemas/blockContent'
import {
  affiliateCtaSchema,
  calloutSchema,
  codeBlockSchema,
  comparisonTableSchema,
  embedSchema,
  faqSchema,
  gallerySchema,
  htmlContentSchema,
  latexSchema,
  mediaFileSchema,
  productCardSchema,
  prosConsSchema,
  stockVideoSchema,
  verdictSchema,
} from 'schemas/blockContent'
import categoryType from 'schemas/category'
import commentType from 'schemas/comment'
import contactMessageType from 'schemas/contactMessage'
import navigationType from 'schemas/navigation'
import newsletterType from 'schemas/newsletter'
import pageType from 'schemas/page'
import postType from 'schemas/post'
import productType from 'schemas/product'
import seriesType from 'schemas/series'
import settingsType from 'schemas/settings'
import tagType from 'schemas/tag'

const title = process.env.NEXT_PUBLIC_SANITY_PROJECT_TITLE || 'Apple Magic Blog'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  title,
  schema: {
    // All content types for the Apple Magic Blog
    types: [
      // Documents
      postType,
      authorType,
      authorReviewType,
      categoryType,
      tagType,
      productType,
      seriesType,
      pageType,
      navigationType,
      commentType,
      contactMessageType,
      newsletterType,
      settingsType,

      // Rich content building blocks (objects + array block type)
      blockContentType,
      calloutSchema,
      prosConsSchema,
      verdictSchema,
      comparisonTableSchema,
      productCardSchema,
      affiliateCtaSchema,
      codeBlockSchema,
      embedSchema,
      gallerySchema,
      htmlContentSchema,
      stockVideoSchema,
      latexSchema,
      mediaFileSchema,
      faqSchema,
      articleSidebarSlideType,
    ],
  },
  plugins: [
    structureTool({
      structure: settingsStructure(settingsType),
      // `defaultDocumentNode` is responsible for adding a “Preview” tab to the document pane
      defaultDocumentNode: previewDocumentNode(),
    }),
    presentationTool({
      previewUrl: { previewMode: { enable: PREVIEW_MODE_ROUTE } },
      resolve: {
        locations: locate,
      },
    }),
    // Configures the global "new document" button, and document actions, to suit the Settings document singleton
    settingsPlugin({ type: settingsType.name }),
    // Add an image asset source for Unsplash
    unsplashImageAsset(),
    {
      name: 'stock-image-asset-sources',
      form: {
        image: {
          assetSources: (prev) => [...prev, ...stockImageAssetSources],
        },
      },
    },
    // Vision lets you query your content with GROQ in the studio
    // https://www.sanity.io/docs/the-vision-plugin
    process.env.NODE_ENV !== 'production' &&
      visionTool({ defaultApiVersion: apiVersion }),
  ],
})
