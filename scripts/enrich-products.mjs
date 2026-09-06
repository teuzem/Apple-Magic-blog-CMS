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

const copy = {
  'iphone-17-pro': [
    'A flagship iPhone for creators who value a fluid display, advanced cameras and sustained performance.',
    'Un iPhone haut de gamme pour les créateurs qui privilégient un écran fluide, des appareils photo avancés et des performances durables.',
  ],
  'iphone-17': [
    'A balanced everyday iPhone with a bright display, fast A19 performance and dependable all-day battery life.',
    'Un iPhone équilibré pour le quotidien, avec un écran lumineux, les performances rapides de la puce A19 et une autonomie fiable.',
  ],
  'iphone-17-air': [
    'An ultra-thin iPhone focused on portability and design, with the essential performance needed for daily use.',
    'Un iPhone ultrafin axé sur la mobilité et le design, avec les performances essentielles pour un usage quotidien.',
  ],
  'macbook-pro-m5': [
    'A high-performance portable Mac for demanding creative, development and professional workflows.',
    'Un Mac portable haute performance pour la création, le développement et les usages professionnels exigeants.',
  ],
  'macbook-air-m5': [
    'A silent, lightweight Mac for study, writing and creative work, with long battery life and capable M5 performance.',
    'Un Mac silencieux et léger pour les études, la rédaction et la création, avec une longue autonomie et la puissance de la puce M5.',
  ],
  'ipad-pro-m6': [
    'A premium tablet and creative canvas built for mobile productivity, illustration and media workflows.',
    'Une tablette haut de gamme et un espace créatif conçu pour la productivité mobile, l’illustration et les médias.',
  ],
  'apple-watch-ultra-3': [
    'A rugged Apple Watch designed for endurance, outdoor navigation and extended activity tracking.',
    'Une Apple Watch robuste conçue pour l’endurance, la navigation en extérieur et le suivi prolongé des activités.',
  ],
  'airpods-pro-3': [
    'Premium wireless earbuds with adaptive noise control, clear calls and a compact charging case.',
    'Des écouteurs sans fil haut de gamme avec réduction adaptative du bruit, appels clairs et boîtier de charge compact.',
  ],
  airtag: [
    'A compact tracker that helps locate everyday items through Apple’s Find My network.',
    'Un traceur compact qui aide à retrouver les objets du quotidien grâce au réseau Localiser d’Apple.',
  ],
}

const products = await client.fetch(
  '*[_type == "product"]{_id,name,tagline,"slug":slug.current,images,officialUrl,affiliateLink}',
)
const ids = Object.fromEntries(
  products.map((product) => [product.slug, product._id]),
)

