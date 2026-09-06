'use client'

import { SearchIcon } from '@sanity/icons'
import type { AssetFromSource, AssetSourceComponentProps } from '@sanity/types'
import {
  Button,
  Card,
  Dialog,
  Flex,
  Grid,
  Spinner,
  Stack,
  Text,
  TextInput,
} from '@sanity/ui'
import { useEffect, useState } from 'react'
import { useClient } from 'sanity'

type StockImage = {
  id: string
  provider: 'Pexels' | 'Pixabay'
  sourceId: string
  sourceUrl: string
  photographer?: string
  thumbnailUrl: string
  downloadUrl: string
  width?: number
  height?: number
  alt: string
}

export default function StockImageAssetSource(
  props: AssetSourceComponentProps,
) {
  const client = useClient({ apiVersion: '2026-09-04' })
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<StockImage[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true)
      setMessage('')
      try {
        const response = await fetch(
          `/api/stock-images?q=${encodeURIComponent(query.trim())}`,
          { signal: controller.signal },
        )
        const data = await response.json()
        setResults(data.results || [])
        if (!data.providers?.pexels && !data.providers?.pixabay) {
          setMessage(
            'Add PEXELS_API_KEY or PIXABAY_API_KEY to enable online image search.',
          )
        } else if (!(data.results || []).length) {
          setMessage('No images found. Try a broader search.')
        }
      } catch {
        if (!controller.signal.aborted)
          setMessage('Image search is unavailable right now.')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 350)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  const selectImage = async (image: StockImage) => {
    const asset: AssetFromSource = {
      kind: 'url',
      value: image.downloadUrl,
      assetDocumentProps: {
        _type: 'sanity.imageAsset',
        source: {
          name: image.provider,
          id: image.sourceId,
          url: image.sourceUrl,
        },
        description: image.alt,
        creditLine: `${image.photographer || 'Contributor'} via ${image.provider}`,
      } as any,
    }
    props.onSelect([asset])
    props.onClose()
    void client
  }

  return (
    <Dialog
      header="Search Pexels and Pixabay"
      id="stock-image-source"
      onClose={props.onClose}
      open
      width={4}
    >
      <Stack padding={4} space={3}>
        <TextInput
          autoFocus
          icon={SearchIcon}
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder="Search editorial images..."
          value={query}
        />
        {loading && (
          <Flex align="center" justify="center" padding={4}>
            <Spinner muted />
          </Flex>
        )}
        {message && (
          <Card padding={3} radius={2} tone="caution">
            <Text size={1}>{message}</Text>
          </Card>
        )}
        <Grid columns={[1, 2, 3]} gap={2}>
          {results.map((image) => (
            <button
              key={image.id}
              type="button"
              onClick={() => void selectImage(image)}
              style={{
                border: 0,
                padding: 0,
                background: 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              title={`Use image by ${image.photographer || 'contributor'} via ${image.provider}`}
            >
              <Card radius={2} shadow={1} overflow="hidden">
                {/* Dynamic Studio thumbnails stay outside the public image pipeline. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.thumbnailUrl}
                  alt={image.alt}
                  loading="lazy"
                  style={{
                    display: 'block',
                    width: '100%',
                    aspectRatio: '4 / 3',
                    objectFit: 'cover',
                  }}
                />
                <Text muted size={1} style={{ display: 'block', padding: 8 }}>
                  {image.provider} · {image.photographer || 'Contributor'}
                </Text>
              </Card>
            </button>
          ))}
        </Grid>
        <Flex justify="flex-end">
          <Button mode="ghost" onClick={props.onClose} text="Close" />
        </Flex>
      </Stack>
    </Dialog>
  )
}
