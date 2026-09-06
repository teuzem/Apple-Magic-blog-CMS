export const useCdn = false

/**
 * As this file is reused in several other files, try to keep it lean and small.
 * Importing other npm packages here could lead to needlessly increasing the client bundle size, or end up in a server-only function that don't need it.
 */

// These credentials are populated via environment variables. When they are
// missing (e.g. during a fresh checkout), the site still builds and runs with
// empty/placeholder values so that safe fallbacks can kick in. Connect your
// Sanity project via .env.local to go live.
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''

export const readToken = process.env.SANITY_API_READ_TOKEN || ''

// see https://www.sanity.io/docs/api-versioning for how versioning works
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-08-07'

// Used to generate URLs for previewing your content
export const PREVIEW_MODE_ROUTE = '/api/preview'

/**
 * Used to configure edit intent links, for Presentation Mode, as well as to configure where the Studio is mounted in the router.
 */
export const studioUrl = '/studio'

/**
 * Whether the Sanity project credentials are configured.
 * Used to gracefully degrade when no dataset is attached yet.
 */
export const isConfigured = Boolean(projectId)
