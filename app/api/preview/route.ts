import { defineEnableDraftMode } from 'next-sanity/draft-mode'

import { readToken } from '@/lib/sanity.api'
import { getClient } from '@/lib/sanity.client'

/**
 * Enables Next.js draft mode for Sanity Presentation.
 *
 * The official helper validates the preview secret, preserves the selected
 * Sanity perspective in a secure cookie, enables draft mode, and redirects to
 * the requested preview pathname.
 */
const client = getClient().withConfig({
  token: readToken,
  useCdn: false,
  stega: false,
})

export const { GET } = defineEnableDraftMode({ client })
