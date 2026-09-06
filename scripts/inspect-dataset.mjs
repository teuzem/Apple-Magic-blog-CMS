// Inspect the current Sanity dataset state (categories, posts, authors, etc.)
import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const p = process.argv[2] || process.cwd()
const root = p
const env = readFileSync(resolve(root, '.env.local'), 'utf8')
const get = (k) => {
  const m = env.match(new RegExp('^' + k + '=(.*)$', 'm'))
  return m ? m[1].replace(/^"|"$/g, '') : ''
}

const projectId = get('NEXT_PUBLIC_SANITY_PROJECT_ID')
const dataset = get('NEXT_PUBLIC_SANITY_DATASET')
const token = get('SANITY_API_READ_TOKEN')

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2026-09-03',
  token,
  useCdn: false,
})

const types = [
  'category',
  'post',
  'author',
  'tag',
  'product',
  'series',
  'page',
  'navigation',
  'settings',
]
console.log('COUNTS:')
for (const type of types) {
  const n = await client.fetch(`count(*[_type=="${type}"])`)
  console.log(`  ${type}: ${n}`)
}

const cats = await client.fetch(
  '*[_type=="category"]{title, "slug": slug.current}[0..40]',
)
console.log('CATEGORIES:', JSON.stringify(cats, null, 2))

const authors = await client.fetch(
  '*[_type=="author"]{name, "slug": slug.current}[0..20]',
)
console.log('AUTHORS:', JSON.stringify(authors, null, 2))

const tags = await client.fetch(
  '*[_type=="tag"]{title, "slug": slug.current}[0..30]',
)
console.log('TAGS:', JSON.stringify(tags, null, 2))

const posts = await client.fetch(
  '*[_type=="post"]{title, "slug": slug.current}[0..30]',
)
console.log('POSTS:', JSON.stringify(posts, null, 2))

const settings = await client.fetch('*[_type=="settings"][0]')
console.log('SETTINGS present:', !!settings)
