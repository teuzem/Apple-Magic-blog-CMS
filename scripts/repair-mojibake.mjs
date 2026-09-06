import fs from 'node:fs'
import path from 'node:path'

import { createClient } from '@sanity/client'

const root = process.cwd()
const write = process.argv.includes('--write')
const repairSanity = process.argv.includes('--sanity')

const textExtensions = new Set([
  '.css',
  '.html',
  '.js',
  '.jsx',
  '.json',
  '.md',
  '.mjs',
  '.ts',
  '.tsx',
])
const ignoredDirectories = new Set([
  '.git',
  '.next',
  '.next-dev',
  '.sanity',
  'node_modules',
  'public',
])
const ignoredFiles = new Set(['package-lock.json'])

const windows1252 = new Map([
  ['€', 0x80],
  ['‚', 0x82],
  ['ƒ', 0x83],
  ['„', 0x84],
  ['…', 0x85],
  ['†', 0x86],
  ['‡', 0x87],
  ['ˆ', 0x88],
  ['‰', 0x89],
  ['Š', 0x8a],
  ['‹', 0x8b],
  ['Œ', 0x8c],
  ['Ž', 0x8e],
  ['‘', 0x91],
  ['’', 0x92],
  ['“', 0x93],
  ['”', 0x94],
  ['•', 0x95],
  ['–', 0x96],
  ['—', 0x97],
  ['˜', 0x98],
  ['™', 0x99],
  ['š', 0x9a],
  ['›', 0x9b],
  ['œ', 0x9c],
  ['ž', 0x9e],
  ['Ÿ', 0x9f],
])

const suspicious =
  /(?:Ã.|Â.|â(?:€|€™|€œ|€œ|€|€“|€”|€¦|€¢|„¢|„¢|ˆ’)|ðŸ|ï¿½|�)/gu
const decoder = new TextDecoder('utf-8', { fatal: true })
const extendedCharacterRun =
  /[\u0080-\u00ff\u0152\u0153\u0160\u0161\u0178\u017d\u017e\u0192\u02c6\u02dc\u2013-\u203a\u20ac\u2122]+/gu

function corruptionScore(value) {
  const matches = value.match(suspicious)?.length ?? 0
  const replacementCharacters = (value.match(/�/g) ?? []).length
  return matches * 10 + replacementCharacters * 100
}

function encodeWindows1252(value) {
  const bytes = []
  for (const character of value) {
    const codePoint = character.codePointAt(0)
    if (codePoint <= 0xff) {
      bytes.push(codePoint)
      continue
    }
    const mapped = windows1252.get(character)
    if (mapped === undefined) return null
    bytes.push(mapped)
  }
  return Uint8Array.from(bytes)
}

export function repairText(value) {
  if (typeof value !== 'string' || corruptionScore(value) === 0) return value

  let current = value
  for (let pass = 0; pass < 3; pass += 1) {
    const candidate = current.replace(extendedCharacterRun, (segment) => {
      const bytes = encodeWindows1252(segment)
      if (!bytes) return segment
      try {
        return decoder.decode(bytes)
      } catch {
        return segment
      }
    })
    if (corruptionScore(candidate) >= corruptionScore(current)) break
    current = candidate
  }
  return current.normalize('NFC')
}

function collectFiles(directory, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue
    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      collectFiles(absolutePath, files)
      continue
    }
    if (
      entry.isFile() &&
      textExtensions.has(path.extname(entry.name)) &&
      !ignoredFiles.has(entry.name)
    ) {
      files.push(absolutePath)
    }
  }
  return files
}

function repairRepository() {
  const changes = []
  for (const file of collectFiles(root)) {
    const before = fs.readFileSync(file, 'utf8')
    const after = repairText(before)
    if (after === before) continue

    const relativePath = path.relative(root, file)
    changes.push({
      file: relativePath,
      before: corruptionScore(before),
      after: corruptionScore(after),
    })
    if (write) fs.writeFileSync(file, after, 'utf8')
  }

  console.log(
    JSON.stringify(
      {
        mode: write ? 'write' : 'dry-run',
        filesScanned: collectFiles(root).length,
        filesChanged: changes.length,
        changes,
      },
      null,
      2,
    ),
  )
}

