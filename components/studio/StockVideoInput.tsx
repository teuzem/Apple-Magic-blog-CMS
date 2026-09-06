'use client'

import { SearchIcon } from '@sanity/icons'
import {
  Button,
  Card,
  Flex,
  Grid,
  Spinner,
  Stack,
  Text,
  TextInput,
} from '@sanity/ui'
import { useEffect, useState } from 'react'
import type { ObjectInputProps } from 'sanity'
import { set } from 'sanity'

type VideoResult = {
  id: string
  provider: 'Pexels' | 'Pixabay'
  sourceId: string
  sourceUrl: string
  creator?: string
  thumbnailUrl?: string
  videoUrl: string
  width?: number
  height?: number
  duration?: number
  query?: string
}

export default function StockVideoInput(props: ObjectInputProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<VideoResult[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!open || query.trim().length < 2) {
      setResults([])
      return
    }
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true)
      setMessage('')
      try {
        const response = await fetch(
          `/api/stock-videos?q=${encodeURIComponent(query.trim())}`,
          { signal: controller.signal },
        )
        const data = await response.json()
        setResults(data.results || [])
        if (!data.providers?.pexels && !data.providers?.pixabay)
          setMessage(
            'Add PEXELS_API_KEY or PIXABAY_API_KEY to enable video search.',
          )
        else if (!(data.results || []).length)
          setMessage('No videos found. Try a broader search.')
      } catch {
        if (!controller.signal.aborted)
          setMessage('Video search is unavailable.')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 350)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [open, query])

  function selectVideo(video: VideoResult) {
    props.onChange(
      set({
        ...(props.value || {}),
        _type: props.schemaType.name,
        url: video.videoUrl,
        posterUrl: video.thumbnailUrl,
        provider: video.provider,
        sourceId: video.sourceId,
        sourceUrl: video.sourceUrl,
        creator: video.creator,
        width: video.width,
        height: video.height,
        duration: video.duration,
        searchQuery: video.query || query,
      }),
    )
    setOpen(false)
  }

  return (
    <Stack space={3}>
      <Card border padding={3} radius={2} tone="primary">
        <Stack space={3}>
          <Flex align="center" justify="space-between" gap={3} wrap="wrap">
            <Stack space={2}>
              <Text weight="semibold">Pexels + Pixabay video library</Text>
              <Text muted size={1}>
                Search, preview, and insert an attributed editorial video.
              </Text>
            </Stack>
            <Button
              icon={SearchIcon}
              text={open ? 'Close video search' : 'Search videos'}
              onClick={() => setOpen((value) => !value)}
              tone="primary"
            />
          </Flex>
          {open && (
            <Stack space={3}>
              <TextInput
                autoFocus
                icon={SearchIcon}
                value={query}
                placeholder="Search videos..."
                onChange={(event) => setQuery(event.currentTarget.value)}
              />
              {loading && (
                <Flex justify="center" padding={3}>
                  <Spinner />
                </Flex>
              )}
              {message && (
                <Card padding={3} tone="caution">
                  <Text size={1}>{message}</Text>
                </Card>
              )}
              <Grid columns={[1, 2, 3]} gap={3}>
                {results.map((video) => (
                  <Card key={video.id} border overflow="hidden" radius={2}>
                    <video
                      src={video.videoUrl}
                      poster={video.thumbnailUrl}
                      muted
                      controls
                      preload="metadata"
                      style={{
                        width: '100%',
                        aspectRatio: '16 / 9',
                        objectFit: 'cover',
                      }}
                    />
                    <Stack padding={3} space={2}>
                      <Text size={1} weight="semibold">
                        {video.provider}
                      </Text>
                      <Text size={1} muted>
                        {video.creator || 'Contributor'} · {video.duration || 0}
                        s
                      </Text>
                      <Button
                        text="Use this video"
                        onClick={() => selectVideo(video)}
                        tone="positive"
                      />
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </Stack>
          )}
        </Stack>
      </Card>
      {props.renderDefault(props)}
    </Stack>
  )
}
