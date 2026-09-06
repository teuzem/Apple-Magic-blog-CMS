'use client'

import { Check, Copy, FileCode } from 'lucide-react'
import { useState } from 'react'

interface CodeBlockProps {
  block: {
    language?: string
    filename?: string
    code?: string
  }
  locale?: string
}

export default function CodeBlock({ block, locale = 'en' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const code = block.code || ''
  const highlighted = parseHighlightedLines((block as any).highlightLines)
  const lines = code.split('\n')

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (error) {
      // clipboard unavailable
    }
  }

  return (
    <div className="my-8 min-w-0 max-w-full overflow-hidden rounded-lg border border-gray-2 bg-gray-1 dark:bg-black">
      <div className="flex min-w-0 items-center justify-between gap-2 border-b border-gray-2 px-4 py-2.5 dark:border-gray-2">
        <span className="inline-flex min-w-0 items-center gap-2 truncate text-[0.8125rem] font-medium text-gray-4">
          <FileCode size={14} />
          {block.filename || block.language || 'code'}
        </span>
        <button
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[0.8125rem] text-gray-4 transition-colors hover:bg-gray-7 hover:text-ink dark:hover:bg-gray-2 dark:hover:text-white"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre
        className={`max-w-full overflow-x-auto overscroll-x-contain p-4 text-[0.8125rem] leading-relaxed text-gray-8 dark:text-gray-8 ${
          (block as any).wrapLines ? 'whitespace-pre-wrap break-words' : ''
        }`}
      >
        <code className={block.language ? `language-${block.language}` : ''}>
          {lines.map((line, index) => (
            <span
              key={index}
              data-line={index + 1}
              className={`block min-w-max ${
                (block as any).showLineNumbers !== false
                  ? 'before:mr-4 before:inline-block before:w-7 before:text-right before:text-gray-3 before:content-[attr(data-line)]'
                  : ''
              } ${
                highlighted.has(index + 1)
                  ? '-mx-4 border-l-2 border-apple-blue bg-apple-blue/15 px-[14px]'
                  : ''
              }`}
            >
              {line || ' '}
            </span>
          ))}
        </code>
      </pre>
      {(locale === 'fr'
        ? (block as any).captionFr || (block as any).caption
        : (block as any).caption || (block as any).captionFr) && (
        <p className="border-t border-gray-2 px-4 py-2 text-center text-xs text-gray-4">
          {locale === 'fr'
            ? (block as any).captionFr || (block as any).caption
            : (block as any).caption || (block as any).captionFr}
        </p>
      )}
    </div>
  )
}

function parseHighlightedLines(value?: string) {
  const result = new Set<number>()
  for (const part of String(value || '').split(',')) {
    const [start, end] = part.trim().split('-').map(Number)
    if (!Number.isFinite(start)) continue
    const finalLine = Number.isFinite(end) ? end : start
    for (let line = start; line <= finalLine; line++) result.add(line)
  }
  return result
}