function readEnvFile() {
  const envPath = path.join(root, '.env.local')
  if (!fs.existsSync(envPath)) return {}
  return Object.fromEntries(
    fs
      .readFileSync(envPath, 'utf8')
      .split(/\r?\n/)
      .filter((line) => line && !line.trimStart().startsWith('#'))
      .map((line) => {
        const separator = line.indexOf('=')
        if (separator < 0) return [line, '']
        const name = line.slice(0, separator)
        const value = line
          .slice(separator + 1)
          .trim()
          .replace(/^(['"])(.*)\1$/, '$2')
        return [name, value]
      }),
  )
}

function repairValue(value, currentPath, findings) {
  if (typeof value === 'string') {
    const repaired = repairText(value)
    if (repaired !== value) {
      findings.push({
        path: currentPath,
        before: value.slice(0, 100),
        after: repaired.slice(0, 100),
      })
      return { changed: true, value: repaired }
    }
    return { changed: false, value }
  }

  if (Array.isArray(value)) {
    let changed = false
    const repaired = value.map((item, index) => {
      const result = repairValue(item, `${currentPath}[${index}]`, findings)
      changed ||= result.changed
      return result.value
    })
    return { changed, value: changed ? repaired : value }
  }

  if (!value || typeof value !== 'object') {
    return { changed: false, value }
  }

  let changed = false
  const repaired = { ...value }
  for (const [field, child] of Object.entries(value)) {
    if (field.startsWith('_')) continue
    const result = repairValue(
      child,
      currentPath ? `${currentPath}.${field}` : field,
      findings,
    )
    if (result.changed) {
      repaired[field] = result.value
      changed = true
    }
  }
  return { changed, value: changed ? repaired : value }
}

async function repairSanityDataset() {
  const env = { ...readEnvFile(), ...process.env }
  const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = env.NEXT_PUBLIC_SANITY_DATASET || 'production'
  const token = env.SANITY_API_WRITE_TOKEN
  if (!projectId) throw new Error('NEXT_PUBLIC_SANITY_PROJECT_ID is missing.')
  if (write && !token) throw new Error('SANITY_API_WRITE_TOKEN is missing.')

  const client = createClient({
    projectId,
    dataset,
    apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-09-03',
    token,
    perspective: 'raw',
    useCdn: false,
  })
  const documents = await client.fetch(
    '*[!(_type match "sanity.*") && !(_type match "system.*")]{...}',
    {},
    { perspective: 'raw' },
  )
  const changes = []

  for (const document of documents) {
    const set = {}
    const findings = []
    for (const [field, value] of Object.entries(document)) {
      if (field.startsWith('_')) continue
      const result = repairValue(value, field, findings)
      if (result.changed) set[field] = result.value
    }
    if (Object.keys(set).length) {
      changes.push({
        id: document._id,
        type: document._type,
        set,
        findings,
      })
    }
  }

  console.log(
    JSON.stringify(
      {
        mode: write ? 'write' : 'dry-run',
        documentsScanned: documents.length,
        documentsChanged: changes.length,
        fieldsChanged: changes.reduce(
          (total, change) => total + change.findings.length,
          0,
        ),
        changes: changes.map(({ id, type, findings }) => ({
          id,
          type,
          findings: findings.slice(0, 20),
        })),
      },
      null,
      2,
    ),
  )

  if (!write || !changes.length) return

  for (let index = 0; index < changes.length; index += 50) {
    const transaction = client.transaction()
    for (const change of changes.slice(index, index + 50)) {
      transaction.patch(change.id, { set: change.set })
    }
    await transaction.commit({ visibility: 'sync' })
  }
  console.log(`Repaired ${changes.length} Sanity documents.`)
}

repairRepository()
if (repairSanity) await repairSanityDataset()
