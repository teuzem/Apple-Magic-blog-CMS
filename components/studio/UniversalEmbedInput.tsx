'use client'

import { Card, Stack, Text } from '@sanity/ui'
import type { ObjectInputProps } from 'sanity'

import {
  detectEmbedProvider,
  type EmbedProvider,
  getEmbedUrl,
} from '@/lib/embed'

export default function UniversalEmbedInput(props: ObjectInputProps) {
  const value = (props.value || {}) as Record<string, any>
  const url = String(value.url || '')
  const provider = (value.provider || 'auto') as EmbedProvider
  const detected = url ? detectEmbedProvider(url) : null
  const embedUrl = url ? getEmbedUrl(url, provider, 'localhost') : null

  return (
    <Stack space={3}>
      {props.renderDefault(props)}
      {url && (
        <Card
          border
          padding={3}
          radius={2}
          tone={embedUrl ? 'positive' : 'caution'}
        >
          <Stack space={3}>
            <Text size={1} weight="semibold">
              Instant preview · {detected || provider}
            </Text>
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={value.title || value.caption || 'Embed preview'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                style={{
                  width: '100%',
                  aspectRatio: '16 / 9',
                  border: 0,
                  borderRadius: 6,
                }}
              />
            ) : (
              <Text size={1}>
                This URL cannot be previewed. It will render as a safe external
                link.
              </Text>
            )}
          </Stack>
        </Card>
      )}
    </Stack>
  )
}
