/**
 * Non-destructive global SEO and publisher settings seed.
 * Existing editorial values are preserved with setIfMissing.
 */
import fs from 'node:fs'

import { createClient } from '@sanity/client'

const env = fs.readFileSync('.env.local', 'utf8')
const get = (name) =>
  env.match(new RegExp(`^${name}=(.*)$`, 'm'))?.[1]?.replace(/^"|"$/g, '') || ''

const client = createClient({
  projectId: get('NEXT_PUBLIC_SANITY_PROJECT_ID'),
  dataset: get('NEXT_PUBLIC_SANITY_DATASET') || 'production',
  apiVersion: get('NEXT_PUBLIC_SANITY_API_VERSION') || '2026-09-05',
  token: get('SANITY_API_WRITE_TOKEN'),
  useCdn: false,
})

await client.createIfNotExists({
  _id: 'settings',
  _type: 'settings',
  title: 'Apple Magic Blog',
})

await client
  .patch('settings')
  .setIfMissing({
    seoDefaults: {},
    'seoDefaults.titleSuffix': ' — Apple Magic Blog',
    'seoDefaults.organizationName': 'Apple Magic Blog',
    'seoDefaults.legalName': 'Apple Magic Blog',
    'seoDefaults.description':
      'Independent Apple news, in-depth reviews, buying guides and practical analysis for readers across Africa.',
    'seoDefaults.descriptionFr':
      'Actualités Apple indépendantes, tests approfondis, guides d’achat et analyses pratiques pour les lecteurs en Afrique.',
    'seoDefaults.newsPublicationName': 'Apple Magic Blog',
    'seoDefaults.enableNewsSitemap': true,
    'seoDefaults.email': 'hello@applemagic.blog',
    'seoDefaults.address': {
      addressLocality: 'Douala',
      addressCountry: 'CM',
    },
    'seoDefaults.twitterHandle': '@applemagicblog',
    'seoDefaults.defaultKeywords': [
      'Apple news',
      'iPhone',
      'Mac',
      'iPad',
      'Apple Watch',
      'AirPods',
      'Apple Africa',
      'technology reviews',
      'buying guides',
    ],
  })
  .commit({ visibility: 'sync' })

console.log(
  'Global bilingual SEO and publisher defaults are ready in settings.',
)
