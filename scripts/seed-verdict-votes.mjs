import fs from 'node:fs'
import { createClient } from '@sanity/client'

const env = fs.readFileSync('.env.local', 'utf8')
const get = (key) =>
  env.match(new RegExp(`^${key}=(.*)$`, 'm'))?.[1]?.replace(/^"|"$/g, '') || ''

const client = createClient({
  projectId: get('NEXT_PUBLIC_SANITY_PROJECT_ID'),
  dataset: get('NEXT_PUBLIC_SANITY_DATASET'),
  apiVersion: get('NEXT_PUBLIC_SANITY_API_VERSION') || '2026-09-03',
  token: get('SANITY_API_WRITE_TOKEN'),
  useCdn: false,
})

const posts = await client.fetch(
  '*[_type == "post" && defined(content)]{_id, content[]{_type, rating}}',
)

for (const post of posts) {
  const verdict = (post.content || []).find(
    (block) => block?._type === 'verdict' && typeof block.rating === 'number',
  )
  if (!verdict) continue
  const count = 24
  const total = Math.round(verdict.rating * 2 * count) / 2
  await client
    .patch(post._id)
    .set({ verdictVoteTotal: total, verdictVoteCount: count })
    .commit()
  console.log(`${post._id}: ${total}/${count}`)
}
