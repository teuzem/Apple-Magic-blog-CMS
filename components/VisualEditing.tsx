'use client'

import dynamic from 'next/dynamic'
import type { VisualEditingProps } from 'next-sanity/visual-editing/client-component'

const NextSanityVisualEditing = dynamic(() =>
  import('next-sanity/visual-editing/client-component').then((m) => m.default),
)

/**
 * Mounts Sanity Visual Editing for next-sanity.
 *
 * This is mounted globally because Presentation initially loads a normal URL
 * before the draft-mode redirect completes. The client component detects the
 * Presentation environment and otherwise remains inactive.
 */
export function VisualEditing(props: VisualEditingProps) {
  return <NextSanityVisualEditing {...props} />
}
