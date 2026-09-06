import crypto from 'node:crypto'
import fs from 'node:fs'

import { createClient } from '@sanity/client'

const env = fs.readFileSync('.env.local', 'utf8')
const get = (name) =>
  env.match(new RegExp(`^${name}=(.*)$`, 'm'))?.[1]?.replace(/^"|"$/g, '') || ''

const client = createClient({
  projectId: get('NEXT_PUBLIC_SANITY_PROJECT_ID'),
  dataset: get('NEXT_PUBLIC_SANITY_DATASET'),
  apiVersion: get('NEXT_PUBLIC_SANITY_API_VERSION') || '2026-09-03',
  token: get('SANITY_API_WRITE_TOKEN'),
  perspective: 'raw',
  useCdn: false,
})

const documentTypes = [
  'author',
  'category',
  'comment',
  'contactMessage',
  'navigation',
  'newsletter',
  'page',
  'post',
  'product',
  'series',
  'settings',
  'tag',
]

const stableKey = (documentId, path, index, item, attempt = 0) => {
  const identity =
    item?._ref ||
    item?.asset?._ref ||
    item?.slug?.current ||
    item?.name ||
    item?.title ||
    item?._type ||
    'item'
  return crypto
    .createHash('sha1')
    .update(`${documentId}|${path}|${index}|${identity}|${attempt}`)
    .digest('hex')
    .slice(0, 16)
}

const repairValue = (value, documentId, path, findings) => {
  if (Array.isArray(value)) {
    const usedKeys = new Set()
    let changed = false
    const repaired = value.map((item, index) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        return item
      }

      let nextItem = item
      let key = typeof item._key === 'string' && item._key ? item._key : ''
      if (!key || usedKeys.has(key)) {
        let attempt = 0
        do {
          key = stableKey(documentId, path, index, item, attempt++)
        } while (usedKeys.has(key))
        nextItem = { ...item, _key: key }
        findings.push({
          documentId,
          path: `${path}[${index}]`,
          problem: item._key ? 'duplicate' : 'missing',
          key,
        })
        changed = true
      }
      usedKeys.add(key)

      const nested = repairValue(
        nextItem,
        documentId,
        `${path}[_key=="${key}"]`,
        findings,
      )
      if (nested.changed) {
        nextItem = nested.value
        changed = true
      }
      return nextItem
    })
    return { changed, value: changed ? repaired : value }
  }

  if (!value || typeof value !== 'object') {
    return { changed: false, value }
  }

  let changed = false
  const repaired = { ...value }
  for (const [field, child] of Object.entries(value)) {
    if (field === '_id' || field === '_rev') continue
    const nested = repairValue(
      child,
      documentId,
      path ? `${path}.${field}` : field,
      findings,
    )
    if (nested.changed) {
      repaired[field] = nested.value
      changed = true
    }
  }
  return { changed, value: changed ? repaired : value }
}

const documents = await client.fetch(
  '*[_type in $types]{...}',
  { types: documentTypes },
  { perspective: 'raw' },
)

const findings = []
const mutations = []

for (const document of documents) {
  const set = {}
  for (const [field, value] of Object.entries(document)) {
    if (field.startsWith('_')) continue
    const repaired = repairValue(value, document._id, field, findings)
    if (repaired.changed) set[field] = repaired.value
  }
  if (Object.keys(set).length) {
    mutations.push({ patch: { id: document._id, set } })
  }
}

console.log(
  JSON.stringify(
    {
      documentsScanned: documents.length,
      documentsToRepair: mutations.length,
      issues: findings.length,
      byDocument: Object.groupBy(findings, ({ documentId }) => documentId),
    },
    null,
    2,
  ),
)

if (process.argv.includes('--apply') && mutations.length) {
  const transaction = client.transaction()
  for (const mutation of mutations)
    transaction.patch(mutation.patch.id, mutation.patch)
  await transaction.commit({ visibility: 'sync' })
  console.log(
    `Repaired ${findings.length} array keys in ${mutations.length} documents.`,
  )
} else if (mutations.length) {
  console.log('Dry run only. Re-run with --apply to write these repairs.')
} else {
  console.log('All editable array members have unique keys.')
}
