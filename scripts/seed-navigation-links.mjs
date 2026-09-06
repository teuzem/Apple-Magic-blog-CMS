/**
 * Adds required bilingual header and footer destinations without replacing
 * the navigation document or removing editor-managed links.
 */
import crypto from 'node:crypto'
import fs from 'node:fs'

import { createClient } from '@sanity/client'

const env = fs.readFileSync('.env.local', 'utf8')
const get = (name) =>
  env.match(new RegExp(`^${name}=(.*)$`, 'm'))?.[1]?.replace(/^"|"$/g, '') || ''

const client = createClient({
  projectId: get('NEXT_PUBLIC_SANITY_PROJECT_ID'),
  dataset: get('NEXT_PUBLIC_SANITY_DATASET') || 'production',
  apiVersion: get('NEXT_PUBLIC_SANITY_API_VERSION') || '2026-09-06',
  token: get('SANITY_API_WRITE_TOKEN'),
  useCdn: false,
})

if (!client.config().projectId || !get('SANITY_API_WRITE_TOKEN')) {
  throw new Error(
    'Sanity project ID and write token are required in .env.local.',
  )
}

const key = () => crypto.randomUUID().replaceAll('-', '').slice(0, 16)

const requiredItems = [
  { label: 'Blog', labelFr: 'Blog', url: '/posts' },
  { label: 'Categories', labelFr: 'Catégories', url: '/categories' },
]

const footerDefaults = [
  {
    heading: 'Explore',
    headingFr: 'Explorer',
    links: [
      { label: 'Blog', labelFr: 'Blog', url: '/posts' },
      { label: 'Categories', labelFr: 'Catégories', url: '/categories' },
      { label: 'News', labelFr: 'Actualités', url: '/categories/news' },
      { label: 'Reviews', labelFr: 'Tests', url: '/categories/reviews' },
      {
        label: 'Buying Guides',
        labelFr: 'Guides d’achat',
        url: '/categories/buying-guides',
      },
      {
        label: 'Comparisons',
        labelFr: 'Comparatifs',
        url: '/categories/comparisons',
      },
    ],
  },
  {
    heading: 'Resources',
    headingFr: 'Ressources',
    links: [
      { label: 'Products', labelFr: 'Produits', url: '/products' },
      { label: 'Search', labelFr: 'Recherche', url: '/search' },
      { label: 'Authors', labelFr: 'Auteurs', url: '/authors' },
      { label: 'Topics', labelFr: 'Sujets', url: '/tags' },
      {
        label: 'Newsletter',
        labelFr: 'Newsletter',
        url: '/about#newsletter',
      },
    ],
  },
  {
    heading: 'Support',
    headingFr: 'Assistance',
    links: [
      { label: 'About us', labelFr: 'À propos', url: '/about' },
      { label: 'Contact us', labelFr: 'Nous contacter', url: '/pages/contact' },
      {
        label: 'Editorial policy',
        labelFr: 'Politique éditoriale',
        url: '/pages/editorial-policy',
      },
      {
        label: 'Transparency',
        labelFr: 'Transparence',
        url: '/pages/transparency',
      },
    ],
  },
  {
    heading: 'Legal',
    headingFr: 'Informations légales',
    links: [
      {
        label: 'Privacy policy',
        labelFr: 'Confidentialité',
        url: '/pages/privacy',
      },
      {
        label: 'Terms of use',
        labelFr: 'Conditions d’utilisation',
        url: '/pages/terms',
      },
    ],
  },
]

const localizedByUrl = new Map(
  footerDefaults.flatMap((group) =>
    group.links.map((link) => [link.url, link]),
  ),
)
const headings = new Map(
  footerDefaults.map((group) => [group.heading.toLowerCase(), group.headingFr]),
)

let navigation = await client.fetch(
  '*[_type == "navigation"] | order(_updatedAt desc)[0]{...}',
)

if (!navigation) {
  navigation = await client.create({
    _id: 'navigation',
    _type: 'navigation',
    title: 'Main navigation',
    items: [],
    footer: [],
  })
}

const existingItems = (navigation.items || []).map((item) => {
  const localized = requiredItems.find((required) => required.url === item.url)
  return {
    ...item,
    _key: item._key || key(),
    ...(localized && !item.labelFr ? { labelFr: localized.labelFr } : {}),
    children: (item.children || []).map((child) => ({
      ...child,
      _key: child._key || key(),
    })),
  }
})
const existingItemUrls = new Set(existingItems.map((item) => item.url))
const missingItems = requiredItems
  .filter((item) => !existingItemUrls.has(item.url))
  .map((item) => ({ _key: key(), ...item }))
const items = [...missingItems, ...existingItems]

const footer = (navigation.footer || []).map((group) => ({
  ...group,
  _key: group._key || key(),
  headingFr:
    group.headingFr ||
    headings.get(String(group.heading || '').toLowerCase()) ||
    group.heading,
  links: (group.links || []).map((link) => {
    const localized = localizedByUrl.get(link.url)
    return {
      ...link,
      _key: link._key || key(),
      ...(localized && !link.labelFr ? { labelFr: localized.labelFr } : {}),
    }
  }),
}))

for (const [index, defaultGroup] of footerDefaults.entries()) {
  if (!footer[index]) {
    footer[index] = {
      _key: key(),
      heading: defaultGroup.heading,
      headingFr: defaultGroup.headingFr,
      links: defaultGroup.links.map((link) => ({ _key: key(), ...link })),
    }
    continue
  }
  const existingUrls = new Set(footer[index].links.map((link) => link.url))
  footer[index].links.push(
    ...defaultGroup.links
      .filter((link) => !existingUrls.has(link.url))
      .map((link) => ({ _key: key(), ...link })),
  )
}

await client
  .patch(navigation._id)
  .set({ items, footer })
  .commit({ visibility: 'sync' })

console.log(
  JSON.stringify(
    {
      navigationId: navigation._id,
      headerItems: items.length,
      headerItemsAdded: missingItems.map((item) => item.url),
      footerGroups: footer.length,
      footerLinks: footer.reduce(
        (total, group) => total + group.links.length,
        0,
      ),
    },
    null,
    2,
  ),
)
