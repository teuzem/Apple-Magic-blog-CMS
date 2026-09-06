'use client'

import { htmlToBlocks } from '@portabletext/block-tools'
import { Button, Card, Flex, Stack, Text, TextArea } from '@sanity/ui'
import { forwardRef, useState } from 'react'
import type { PortableTextInputProps } from 'sanity'
import { set } from 'sanity'

const HTML_PLACEHOLDER = `<h2>Section heading</h2>
<p>Paste a complete HTML article here. Formatting, links, lists and tables are converted into editable content.</p>`

const HtmlImportInput = forwardRef(function HtmlImportInput(
  props: PortableTextInputProps,
  ref,
) {
  const [html, setHtml] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')

  const importHtml = (mode: 'append' | 'replace') => {
    if (!html.trim()) {
      setMessage('Paste HTML before importing.')
      return
    }

    try {
      const blocks = htmlToBlocks(html, props.schemaType, {
        parseHtml: (source) =>
          new DOMParser().parseFromString(source, 'text/html'),
      })

      if (!blocks.length) {
        setMessage('No supported article content was found in this HTML.')
        return
      }

      const nextValue =
        mode === 'append' ? [...(props.value || []), ...blocks] : blocks
      props.onChange(set(nextValue))
      setHtml('')
      setMessage(
        `${blocks.length} content block${blocks.length === 1 ? '' : 's'} imported.`,
      )
    } catch (error) {
      setMessage(
        error instanceof Error
          ? `HTML import failed: ${error.message}`
          : 'HTML import failed.',
      )
    }
  }

  const insertHtmlSection = () => {
    if (!html.trim()) {
      setMessage('Paste HTML before inserting.')
      return
    }
    const block = {
      _type: 'htmlContent',
      _key: crypto.randomUUID(),
      html: html.trim(),
    }
    props.onChange(set([...(props.value || []), block]))
    setHtml('')
    setMessage('HTML section inserted with media and embeds preserved.')
  }

  return (
    <Stack space={3}>
      <Card padding={3} radius={2} border tone="primary">
        <Stack space={3}>
          <Flex align="center" justify="space-between" gap={3}>
            <Stack space={2}>
              <Text size={1} weight="semibold">
                Fast HTML publishing
              </Text>
              <Text size={1} muted>
                Convert a complete HTML article into editable Studio content.
              </Text>
            </Stack>
            <Button
              fontSize={1}
              mode="ghost"
              onClick={() => setIsOpen((current) => !current)}
              text={isOpen ? 'Close importer' : 'Import HTML'}
            />
          </Flex>

          {isOpen && (
            <Stack space={3}>
              <TextArea
                onChange={(event) => {
                  setHtml(event.currentTarget.value)
                  setMessage('')
                }}
                padding={3}
                placeholder={HTML_PLACEHOLDER}
                rows={12}
                value={html}
              />
              <Flex gap={2} wrap="wrap">
                <Button
                  disabled={props.readOnly}
                  fontSize={1}
                  onClick={() => importHtml('replace')}
                  text="Replace content"
                  tone="primary"
                />
                <Button
                  disabled={props.readOnly}
                  fontSize={1}
                  mode="ghost"
                  onClick={() => importHtml('append')}
                  text="Append to content"
                />
                <Button
                  disabled={props.readOnly}
                  fontSize={1}
                  mode="ghost"
                  onClick={insertHtmlSection}
                  text="Insert rich HTML section"
                  title="Preserve supported video, audio, iframe, table, code and media HTML"
                />
              </Flex>
              {message && (
                <Card
                  padding={2}
                  radius={2}
                  tone={message.includes('failed') ? 'critical' : 'positive'}
                >
                  <Text size={1}>{message}</Text>
                </Card>
              )}
            </Stack>
          )}
        </Stack>
      </Card>
      {props.renderDefault({ ...props, ref } as PortableTextInputProps)}
    </Stack>
  )
})

HtmlImportInput.displayName = 'HtmlImportInput'

export default HtmlImportInput
