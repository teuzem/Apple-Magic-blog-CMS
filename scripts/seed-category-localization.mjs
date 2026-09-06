/**
 * Adds bilingual category copy and SEO defaults without replacing categories
 * or overwriting values already entered in Sanity Studio.
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

if (!client.config().projectId || !get('SANITY_API_WRITE_TOKEN')) {
  throw new Error(
    'Sanity project ID and write token are required in .env.local.',
  )
}

const categories = {
  accessories: {
    titleFr: 'Accessoires',
    description:
      'Cases, chargers, keyboards, hubs and practical accessories tested for the Apple devices you use every day.',
    descriptionFr:
      'Coques, chargeurs, claviers, hubs et accessoires pratiques testés pour les appareils Apple utilisés au quotidien.',
  },
  airpods: {
    titleFr: 'AirPods',
    description:
      'AirPods news, reviews, comparisons, audio features and buying advice for every budget.',
    descriptionFr:
      'Actualités, tests, comparatifs, fonctions audio et conseils d’achat AirPods pour tous les budgets.',
  },
  'apple-intelligence': {
    titleFr: 'Apple Intelligence',
    description:
      'Clear coverage of Apple Intelligence availability, privacy, supported devices, languages and useful features.',
    descriptionFr:
      'Une couverture claire de la disponibilité, de la confidentialité, des appareils, langues et fonctions Apple Intelligence.',
  },
  'apple-watch': {
    titleFr: 'Apple Watch',
    description:
      'Apple Watch reviews, health features, fitness testing, watchOS guides and model comparisons.',
    descriptionFr:
      'Tests Apple Watch, fonctions de santé, essais sportifs, guides watchOS et comparatifs de modèles.',
  },
  'buying-guides': {
    titleFr: 'Guides d’achat',
    description:
      'Evidence-based Apple buying guides with regional pricing, long-term value and clear recommendations.',
    descriptionFr:
      'Guides d’achat Apple fondés sur les faits, avec prix régionaux, valeur à long terme et recommandations claires.',
  },
  comparisons: {
    titleFr: 'Comparatifs',
    description:
      'Direct Apple product comparisons covering performance, cameras, battery, software support and total cost.',
    descriptionFr:
      'Comparatifs directs de produits Apple : performances, photo, batterie, logiciels et coût total.',
  },
  ipad: {
    titleFr: 'iPad',
    description:
      'iPad reviews, iPadOS tutorials, accessory advice and comparisons for work, study and creativity.',
    descriptionFr:
      'Tests iPad, tutoriels iPadOS, accessoires et comparatifs pour le travail, les études et la création.',
  },
  iphone: {
    titleFr: 'iPhone',
    description:
      'iPhone news, detailed reviews, camera and battery tests, iOS guides and regional buying advice.',
    descriptionFr:
      'Actualités iPhone, tests détaillés, essais photo et batterie, guides iOS et conseils d’achat régionaux.',
  },
  mac: {
    titleFr: 'Mac',
    description:
      'MacBook and desktop Mac reviews, macOS tutorials, performance analysis and buying recommendations.',
    descriptionFr:
      'Tests de MacBook et Mac de bureau, tutoriels macOS, analyses de performances et conseils d’achat.',
  },
  news: {
    titleFr: 'Actualités',
    description:
      'Verified Apple news, official announcements, launch coverage and analysis with clearly attributed sources.',
    descriptionFr:
      'Actualités Apple vérifiées, annonces officielles, lancements et analyses avec des sources clairement attribuées.',
  },
  reviews: {
    titleFr: 'Tests',
    description:
      'Independent Apple product reviews with transparent methods, strengths, weaknesses and scored verdicts.',
    descriptionFr:
      'Tests indépendants de produits Apple avec méthodes transparentes, points forts, limites et verdicts notés.',
  },
  software: {
    titleFr: 'Logiciels',
    description:
      'iOS, iPadOS, macOS, watchOS and Apple developer coverage with practical tutorials and release guidance.',
    descriptionFr:
      'Actualités iOS, iPadOS, macOS, watchOS et Apple Developer avec tutoriels pratiques et conseils de mise à jour.',
  },
  'vision-pro': {
    titleFr: 'Vision Pro',
    description:
      'Apple Vision Pro, visionOS, spatial computing applications, developer workflows and product analysis.',
    descriptionFr:
      'Apple Vision Pro, visionOS, applications spatiales, développement et analyses de produits.',
  },
}

const existing = await client.fetch(
  '*[_type == "category" && defined(slug.current)]{_id, title, "slug": slug.current}',
)
let updated = 0

for (const category of existing) {
  const copy = categories[category.slug]
  if (!copy) continue
  const title = category.title || category.slug
  await client
    .patch(category._id)
    .setIfMissing({
      titleFr: copy.titleFr,
      description: copy.description,
      descriptionFr: copy.descriptionFr,
      seoTitle: `${title} news, reviews and buying guides`,
      seoTitleFr: `${copy.titleFr} : actualités, tests et guides d’achat`,
      seoDescription: copy.description,
      seoDescriptionFr: copy.descriptionFr,
    })
    .commit({ visibility: 'sync' })
  updated += 1
}

console.log(
  JSON.stringify(
    { categoriesFound: existing.length, categoriesUpdated: updated },
    null,
    2,
  ),
)