for (const product of products) {
  const [description, descriptionFr] = copy[product.slug] || [
    `${product.name} with practical specifications, regional pricing and editorial guidance.`,
    `${product.name} avec des caractéristiques pratiques, des prix régionaux et des conseils éditoriaux.`,
  ]
  const sourceUrl = product.officialUrl || product.affiliateLink
  const image = product.images?.[0]
  const gallery = image
    ? [
        [
          'Design overview',
          'Vue du design',
          'A clear overview of the product design and finish.',
          'Une vue claire du design et de la finition du produit.',
        ],
        [
          'Key hardware detail',
          'Détail matériel',
          'A supporting view highlighting the hardware and everyday form factor.',
          'Une vue complémentaire mettant en valeur le matériel et le format au quotidien.',
        ],
        [
          'Everyday use',
          'Usage quotidien',
          'A closer product view for readers comparing size, materials and portability.',
          'Une vue rapprochée pour comparer la taille, les matériaux et la mobilité.',
        ],
      ].map(([caption, captionFr, detail, detailFr], index) => ({
        _key: `${product.slug}-gallery-${index + 1}`,
        _type: 'object',
        image: { ...image, _key: `${product.slug}-image-${index + 1}` },
        alt: `${product.name} ${caption.toLowerCase()}`,
        caption,
        captionFr,
        description: detail,
        descriptionFr: detailFr,
      }))
    : []
  const peers = products
    .filter((candidate) => candidate._id !== product._id)
    .slice(0, 3)
    .map((candidate, index) => ({
      _key: `${product.slug}-related-${index + 1}`,
      _type: 'reference',
      _ref: candidate._id,
    }))
  const richContent = (language) => {
    const fr = language === 'fr'
    const content = [
      {
        _key: `${product.slug}-${language}-heading`,
        _type: 'block',
        style: 'h2',
        markDefs: [],
        children: [
          {
            _key: 'title',
            _type: 'span',
            marks: [],
            text: fr ? 'Présentation détaillée' : 'Detailed overview',
          },
        ],
      },
      {
        _key: `${product.slug}-${language}-intro`,
        _type: 'block',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _key: 'intro',
            _type: 'span',
            marks: [],
            text: fr ? descriptionFr : description,
          },
        ],
      },
    ]
    if (gallery[0]?.image) {
      content.push({
        ...gallery[0].image,
        _key: `${product.slug}-${language}-support-image`,
        alt: gallery[0].alt,
        caption: fr ? gallery[0].captionFr : gallery[0].caption,
        layout: 'wide',
      })
    }
    content.push({
      _key: `${product.slug}-${language}-official-link`,
      _type: 'block',
      style: 'normal',
      markDefs: [
        {
          _key: 'official',
          _type: 'link',
          href: sourceUrl,
          openInNewTab: true,
        },
      ],
      children: [
        {
          _key: 'link',
          _type: 'span',
          marks: ['official'],
          text: fr
            ? `Consulter la présentation officielle de ${product.name}`
            : `Explore the official ${product.name} presentation`,
        },
      ],
    })
    if (['iphone-17', 'macbook-air-m5'].includes(product.slug)) {
      content.push({
        _key: `${product.slug}-${language}-official-media`,
        _type: 'embed',
        provider: 'other',
        url: sourceUrl,
        caption: fr
          ? 'Voir la présentation multimédia officielle Apple'
          : 'View the official Apple multimedia presentation',
      })
    }
    return content
  }

  await client
    .patch(product._id)
    .set({
      nameFr: product.name,
      taglineFr: product.tagline,
      description,
      descriptionFr,
      gallery,
      model: product.name,
      availability: 'InStock',
      seoTitle: `${product.name}: specifications, price and review`,
      seoDescription: description,
      supportingLinks: [
        {
          _key: `${product.slug}-official`,
          _type: 'object',
          label: `View ${product.name} on Apple`,
          labelFr: `Voir ${product.name} sur Apple`,
          url: sourceUrl,
        },
        {
          _key: `${product.slug}-compare`,
          _type: 'object',
          label: 'Compare Apple products',
          labelFr: 'Comparer les produits Apple',
          url: 'https://www.apple.com/compare/',
        },
      ].filter((link) => link.url),
      relatedProducts: peers,
      content: richContent('en'),
      contentFr: richContent('fr'),
    })
    .commit()
  console.log(`Enriched ${product.slug}`)
}

const verdictNotes = {
  'post-iphone-17-review': {
    title: 'Principal score: the best-value everyday iPhone',
    body: 'The iPhone 17 earns its 9.0/10 editorial score through strong battery life, a bright display and reliable performance. Choose it unless a 120Hz display or specialist Pro camera tools are essential.',
  },
  'post-macbook-air-m5-review': {
    title: 'Principal score: our default laptop recommendation',
    body: 'The MacBook Air M5 earns its 9.4/10 editorial score by combining silent performance, excellent portability and full-day battery life. It is the strongest all-round choice for students and mobile professionals.',
  },
}

for (const [id, note] of Object.entries(verdictNotes)) {
  const post = await client.fetch('*[_id == $id][0]{content}', { id })
  const content = (post?.content || []).map((block) =>
    block?._type === 'verdict' ? { ...block, ...note } : block,
  )
  await client.patch(id).set({ content }).commit()
  console.log(`Updated verdict ${id}`)
}
