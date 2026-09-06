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

const targets = [
  {
    id: 'product-iphone-17',
    page: 'https://www.apple.com/iphone-17/',
    images: [
      'https://www.apple.com/v/iphone-17/h/images/meta/iphone-17_overview__cg0rlzmbhl7m_og.png',
      'https://www.apple.com/v/iphone-17/h/images/site/localnav/nav_iphone_17__dl8vkomvgzwy_large_2x.png',
    ],
  },
  {
    id: 'product-macbook-air-m5',
    page: 'https://www.apple.com/macbook-air/',
    images: [
      'https://www.apple.com/v/macbook-air/z/images/meta/macbook_air_mx__ez5y0k5yy7au_og.png',
    ],
  },
]

for (const target of targets) {
  const assets = []
  for (const [index, url] of target.images.entries()) {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Failed to fetch ${url}`)
    const asset = await client.assets.upload(
      'image',
      Buffer.from(await response.arrayBuffer()),
      {
        filename: `${target.id}-official-${index + 1}.png`,
        source: { id: url, name: 'Apple official product page', url },
      },
    )
    assets.push({ asset, url })
  }
  const gallery = assets.map(({ asset, url }, index) => ({
    _key: `${target.id}-official-gallery-${index + 1}`,
    _type: 'object',
    image: {
      _type: 'image',
      asset: { _type: 'reference', _ref: asset._id },
    },
    alt: `${target.id.replace('product-', '').replaceAll('-', ' ')} official product image`,
    caption:
      index === 0 ? 'Official product overview' : 'Official product detail',
    captionFr:
      index === 0 ? 'Vue officielle du produit' : 'Détail officiel du produit',
    description:
      'Apple-hosted product imagery, stored in Sanity for reliable delivery.',
    descriptionFr:
      'Image produit hébergée par Apple et stockée dans Sanity pour une diffusion fiable.',
    sourceUrl: url,
  }))
  await client
    .patch(target.id)
    .set({
      images: gallery.map((item, index) => ({
        ...item.image,
        _key: `${target.id}-primary-${index + 1}`,
        alt: item.alt,
      })),
      gallery,
      videoUrl: target.page,
      officialUrl: target.page,
      imageSource: target.page,
    })
    .commit()
  console.log(`Seeded official media for ${target.id}`)
}
