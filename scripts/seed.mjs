/**
 * Apple Magic Blog — Sanity dataset seed.
 *
 * Populates the pipeline with categories, tags, authors, products, posts
 * (inspired by editorial themes of iphon.fr, re-written originally), a
 * navigation mega-menu, site settings and content pages.
 *
 * Safe to re-run: uses stable _ids with createOrReplace.
 *
 * Usage: node scripts/seed.mjs <project-root>
 */
import sharp from 'sharp'
import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const root = process.argv[2] || process.cwd()
const env = readFileSync(resolve(root, '.env.local'), 'utf8')
const get = (k) => {
  const m = env.match(new RegExp('^' + k + '=(.*)$', 'm'))
  return m ? m[1].replace(/^"|"$/g, '') : ''
}
const projectId = get('NEXT_PUBLIC_SANITY_PROJECT_ID')
const dataset = get('NEXT_PUBLIC_SANITY_DATASET')
const writeToken = get('SANITY_API_WRITE_TOKEN')

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2026-09-03',
  token: writeToken,
  useCdn: false,
})

/* ------------------------------------------------------------------ */
/* Asset helpers                                                       */
/* ------------------------------------------------------------------ */

const cache = {}

async function uploadCover(key, title, accent, sub = '') {
  if (cache[key]) return cache[key]
  const svg = coverSvg(title, accent, sub)
  const png = await sharp(Buffer.from(svg)).png().toBuffer()
  const asset = await client.assets.upload('image', png, {
    filename: `${key}.png`,
    contentType: 'image/png',
  })
  cache[key] = {
    _type: 'image',
    asset: { _type: 'reference', _ref: asset._id },
    alt: title,
  }
  return cache[key]
}

/* ------------------------------------------------------------------ */
/* Remote image helpers                                                */
/* ------------------------------------------------------------------ */

/**
 * Downloads a remote image via fetch and uploads it to Sanity.
 * Returns the same shape as uploadCover so it can be used interchangeably.
 */
async function fetchRemoteImage(key, url, alt) {
  if (cache[key]) return cache[key]
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
    const contentType = res.headers.get('content-type') || 'image/jpeg'
    const buffer = Buffer.from(await res.arrayBuffer())
    const asset = await client.assets.upload('image', buffer, {
      filename: `${key}.${contentType.includes('png') ? 'png' : 'jpg'}`,
      contentType,
    })
    cache[key] = {
      _type: 'image',
      asset: { _type: 'reference', _ref: asset._id },
      alt,
    }
    return cache[key]
  } catch (e) {
    console.warn(
      `  ⚠ Remote image failed for ${key}: ${e.message} — using fallback`,
    )
    return null
  }
}

/** Like uploadCover but with remote-image override: tries remote first,
 *  falls back to SVG-generated cover. */
async function smartCover(key, title, accent, sub, remoteUrl) {
  if (remoteUrl) {
    const img = await fetchRemoteImage(key, remoteUrl, title)
    if (img) return img
  }
  return uploadCover(key, title, accent, sub)
}

/** Create a Portable Text inline image block from a Sanity image object. */
function imgBlock(imageObj, alt, caption, layout = 'wide') {
  return {
    _type: 'image',
    _key: key('img'),
    asset: imageObj.asset,
    alt: alt || imageObj.alt || '',
    caption: caption || '',
    layout,
  }
}

/** Create a Portable Text gallery block. */
function gallery(images, caption) {
  return {
    _type: 'gallery',
    _key: key('gal'),
    images: images.map((img) => ({
      _type: 'image',
      _key: key('gi'),
      asset: img.asset,
      alt: img.alt || '',
    })),
    caption: caption || '',
  }
}

/** Create a Portable Text embed block (YouTube, etc.). */
function embed(provider, url, caption) {
  return {
    _type: 'embed',
    _key: key('emb'),
    provider,
    url,
    caption: caption || '',
  }
}

function coverSvg(title, accent, sub) {
  const [c1, c2] = accent
  const safeTitle = String(title)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;')
  const safeSub = String(sub || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/>
      <stop offset="1" stop-color="${c2}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.35" r="0.75">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.16"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <circle cx="1020" cy="150" r="34" fill="#ffffff" fill-opacity="0.9"/>
  <circle cx="1020" cy="150" r="54" fill="none" stroke="#ffffff" stroke-opacity="0.5" stroke-width="3"/>
  <path d="M1020 118 L1028 142 L1052 150 L1028 158 L1020 182 L1012 158 L988 150 L1012 142 Z" fill="#f5f5f7"/>
  <rect x="70" y="70" width="1060" height="470" rx="30" fill="none" stroke="#ffffff" stroke-opacity="0.22" stroke-width="2"/>
  <text x="130" y="150" font-family="Helvetica, Arial" font-size="26" fill="#ffffff" fill-opacity="0.75" letter-spacing="2">APPLE MAGIC BLOG</text>
  <text x="130" y="430" font-family="Helvetica, Arial" font-size="54" fill="#ffffff" font-weight="bold">${safeTitle}</text>
  <text x="130" y="480" font-family="Helvetica, Arial" font-size="28" fill="#ffffff" fill-opacity="0.85">${safeSub}</text>
</svg>`
}

/* ------------------------------------------------------------------ */
/* Portable Text helpers                                               */
/* ------------------------------------------------------------------ */

let _bk = 0
function key(prefix = 'k') {
  _bk += 1
  return `${prefix}${_bk}`
}

function p(text) {
  return {
    _type: 'block',
    _key: key('b'),
    style: 'normal',
    children: [{ _type: 'span', _key: key('s'), text, marks: [] }],
    markDefs: [],
  }
}
function h2(text) {
  return {
    _type: 'block',
    _key: key('b'),
    style: 'h2',
    children: [{ _type: 'span', _key: key('s'), text, marks: [] }],
    markDefs: [],
  }
}
function h3(text) {
  return {
    _type: 'block',
    _key: key('b'),
    style: 'h3',
    children: [{ _type: 'span', _key: key('s'), text, marks: [] }],
    markDefs: [],
  }
}
function callout(text, icon = 'info', heading) {
  return {
    _type: 'callout',
    _key: key('c'),
    icon,
    heading: heading || '',
    text,
  }
}
function comparisonTable(caption, columns, rowData) {
  return {
    _type: 'comparisonTable',
    _key: key('ct'),
    caption,
    columns,
    rows: rowData.map(([label, ...values]) => ({
      _type: 'object',
      _key: key('ctr'),
      label,
      values,
    })),
  }
}
function prosCons(pros, cons, score) {
  return {
    _type: 'prosCons',
    _key: key('pc'),
    ...(typeof score === 'number' ? { score } : {}),
    pros: pros.map((t, i) => ({
      _type: 'string',
      _key: key('pr' + i),
      value: t,
    })),
    cons: cons.map((t, i) => ({
      _type: 'string',
      _key: key('co' + i),
      value: t,
    })),
  }
}
function verdict(note, title, body, recommended = true) {
  return {
    _type: 'verdict',
    _key: key('v'),
    rating: note,
    title: title || 'Our verdict',
    body,
    recommended,
  }
}
function productCard(productId, title) {
  return {
    _type: 'productCard',
    _key: key('pc'),
    product: { _type: 'reference', _ref: `product-${productId}` },
    title: title || '',
  }
}

/* ------------------------------------------------------------------ */
/* Categories                                                          */
/* ------------------------------------------------------------------ */

const CAT_ACCENTS = {
  news: ['#1d1d1f', '#3a3a3c'],
  iphone: ['#2563eb', '#7c3aed'],
  ipad: ['#0ea5e9', '#6366f1'],
  mac: ['#475569', '#1e293b'],
  'apple-watch': ['#0f766e', '#134e4a'],
  airpods: ['#4f46e5', '#7c3aed'],
  'vision-pro': ['#7c3aed', '#2563eb'],
  accessories: ['#9ca3af', '#4b5563'],
  comparisons: ['#ea580c', '#be123c'],
  'buying-guides': ['#16a34a', '#15803d'],
  reviews: ['#db2777', '#7c3aed'],
  software: ['#0891b2', '#2563eb'],
  'apple-intelligence': ['#d97706', '#7c3aed'],
}

/* ------------------------------------------------------------------ */
/* Real image URLs (Unsplash + Apple press)                            */
/* ------------------------------------------------------------------ */

const POST_COVERS = {
  'iphone-17-review':
    'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1200&h=630&fit=crop',
  'iphone-17-pro-vs-iphone-17':
    'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1200&h=630&fit=crop',
  'macbook-air-m5-review':
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&h=630&fit=crop',
  'ipad-pro-m6-productivity':
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=1200&h=630&fit=crop',
  'apple-watch-ultra-3-review':
    'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=1200&h=630&fit=crop',
  'airpods-pro-3-review':
    'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=1200&h=630&fit=crop',
  'ios-26-features':
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200&h=630&fit=crop',
  'vision-pro-spatial-computing':
    'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=1200&h=630&fit=crop',
  'mag-safe-charging-guide':
    'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=1200&h=630&fit=crop',
  'iphone-17-air-first-look':
    'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=1200&h=630&fit=crop',
  'apple-intelligence-guide':
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=630&fit=crop',
  'mac-vs-pc-africa':
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop',
}

const PRODUCT_IMAGES = {
  'iphone-17-pro':
    'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&h=800&fit=crop',
  'iphone-17':
    'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&h=800&fit=crop',
  'iphone-17-air':
    'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&h=800&fit=crop',
  'macbook-pro-m5':
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=800&fit=crop',
  'macbook-air-m5':
    'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&h=800&fit=crop',
  'ipad-pro-m6':
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=800&fit=crop',
  'apple-watch-ultra-3':
    'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&h=800&fit=crop',
  'airpods-pro-3':
    'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&h=800&fit=crop',
  airtag:
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=800&fit=crop',
}

const AUTHOR_PHOTOS = {
  'aya-mensah':
    'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop&crop=face',
  'kamau-odhiambo':
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
  'nadia-benali':
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
}

const CATEGORY_IMAGES = {
  news: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=400&fit=crop',
  iphone:
    'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&h=400&fit=crop',
  ipad: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=400&fit=crop',
  mac: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=400&fit=crop',
  'apple-watch':
    'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&h=400&fit=crop',
  airpods:
    'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&h=400&fit=crop',
  'vision-pro':
    'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800&h=400&fit=crop',
  accessories:
    'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&h=400&fit=crop',
  comparisons:
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
  'buying-guides':
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
  reviews:
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=400&fit=crop',
  software:
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=400&fit=crop',
  'apple-intelligence':
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
}

/** Real YouTube reviews to embed in relevant posts. */
const POST_YOUTUBE = {
  'iphone-17-review': 'https://www.youtube.com/watch?v=pfPyVBDl8F8',
  'macbook-air-m5-review': 'https://www.youtube.com/watch?v=XcyDsx8dAro',
  'apple-watch-ultra-3-review': 'https://www.youtube.com/watch?v=BWJUoJE7yMQ',
  'airpods-pro-3-review': 'https://www.youtube.com/watch?v=M0d4kjmKB6E',
  'ios-26-features': 'https://www.youtube.com/watch?v=6Cda34E5BkE',
  'vision-pro-spatial-computing': 'https://www.youtube.com/watch?v=TX9qSaGXFyg',
}

const categoriesDef = [
  {
    slug: 'news',
    title: 'News',
    description: 'The latest Apple announcements, releases and industry moves.',
    color: '#8e8e93',
    order: 1,
  },
  {
    slug: 'iphone',
    title: 'iPhone',
    description: 'In-depth reviews, specs and buying guides for every iPhone.',
    color: '#2997ff',
    order: 2,
  },
  {
    slug: 'ipad',
    title: 'iPad',
    description: 'iPad guides, comparisons and productivity deep-dives.',
    color: '#5e5ce6',
    order: 3,
  },
  {
    slug: 'mac',
    title: 'Mac',
    description: 'MacBooks, desktop Macs and macOS — reviewed for Africa.',
    color: '#6e6e73',
    order: 4,
  },
  {
    slug: 'apple-watch',
    title: 'Apple Watch',
    description: 'Fitness, health and the best Apple Watch for every wrist.',
    color: '#64d2ff',
    order: 5,
  },
  {
    slug: 'airpods',
    title: 'AirPods',
    description: 'Wireless audio, ANC and the best AirPods to buy.',
    color: '#bf5af2',
    order: 6,
  },
  {
    slug: 'vision-pro',
    title: 'Vision Pro',
    description: 'Spatial computing with Apple Vision Pro, decoded.',
    color: '#8971ff',
    order: 7,
  },
  {
    slug: 'accessories',
    title: 'Accessories',
    description:
      'Cases, chargers, MagSafe and the gear that completes your setup.',
    color: '#8e8e93',
    order: 8,
  },
  {
    slug: 'comparisons',
    title: 'Comparisons',
    description: 'Head-to-heads that end the "which one?" debate.',
    color: '#ff6b1d',
    order: 9,
  },
  {
    slug: 'buying-guides',
    title: 'Buying Guides',
    description: 'Smart, Africa-focused advice on what to buy and when.',
    color: '#4cd964',
    order: 10,
  },
  {
    slug: 'reviews',
    title: 'Reviews',
    description: 'Honest, hands-on verdicts on the newest Apple hardware.',
    color: '#ff375f',
    order: 11,
  },
  {
    slug: 'software',
    title: 'Software',
    description: 'iOS, iPadOS, macOS, watchOS — what’s new and how to use it.',
    color: '#32ade6',
    order: 12,
  },
  {
    slug: 'apple-intelligence',
    title: 'Apple Intelligence',
    description: 'The future of AI on Apple devices, explained simply.',
    color: '#ffd60a',
    order: 13,
  },
]

/* ------------------------------------------------------------------ */
/* Tags                                                                */
/* ------------------------------------------------------------------ */

const tagsDef = [
  { slug: 'ios-26', title: 'iOS 26' },
  { slug: 'apple-intelligence', title: 'Apple Intelligence' },
  { slug: 'tutorial', title: 'Tutorial' },
  { slug: 'buying-guide', title: 'Buying guide' },
  { slug: 'accessibility', title: 'Accessibility' },
  { slug: 'battery', title: 'Battery life' },
  { slug: 'camera', title: 'Camera' },
  { slug: 'magsafe', title: 'MagSafe' },
  { slug: 'privacy', title: 'Privacy' },
  { slug: 'health', title: 'Health & fitness' },
  { slug: 'productivity', title: 'Productivity' },
  { slug: 'budget', title: 'Budget' },
  { slug: '5g', title: '5G' },
  { slug: 'gaming', title: 'Gaming' },
  { slug: 'central-africa', title: 'Central Africa' },
  { slug: 'financing', title: 'Financing' },
]

/* ------------------------------------------------------------------ */
/* Authors                                                             */
/* ------------------------------------------------------------------ */

const authorsDef = [
  {
    slug: 'aya-mensah',
    name: 'Aya Mensah',
    role: 'Senior Editor · iPhone',
    location: 'Accra, Ghana',
    bio: 'Aya has covered Apple since the original iPhone. She specialises in hands-on iPhone reviews and smartphone comparisons for African readers.',
    expertise: ['iPhone', 'Comparisons', 'Camera'],
    social: {
      twitter: 'https://twitter.com',
      instagram: 'https://instagram.com',
    },
  },
  {
    slug: 'kamau-odhiambo',
    name: 'Kamau Odhiambo',
    role: 'Mac & iPad Editor',
    location: 'Nairobi, Kenya',
    bio: 'A productivity-first reviewer, Kamau tests MacBooks, iPads and the apps that make them sing — with a focus on creators and students.',
    expertise: ['Mac', 'iPad', 'Productivity'],
    social: { twitter: 'https://twitter.com', youtube: 'https://youtube.com' },
  },
  {
    slug: 'nadia-benali',
    name: 'Nadia Benali',
    role: 'Wearables & Fitness Editor',
    location: 'Casablanca, Morocco',
    bio: 'Nadia tracks health and fitness tech. She reviews Apple Watch and AirPods with a trainer’s eye for real-world results.',
    expertise: ['Apple Watch', 'AirPods', 'Health & fitness'],
    social: { instagram: 'https://instagram.com' },
  },
]

/* ------------------------------------------------------------------ */
/* Products                                                            */
/* ------------------------------------------------------------------ */

const productsDef = [
  {
    slug: 'iphone-17-pro',
    name: 'iPhone 17 Pro',
    tagline: 'The Pro that rewrites the rules.',
    category: 'iphone',
    specs: [
      { label: 'Display', value: '6.3″ ProMotion OLED' },
      { label: 'Chip', value: 'A19 Pro' },
      { label: 'Camera', value: '48MP fusion triple' },
      { label: 'Battery', value: 'Up to 26h video' },
    ],
    pricing: {
      XAF: 705000,
      USD: 1099,
      ZAR: 20999,
      KES: 149000,
      NGN: 1490000,
      EGP: 58500,
      GHS: 14350,
    },
    rating: 4.7,
    reviewCount: 214,
    affiliateLink: 'https://www.apple.com/iphone-17-pro/',
  },
  {
    slug: 'iphone-17',
    name: 'iPhone 17',
    tagline: 'Magic, in the everyday.',
    category: 'iphone',
    specs: [
      { label: 'Display', value: '6.3″ Super Retina OLED' },
      { label: 'Chip', value: 'A19' },
      { label: 'Camera', value: '48MP fusion dual' },
      { label: 'Battery', value: 'Up to 22h video' },
    ],
    pricing: {
      XAF: 579000,
      USD: 899,
      ZAR: 16999,
      KES: 119000,
      NGN: 1190000,
      EGP: 47800,
      GHS: 11700,
    },
    rating: 4.5,
    reviewCount: 187,
    affiliateLink: 'https://www.apple.com/iphone-17/',
  },
  {
    slug: 'iphone-17-air',
    name: 'iPhone 17 Air',
    tagline: 'Our thinnest design yet.',
    category: 'iphone',
    specs: [
      { label: 'Display', value: '6.5″ OLED' },
      { label: 'Chip', value: 'A19' },
      { label: 'Camera', value: '48MP single' },
      { label: 'Battery', value: 'Up to 20h video' },
    ],
    pricing: {
      XAF: 639000,
      USD: 999,
      ZAR: 18999,
      KES: 132000,
      NGN: 1320000,
      EGP: 53200,
      GHS: 13000,
    },
    rating: 4.4,
    reviewCount: 96,
    affiliateLink: 'https://www.apple.com/iphone-17-air/',
  },
  {
    slug: 'macbook-pro-m5',
    name: 'MacBook Pro 14″ M5',
    tagline: 'Raw power, featherweight.',
    category: 'mac',
    specs: [
      { label: 'Chip', value: 'M5' },
      { label: 'Display', value: '14.2″ Liquid Retina XDR' },
      { label: 'Battery', value: 'Up to 24h' },
      { label: 'Memory', value: '16GB unified' },
    ],
    pricing: {
      XAF: 1019000,
      USD: 1599,
      ZAR: 29999,
      KES: 209000,
      NGN: 2090000,
      EGP: 85000,
      GHS: 20800,
    },
    rating: 4.8,
    reviewCount: 143,
    affiliateLink: 'https://www.apple.com/macbook-pro/',
  },
  {
    slug: 'macbook-air-m5',
    name: 'MacBook Air 13″ M5',
    tagline: 'Thin. Light. Limitless.',
    category: 'mac',
    specs: [
      { label: 'Chip', value: 'M5' },
      { label: 'Display', value: '13.6″ Liquid Retina' },
      { label: 'Battery', value: 'Up to 18h' },
      { label: 'Memory', value: '16GB unified' },
    ],
    pricing: {
      XAF: 699000,
      USD: 1099,
      ZAR: 20999,
      KES: 145000,
      NGN: 1450000,
      EGP: 58500,
      GHS: 14300,
    },
    rating: 4.6,
    reviewCount: 128,
    affiliateLink: 'https://www.apple.com/macbook-air/',
  },
  {
    slug: 'ipad-pro-m6',
    name: 'iPad Pro 13″ M6',
    tagline: 'A computer. A canvas. Totally magic.',
    category: 'ipad',
    specs: [
      { label: 'Chip', value: 'M6' },
      { label: 'Display', value: '13″ Ultra Retina XDR' },
      { label: 'Storage', value: '256GB base' },
      { label: 'Battery', value: 'Up to 10h' },
    ],
    pricing: {
      XAF: 829000,
      USD: 1299,
      ZAR: 24999,
      KES: 174000,
      NGN: 1740000,
      EGP: 69000,
      GHS: 16900,
    },
    rating: 4.7,
    reviewCount: 91,
    affiliateLink: 'https://www.apple.com/ipad-pro/',
  },
  {
    slug: 'apple-watch-ultra-3',
    name: 'Apple Watch Ultra 3',
    tagline: 'Built for the extremes. Made for Africa’s great outdoors.',
    category: 'apple-watch',
    specs: [
      { label: 'Case', value: '49mm titanium' },
      { label: 'Chip', value: 'S11' },
      { label: 'Battery', value: 'Up to 72h' },
      { label: 'Display', value: '3,000 nits' },
    ],
    pricing: {
      USD: 799,
      ZAR: 15499,
      KES: 108000,
      NGN: 1080000,
      EGP: 42500,
      GHS: 10400,
    },
    rating: 4.6,
    reviewCount: 77,
    affiliateLink: 'https://www.apple.com/apple-watch-ultra/',
  },
  {
    slug: 'airpods-pro-3',
    name: 'AirPods Pro 3',
    tagline: 'Silence, perfected.',
    category: 'airpods',
    specs: [
      { label: 'Type', value: 'In-ear with ANC' },
      { label: 'Chip', value: 'H3' },
      { label: 'Battery', value: 'Up to 8h' },
      { label: 'Charging', value: 'USB-C + MagSafe' },
    ],
    pricing: {
      USD: 249,
      ZAR: 4799,
      KES: 33500,
      NGN: 335000,
      EGP: 13200,
      GHS: 3240,
    },
    rating: 4.5,
    reviewCount: 402,
    affiliateLink: 'https://www.apple.com/airpods-pro/',
  },
  {
    slug: 'airtag',
    name: 'AirTag',
    tagline: 'Find your stuff. Everywhere.',
    category: 'accessories',
    specs: [
      { label: 'Tracking', value: 'Precision Finding' },
      { label: 'Battery', value: 'User replaceable CR2032' },
      { label: 'Resistance', value: 'IP67' },
    ],
    pricing: { USD: 29, ZAR: 549, KES: 3900, NGN: 39000, EGP: 1590, GHS: 380 },
    rating: 4.4,
    reviewCount: 890,
    affiliateLink: 'https://www.apple.com/airtag/',
  },
]

/* ------------------------------------------------------------------ */
/* Posts                                                               */
/* ------------------------------------------------------------------ */

// Each post: slug, title, contentType, category, tags[], author, featured,
// trending, date (days ago), excerpt, and content blocks.
const postsDef = [
  {
    slug: 'iphone-17-review',
    title: 'iPhone 17 review: the everyday phone grows up',
    contentType: 'Review',
    category: 'reviews',
    tags: ['camera', 'battery'],
    author: 'aya-mensah',
    featured: true,
    trending: true,
    daysAgo: 2,
    excerpt:
      'After a week with the iPhone 17, one thing is clear: Apple’s most popular iPhone has quietly become its best value flagship in years.',
    content: [
      p(
        'The iPhone 17 walks into a crowded year. With the Pro line pushing bigger screens and a new Air model chasing thinness, the standard iPhone had to prove there is still a place for a phone that simply gets everything right. After a full week of testing in Accra — hot days, patchy 5G and long commute hours — I came away genuinely impressed.',
      ),
      h2('Design and display'),
      p(
        'The 6.3-inch Super Retina OLED gets an improved peak brightness that makes it comfortably readable under harsh midday sun, a quiet but meaningful upgrade for African users. The aluminium body feels denser and more premium; the new camera-bump layout, while divisive online, grows on you fast.',
      ),
      h2('Battery that finally relaxes you'),
      p(
        'Across video, navigation and photography, the iPhone 17 consistently cleared a full day — and most days it ended around 35 per cent. For a market where power cuts and long commutes are routine, this is the headline feature.',
      ),
      callout(
        'Our battery test: 21% better endurance than the iPhone 16 in real-world mixed use. That is the phone doing the heavy lifting, not the settings screen.',
        'pro',
      ),
      h2('Camera'),
      p(
        'The 48-megapixel fusion camera is the same flexible sensor that made the 16 a darling, now paired with smarter photo-processing. Portrait backgrounds feel more natural, low light is cleaner, and the 2x crop mode is the most useful zoom you are not paying extra for.',
      ),
      prosCons(
        [
          'Excellent all-day battery',
          'Bright, readable display',
          'Great 48MP camera for the price',
          'Fast A19 chip',
        ],
        [
          'Base 128GB feels tight for video',
          'Same 60Hz display as last year',
          'No major design rethink',
        ],
        9.0,
      ),
      verdict(
        9.0,
        'A hugely competent everyday iPhone',
        'If you want the best value in Apple’s 2026 lineup and do not need Pro camera tricks, the iPhone 17 is the one to buy.',
        true,
      ),
    ],
  },
  {
    slug: 'iphone-17-pro-vs-iphone-17',
    title: 'iPhone 17 Pro vs iPhone 17: which should you actually buy?',
    contentType: 'Comparison',
    category: 'comparisons',
    tags: ['camera', 'buying-guide'],
    author: 'aya-mensah',
    trending: true,
    daysAgo: 3,
    excerpt:
      'They share the A19 generation, but the Pro costs more. We break down exactly what your money buys — and who should save it.',
    content: [
      p(
        'Every year the gap between the Pro and the standard iPhone shrinks, and 2026 is no exception. On paper the iPhone 17 Pro and iPhone 17 look more alike than ever. The differences live in the details: the display, the cameras and the materials. Here is the breakdown that actually matters.',
      ),
      h2('Same silicon, different shapes'),
      p(
        'Both phones run the A19 chip, so day-to-day speed is indistinguishable in most apps. The Pro adds a ProMotion 120Hz display and the brighter Always-On screen — the single most noticeable upgrade when you switch between the two.',
      ),
      h2('Cameras: where the Pro earns its keep'),
      p(
        'The Pro’s triple 48MP system with the dedicated telephoto delivers a real 5x optical zoom and better low-light portraits. If you photograph children, wildlife or evening events, that is worth real money.',
      ),
      comparisonTable(
        'iPhone 17 vs iPhone 17 Pro',
        ['Feature', 'iPhone 17', 'iPhone 17 Pro'],
        [
          ['Display', '6.3″ OLED · 60Hz', '6.3″ ProMotion · 120Hz'],
          ['Chip', 'A19', 'A19 Pro'],
          ['Cameras', '48MP dual', '48MP triple + 5x tele'],
          ['Build', 'Aluminium', 'Titanium'],
          ['Price (USD)', '$899', '$1,099'],
        ],
      ),
      verdict(
        9.2,
        'Pro only if you shoot or scroll a lot',
        'The 120Hz display and telephoto camera justify the premium for creators. Everyone else will love the iPhone 17.',
        true,
      ),
    ],
  },
  {
    slug: 'macbook-air-m5-review',
    title: 'MacBook Air M5 review: Africa’s best student laptop gets faster',
    contentType: 'Review',
    category: 'reviews',
    tags: ['productivity', 'budget'],
    author: 'kamau-odhiambo',
    daysAgo: 5,
    excerpt:
      'Faster, cooler and still fanless. The M5 MacBook Air is the laptop we keep recommending to students and creators across the continent.',
    content: [
      p(
        'Few products earn their reputation as quietly as the MacBook Air. The M5 generation stays true to the formula — silent, cool, all-day battery — while adding a meaningful speed bump and better memory bandwidth. Tested over two weeks of real work in Nairobi: writing, editing, light video and hours of video calls.',
      ),
      h2('Performance without a fan'),
      p(
        'The fanless design remains the Air’s superpower. It never throttles during a full day of browser tabs and presentations, and it does not cook your lap. The M5 chip handles light video editing and creative work with room to spare.',
      ),
      h2('Battery and portability'),
      p(
        'Up to 18 hours quoted, and in real use I comfortably crossed 13 hours on a single charge. At 1.24kg it disappears into a bag — crucial when your campus hike is part of the routine.',
      ),
      productCard('macbook-air-m5'),
      verdict(
        9.4,
        'The default recommendation',
        'For students and mobile creatives, the M5 MacBook Air is the best-value serious laptop you can buy right now.',
        true,
      ),
    ],
  },
  {
    slug: 'ipad-pro-m6-productivity',
    title: 'Can the iPad Pro M6 replace your laptop? We tried for a month',
    contentType: 'Guide',
    category: 'ipad',
    tags: ['productivity', 'gaming'],
    author: 'kamau-odhiambo',
    daysAgo: 6,
    excerpt:
      'With Stage Manager, an external display and pro apps arriving monthly, the iPad Pro M6 is closer than ever. Here is the honest truth.',
    content: [
      p(
        'Each year Apple pushes the iPad Pro further into laptop territory, and the M6 makes the boldest case yet. I spent a month using the 13-inch iPad Pro as my only computer: writing, video calls, light design and even some coding. Here is what worked, and what still does not.',
      ),
      h2('What works'),
      p(
        'The M6 is astonishingly fast and the Liquid Retina XDR display is the best I have used on any device under $2,000 in Africa-friendly conditions. Stage Manager plus an external monitor turns it into a surprisingly capable workstation.',
      ),
      h2('Where it still stumbles'),
      p(
        'iPadOS is still not macOS. Multitasking feels powerful but occasionally fiddly, and some heavier desktop apps remain absent. If your work lives in the browser, iPadOS Office or design apps, you will barely notice.',
      ),
      callout(
        'The verdict: the iPad Pro M6 is a brilliant second-and-a-half computer, but a one-or-the-other move is still for niche workflows.',
        'info',
      ),
      productCard('ipad-pro-m6'),
      verdict(
        9.0,
        'A brilliant second computer',
        'If your work lives in the browser or mobile apps, the iPad Pro M6 can genuinely replace a laptop. Heavy desktop workflows should still dual-carry.',
        true,
      ),
    ],
  },
  {
    slug: 'apple-watch-ultra-3-review',
    title: 'Apple Watch Ultra 3 review: built for Africa’s great outdoors',
    contentType: 'Review',
    category: 'reviews',
    tags: ['health', 'battery'],
    author: 'nadia-benali',
    daysAgo: 7,
    excerpt:
      'Extended battery, a brighter display and rock-solid GPS. We took the Ultra 3 on trail runs, long hikes and week-long trips.',
    content: [
      p(
        'The Apple Watch Ultra 3 doubles down on everything the line stands for: serious battery life, extreme durability and a display you can read anywhere. I wore it for two weeks across coastal runs, mountain trail hikes and a long-haul travel week.',
      ),
      h2('Battery that changes your habits'),
      p(
        'The headline 72-hour battery in standard use meant I stopped obsessing over charging. For multi-day hikes and travel, that single change makes the Watch Ultra genuinely special.',
      ),
      h2('Health and GPS'),
      p(
        'Heart-rate tracking during high-intensity trail runs stayed accurate, and the dual-frequency GPS held a lock even in dense forest cover. The 3,000-nit display is effortless to read in full sun.',
      ),
      verdict(
        9.2,
        'The adventurer’s choice',
        'Expensive, but if long battery and rugged GPS matter, nothing else comes close for outdoor lifestyles.',
        true,
      ),
    ],
  },
  {
    slug: 'airpods-pro-3-review',
    title:
      'AirPods Pro 3 review: the best noise-cancelling earbuds get quieter',
    contentType: 'Review',
    category: 'reviews',
    tags: ['buying-guide', 'magsafe'],
    author: 'nadia-benali',
    daysAgo: 9,
    excerpt:
      'The H3 chip and adaptive ANC make the AirPods Pro 3 the benchmark for commuting, calls and focused work.',
    content: [
      p(
        'Noise-cancelling earbuds live or die by how quickly they vanish from your awareness. The AirPods Pro 3 — with the new H3 chip and upgraded adaptive transparency — disappear almost completely, leaving only your music and silence.',
      ),
      h2('Silence, tuned'),
      p(
        'Adaptive ANC now reacts to your environment in real time, drowning out the roar of a city bus while still letting you hear an announcement when it matters. Call quality is dramatically clearer, too.',
      ),
      h2('Comfort and battery'),
      p(
        'The new ear tips remain the most comfortable in the business. About eight hours per charge, and the compact USB-C MagSafe case adds four more full charges.',
      ),
      productCard('airpods-pro-3'),
      verdict(
        9.0,
        'The all-round best pick',
        'For most people, the AirPods Pro 3 remains the smartest, most comfortable premium earbuds you can buy.',
        true,
      ),
    ],
  },
  {
    slug: 'ios-26-features',
    title: 'iOS 26: every big new feature worth knowing before you update',
    contentType: 'News',
    category: 'software',
    tags: ['ios-26', 'apple-intelligence', 'privacy'],
    author: 'kamau-odhiambo',
    trending: true,
    daysAgo: 1,
    excerpt:
      'From a redesigned lock screen to deeper Apple Intelligence, here is everything new in iOS 26 — and which iPhones support it.',
    content: [
      p(
        'iOS 26 is rolling out now, and it is one of Apple’s biggest software releases in years. Beyond the headline Apple Intelligence features, there are meaningful quality-of-life changes to notifications, privacy and the camera. Here is what you need to know before you tap Update.',
      ),
      h2('A smarter lock screen and notifications'),
      p(
        'Live Activities get richer, notifications are grouped more intelligently by priority, and the new scheduling lets you time quiet hours around your actual life — useful across different work rhythms.',
      ),
      h2('Apple Intelligence, taken deeper'),
      p(
        'Writing Tools are now context-aware, Siri gets better at on-device follow-ups, and the new Visual Intelligence can identify places and objects you point the camera at. Everything is processed on-device, keeping your data private.',
      ),
      callout(
        'Privacy note: iOS 26 runs Apple Intelligence on-device by default. Nothing you do with Siri or Writing Tools is sent to Apple’s servers.',
        'privacy',
      ),
      h3('Which iPhones support iOS 26?'),
      p(
        'Roughly the same list as iOS 18: every iPhone from the XS and newer. Full Apple Intelligence features require an iPhone 15 Pro or newer.',
      ),
      verdict(
        8.7,
        'A substantial, privacy-first update',
        'iOS 26 is a meaningful step forward, anchored by on-device Apple Intelligence. Existing users should not hesitate to update.',
        true,
      ),
    ],
  },
  {
    slug: 'vision-pro-spatial-computing',
    title: 'Apple Vision Pro: a year of spatial computing, explained',
    contentType: 'Guide',
    category: 'vision-pro',
    tags: ['apple-intelligence', 'productivity', 'gaming'],
    author: 'aya-mensah',
    daysAgo: 12,
    excerpt:
      'The Vision Pro is no longer just a developer curiosity. Here is how spatial computing is becoming genuinely useful.',
    content: [
      p(
        'Twelve months after launch, the Apple Vision Pro has matured from a breathtaking demo into a genuinely useful tool — for the right people. Its spatial displays, giant virtual screens and immersive environments are finding real homes in design, education and entertainment.',
      ),
      h2('Real workflows'),
      p(
        'The killer app remains the infinite workspace: multiple floating 4K displays in an empty room. Architects, designers and lecturers use it to visualise 3D models and walk students through concepts that are hard to show on a flat screen.',
      ),
      h2('Where to start'),
      p(
        'Because it is priced at the premium end, we recommend trying it in an Apple Store before committing. The visionOS ecosystem is growing fast, but it is still a frontier you should test with a clear use case in mind.',
      ),
      verdict(
        8.6,
        'A frontier worth watching',
        'Breathtaking and increasingly useful, but buy for a clear spatial-workflow use case, not curiosity alone.',
        false,
      ),
    ],
  },
  {
    slug: 'mag-safe-charging-guide',
    title: 'Best MagSafe chargers for your iPhone in 2026',
    contentType: 'Guide',
    category: 'buying-guides',
    tags: ['magsafe', 'battery'],
    author: 'nadia-benali',
    daysAgo: 14,
    excerpt:
      'From 15W stands to budget-friendly pucks, we tested the MagSafe chargers that are actually worth your money.',
    content: [
      p(
        'MagSafe has quietly become the default way to charge an iPhone, and 2026’s lineup is better and cheaper than ever. I tested a shelf-load of chargers to find the ones that balance speed, build and price for African buyers.',
      ),
      h2('What matters in a MagSafe charger'),
      p(
        'Look for genuine 15W wireless charging, a decent cable included, and good heat management. Cheaper magnetic chargers that merely stick but charge at 7.5W are not worth it.',
      ),
      callout(
        'Pro tip: pair any 15W MagSafe charger with a 20W USB-C power adapter — most chargers do not include one in the box.',
        'tip',
      ),
      h2('Our picks'),
      p(
        'The Apple MagSafe Charger remains the reliable baseline. For a desk, a weighted stand is a joy. And for travel, a folding dual-device charger keeps your iPhone and AirPods in one small pouch.',
      ),
      verdict(
        8.4,
        'Better and cheaper than ever',
        'For most people a genuine 15W MagSafe charger is worth it — just skip 7.5W magnetic pucks that only stick.',
        true,
      ),
    ],
  },
  {
    slug: 'iphone-17-air-first-look',
    title: 'iPhone 17 Air hands-on: this is the thinnest iPhone ever',
    contentType: 'News',
    category: 'news',
    tags: ['camera', 'buying-guide'],
    author: 'aya-mensah',
    trending: true,
    daysAgo: 4,
    excerpt:
      'We spent an afternoon with Apple’s ultra-thin iPhone 17 Air. It is gorgeous — and more practical than its 5.6mm frame suggests.',
    content: [
      p(
        'At just 5.6mm, the iPhone 17 Air is the thinnest phone Apple has ever built — thinner than a 2010 iPod touch. I went hands-on with it ahead of launch, and the first impression is almost unfair: it feels impossibly light and impossibly thin in the hand.',
      ),
      h2('Thin, but not fragile'),
      p(
        'The titanium frame is reassuringly rigid, and the single 48MP camera bumps down the corner with the same confidence as the Pro. It will absolutely need a case, but it does not feel delicate in the way ultra-thin phones often do.',
      ),
      h2('The trade-offs'),
      p(
        'There is one main camera, a 60Hz display, and battery life that trails the standard iPhone 17. Those are deliberate compromises in exchange for the design. If thinness alone is not your priority, the regular iPhone 17 is the better value.',
      ),
      productCard('iphone-17-air'),
      verdict(
        8.8,
        'Design you can feel',
        'Brave, gorgeous and thinner than anything before. Buy it for the statement; buy the iPhone 17 for value.',
        true,
      ),
    ],
  },
  {
    slug: 'apple-intelligence-guide',
    title: 'Apple Intelligence: the honest guide to AI on iPhone, iPad and Mac',
    contentType: 'Guide',
    category: 'apple-intelligence',
    tags: ['apple-intelligence', 'privacy'],
    author: 'kamau-odhiambo',
    daysAgo: 10,
    excerpt:
      'What Apple Intelligence can actually do in 2026, what it cannot, and how to make it useful today without giving up your privacy.',
    content: [
      p(
        'Every Apple keynote mentions Apple Intelligence, yet it remains fuzzy for many users. This guide cuts through the marketing to what the AI features actually do across iPhone, iPad and Mac — and what is still on the horizon.',
      ),
      h2('What works today'),
      p(
        'The Writing Tools are the most immediately useful: proofreading, summarising and rewriting right inside any text field. Notification summarisation genuinely tames your inbox and group chats.',
      ),
      h2('What is still cooking'),
      p(
        'The deeper agentic features — where Siri can operate other apps on your behalf — are rolling out in stages. They remain promising but imperfect, and Apple is deliberately moving slower to keep processing on-device.',
      ),
      callout(
        'Bottom line: Apple Intelligence is a set of practical, privacy-first tools right now. Treat the demo-floor agentic future as a roadmap, not reality.',
        'info',
      ),
      productCard('macbook-air-m5'),
      verdict(
        8.9,
        'Useful today, exciting tomorrow',
        'The writing tools and on-device privacy are genuinely worth having now. Approach the agentic roadmap with healthy scepticism.',
        true,
      ),
    ],
  },
  {
    slug: 'mac-vs-pc-africa',
    title: 'Mac vs. Windows in Africa: a 2026 buying decision that makes sense',
    contentType: 'News',
    category: 'mac',
    tags: ['buying-guide', 'budget'],
    author: 'kamau-odhiambo',
    daysAgo: 8,
    excerpt:
      'With silicon Macs lasting far longer and holding resale value, the total cost of ownership story is changing across the continent.',
    content: [
      p(
        'The Mac-versus-Windows debate takes on a different flavour in African markets, where import duties, repair access and resale value decide real ownership costs. In 2026, Apple silicon has shifted the balance in important ways.',
      ),
      h2('The durability argument'),
      p(
        'M-series Macs stay fast for years with no forced upgrade cycle, and their battery life is unmatched. For a student or professional who keeps a machine for five or six years, that reduces the true cost per year dramatically.',
      ),
      h2('Ecosystem and resale'),
      p(
        'iPhones are everywhere in Africa, and the continuity between iPhone and Mac is a genuinely practical advantage. Apple devices also hold resale value better, softening the upfront premium.',
      ),
      verdict(
        8.8,
        'Value is getting closer',
        'For most long-term buyers, a Mac is now the smarter total-cost-of-ownership choice — if the higher upfront price works for your budget.',
        true,
      ),
    ],
  },
]

/* ------------------------------------------------------------------ */
/* Navigation + footer                                                 */
/* ------------------------------------------------------------------ */

const navItems = [
  {
    _key: key('ni'),
    label: 'iPhone',
    url: '/categories/iphone',
    children: [
      {
        _key: key('nc'),
        label: 'iPhone 17 Pro',
        url: '/products/iphone-17-pro',
      },
      {
        _key: key('nc'),
        label: 'iPhone 17 Air',
        url: '/products/iphone-17-air',
      },
      {
        _key: key('nc'),
        label: 'Best iPhone for you',
        url: '/categories/buying-guides',
        description: 'Guides to find your match',
      },
      {
        _key: key('nc'),
        label: 'iPhone comparisons',
        url: '/categories/comparisons',
        description: 'Pro vs. Air vs. SE',
      },
    ],
  },
  {
    _key: key('ni'),
    label: 'Mac',
    url: '/categories/mac',
    children: [
      {
        _key: key('nc'),
        label: 'MacBook Air M5',
        url: '/products/macbook-air-m5',
      },
      {
        _key: key('nc'),
        label: 'MacBook Pro M5',
        url: '/products/macbook-pro-m5',
      },
      { _key: key('nc'), label: 'All Mac reviews', url: '/categories/reviews' },
      {
        _key: key('nc'),
        label: 'Mac buying guides',
        url: '/categories/buying-guides',
      },
    ],
  },
  {
    _key: key('ni'),
    label: 'iPad',
    url: '/categories/ipad',
    children: [
      { _key: key('nc'), label: 'iPad Pro M6', url: '/products/ipad-pro-m6' },
      { _key: key('nc'), label: 'iPad productivity', url: '/categories/ipad' },
      {
        _key: key('nc'),
        label: 'Apple Pencil & keyboards',
        url: '/categories/accessories',
      },
    ],
  },
  {
    _key: key('ni'),
    label: 'Apple Watch',
    url: '/categories/apple-watch',
    children: [
      {
        _key: key('nc'),
        label: 'Watch Ultra 3',
        url: '/products/apple-watch-ultra-3',
      },
      {
        _key: key('nc'),
        label: 'Which Apple Watch?',
        url: '/categories/buying-guides',
      },
    ],
  },
  {
    _key: key('ni'),
    label: 'Watch',
    url: '/categories/apple-watch',
  },
  {
    _key: key('ni'),
    label: 'AirPods',
    url: '/categories/airpods',
    children: [
      {
        _key: key('nc'),
        label: 'AirPods Pro 3',
        url: '/products/airpods-pro-3',
      },
      {
        _key: key('nc'),
        label: 'Best AirPods for you',
        url: '/categories/buying-guides',
      },
    ],
  },
  {
    _key: key('ni'),
    label: 'Vision',
    url: '/categories/vision-pro',
  },
  {
    _key: key('ni'),
    label: 'News',
    url: '/categories/news',
  },
  {
    _key: key('ni'),
    label: 'Comparisons',
    url: '/categories/comparisons',
  },
  {
    _key: key('ni'),
    label: 'Guides',
    url: '/categories/buying-guides',
  },
]

const footerGroups = [
  {
    heading: 'Explore',
    links: [
      { label: 'News', url: '/categories/news' },
      { label: 'iPhone', url: '/categories/iphone' },
      { label: 'iPad', url: '/categories/ipad' },
      { label: 'Mac', url: '/categories/mac' },
      { label: 'Apple Watch', url: '/categories/apple-watch' },
      { label: 'AirPods', url: '/categories/airpods' },
      { label: 'Vision Pro', url: '/categories/vision-pro' },
    ],
  },
  {
    heading: 'Learn',
    links: [
      { label: 'Buying guides', url: '/categories/buying-guides' },
      { label: 'Comparisons', url: '/categories/comparisons' },
      { label: 'Reviews', url: '/categories/reviews' },
      { label: 'Software & iOS', url: '/categories/software' },
      { label: 'Apple Intelligence', url: '/categories/apple-intelligence' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', url: '/about' },
      { label: 'Editorial policy', url: '/pages/editorial-policy' },
      { label: 'Contact us', url: '/pages/contact' },
      { label: 'Advertise', url: '/pages/contact' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy policy', url: '/pages/privacy' },
      { label: 'Terms of use', url: '/pages/terms' },
      { label: 'Cookies', url: '/pages/privacy' },
    ],
  },
]

/* ------------------------------------------------------------------ */
/* Pages (site content pages)                                          */
/* ------------------------------------------------------------------ */

function pageContent(slug) {
  if (slug === 'privacy') {
    return [
      h2('Your privacy matters'),
      p(
        'Apple Magic Blog respects your privacy. This policy explains what we collect, why, and the choices you have. We minimise data by default: we do not sell personal information, and we ask only for what we genuinely need.',
      ),
      h2('What we collect'),
      p(
        'When you subscribe to our newsletter we store your email address, your preferred language and, optionally, your interests. When you post a comment we store the name and email you provide so we can moderate and reach you if needed.',
      ),
      h3('Analytics'),
      p(
        'We use privacy-respecting, aggregated analytics to understand which articles help readers most. We anonymise IP addresses and never share browsing data with advertisers.',
      ),
      callout(
        'Contact: for any privacy request, email privacy@applemagic.blog and we will respond within 30 days.',
        'privacy',
      ),
    ]
  }
  if (slug === 'terms') {
    return [
      h2('Terms of use'),
      p(
        'By using Apple Magic Blog you agree to these terms. Our content is provided for information and entertainment, and we always aim to be accurate — but technology changes fast and we cannot guarantee every detail remains current.',
      ),
      h2('Affiliate disclosure'),
      p(
        'Some of our articles contain affiliate links. If you buy through one of them, we may earn a small commission at no extra cost to you. This never influences our editorial verdicts; our opinions remain independent.',
      ),
      h3('Acceptable use'),
      p(
        'Please keep comments respectful. We moderate all comments and remove spam, abuse or misinformation. We may close comments on articles at any time.',
      ),
    ]
  }
  if (slug === 'editorial-policy') {
    return [
      h2('Editorial independence'),
      p(
        'Apple Magic Blog is independently owned and editorially independent. Advertisers and partner brands never influence our reviews, guides or verdicts. We call it as we see it.',
      ),
      h2('How we review'),
      p(
        'We test products in real conditions, over realistic periods, and disclose the methods used in each review. When a unit is loaned by a manufacturer, we say so. Our verdicts are our own.',
      ),
      h3('Corrections'),
      p(
        'We correct errors promptly and transparently. If you spot a mistake, email corrections@applemagic.blog and we will review and fix it.',
      ),
    ]
  }
  if (slug === 'contact') {
    return [
      h2('Contact Apple Magic Blog'),
      p(
        'We would love to hear from you — whether you have a question, a tip, a press inquiry or a partnership idea.',
      ),
      h3('Editorial & tips'),
      p('tips@applemagic.blog — share your Apple news, leaks and story ideas.'),
      h3('Advertising & partnerships'),
      p(
        'partners@applemagic.blog — reach our audience of engaged Apple enthusiasts across Africa.',
      ),
      h3('Support & corrections'),
      p(
        'support@applemagic.blog — help with an article, a subscription or a correction.',
      ),
      callout('We typically respond within two working days.', 'info'),
    ]
  }
  return [p('This page is coming soon.')]
}

const pagesDef = [
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    seoDescription: 'How Apple Magic Blog handles your data and privacy.',
  },
  {
    slug: 'terms',
    title: 'Terms of Use',
    seoDescription: 'The terms that govern your use of Apple Magic Blog.',
  },
  {
    slug: 'editorial-policy',
    title: 'Editorial Policy',
    seoDescription:
      'Our editorial independence, review methods and corrections policy.',
  },
  {
    slug: 'contact',
    title: 'Contact Us',
    seoDescription: 'Get in touch with the Apple Magic Blog team.',
  },
]

/* ------------------------------------------------------------------ */
/* Run                                                                */
/* ------------------------------------------------------------------ */

async function main() {
  _bk = 0
  console.log('Seeding', projectId, '/', dataset)

  // Categories
  const catIds = {}
  for (const def of categoriesDef) {
    const id = `category-${def.slug}`
    catIds[def.slug] = id
    const cover = def.image
      ? undefined
      : await smartCover(
          `cat-${def.slug}`,
          def.title,
          CAT_ACCENTS[def.slug] || ['#1d1d1f', '#3a3a3c'],
          '',
          CATEGORY_IMAGES[def.slug],
        )
    await client.createOrReplace({
      _id: id,
      _type: 'category',
      title: def.title,
      slug: { _type: 'slug', current: def.slug },
      description: def.description,
      color: def.color,
      displayOrder: def.order,
      showInNav: true,
      image: cover,
    })
    console.log('  category:', def.slug)
  }

  // Tags
  const tagIds = {}
  for (const def of tagsDef) {
    const id = `tag-${def.slug}`
    tagIds[def.slug] = id
    await client.createOrReplace({
      _id: id,
      _type: 'tag',
      title: def.title,
      slug: { _type: 'slug', current: def.slug },
      type: 'topic',
    })
    console.log('  tag:', def.slug)
  }

  // Authors
  const authorIds = {}
  for (const def of authorsDef) {
    const id = `author-${def.slug}`
    authorIds[def.slug] = id
    const pic = await smartCover(
      `author-${def.slug}`,
      def.name.split(' ')[0],
      ['#2a2a2c', '#1a1a1c'],
      def.role.split('·')[0].trim(),
      AUTHOR_PHOTOS[def.slug],
    )
    await client.createOrReplace({
      _id: id,
      _type: 'author',
      name: def.name,
      slug: { _type: 'slug', current: def.slug },
      role: def.role,
      location: def.location,
      bio: def.bio,
      expertise: def.expertise,
      social: def.social,
      picture: pic,
    })
    console.log('  author:', def.slug)
  }

  // Products
  const productIds = {}
  for (const def of productsDef) {
    const id = `product-${def.slug}`
    productIds[def.slug] = id
    const cover = await smartCover(
      `prod-${def.slug}`,
      def.name,
      CAT_ACCENTS[def.category] || ['#1d1d1f', '#3a3a3c'],
      def.tagline,
      PRODUCT_IMAGES[def.slug],
    )
    await client.createOrReplace({
      _id: id,
      _type: 'product',
      name: def.name,
      slug: { _type: 'slug', current: def.slug },
      tagline: def.tagline,
      description:
        def.description ||
        `${def.name} — reviewed with real-world performance, battery and value in mind.`,
      officialUrl: def.affiliateLink,
      imageSource: def.affiliateLink,
      category: { _type: 'reference', _ref: catIds[def.category] },
      images: [
        { _type: 'image', _key: key('im'), asset: cover.asset, alt: def.name },
      ],
      specs: def.specs.map((spec, index) => ({
        ...spec,
        _key: `${def.slug}-spec-${index + 1}`,
        _type: 'object',
      })),
      pricing: { _type: 'object', ...def.pricing },
      releaseDate: '2026-03-01T00:00:00.000Z',
      rating: def.rating,
      reviewCount: def.reviewCount,
      affiliateLink: def.affiliateLink,
      storeUrl: `https://applemagicstore.tech/product/${def.slug}`,
      relatedProducts: [],
    })
    console.log('  product:', def.slug)
  }

  // Posts
  for (const def of postsDef) {
    const id = `post-${def.slug}`
    const cover = await smartCover(
      `post-${def.slug}`,
      def.title,
      CAT_ACCENTS[def.category] || ['#1d1d1f', '#3a3a3c'],
      '',
      POST_COVERS[def.slug],
    )
    const date = new Date(Date.now() - def.daysAgo * 86400000).toISOString()

    // Inject a YouTube embed after the 2nd paragraph if one is defined for this post
    const content = [...def.content]
    if (POST_YOUTUBE[def.slug] && content.length >= 4) {
      const ytIndex = Math.min(3, content.length - 2)
      content.splice(
        ytIndex,
        0,
        embed(
          'youtube',
          POST_YOUTUBE[def.slug],
          `${def.title} — hands-on video`,
        ),
      )
    }

    // Add inline cover image near the top (after first paragraph)
    if (cover && content.length >= 2) {
      content.splice(1, 0, imgBlock(cover, def.title, '', 'wide'))
    }

    // Reviews: add a product detail image at the end
    if (def.contentType === 'Review' && cover && content.length >= 4) {
      const productSlug = def.content
        .find((b) => b._type === 'productCard')
        ?.product?._ref?.replace('product-', '')
      const detailUrl = productSlug ? PRODUCT_IMAGES[productSlug] : null
      if (detailUrl) {
        const detailImg = await fetchRemoteImage(
          `${def.slug}-detail`,
          detailUrl,
          `${def.title} detail`,
        )
        if (detailImg) {
          content.push(
            imgBlock(detailImg, `${def.title} detail shot`, '', 'wide'),
          )
        }
      }
    }
    await client.createOrReplace({
      _id: id,
      _type: 'post',
      title: def.title,
      slug: { _type: 'slug', current: def.slug },
      excerpt: def.excerpt,
      locale: 'en',
      status: 'published',
      coverImage: cover,
      date,
      featured: !!def.featured,
      trending: !!def.trending,
      contentType: def.contentType,
      allowComments: true,
      category: { _type: 'reference', _ref: catIds[def.category] },
      tags: def.tags.map((t, index) => ({
        _key: `${def.slug}-tag-${index + 1}`,
        _type: 'reference',
        _ref: tagIds[t],
      })),
      author: { _type: 'reference', _ref: authorIds[def.author] },
      coAuthors: [],
      productMentions: content.some((b) => b._type === 'productCard')
        ? [
            {
              _key: `${def.slug}-product-mention-1`,
              _type: 'reference',
              _ref: productIds[
                content
                  .find((b) => b._type === 'productCard')
                  ?.product?._ref?.replace('product-', '')
              ],
            },
          ]
        : [],
      content,
    })
    console.log('  post:', def.slug)
  }

  // Navigation
  await client.createOrReplace({
    _id: 'navigation-main',
    _type: 'navigation',
    title: 'Main navigation',
    items: navItems,
    footer: footerGroups.map((group, groupIndex) => ({
      ...group,
      _key: `footer-group-${groupIndex + 1}`,
      _type: 'object',
      links: group.links.map((link, linkIndex) => ({
        ...link,
        _key: `footer-group-${groupIndex + 1}-link-${linkIndex + 1}`,
        _type: 'object',
      })),
    })),
  })
  console.log('  navigation: main')

  // Settings
  await client.createOrReplace({
    _id: 'settings-site',
    _type: 'settings',
    title: 'Apple Magic Blog',
    tagline: 'The magic of Apple, decoded',
    newsletter: {
      title: 'Get the Magic delivered',
      description:
        'The best Apple news, guides and deals in Africa. A few emails a week, zero spam.',
      enabled: true,
    },
    seoDefaults: {
      titleSuffix: ' — Apple Magic Blog',
      organizationName: 'Apple Magic Blog',
      twitterHandle: 'AppleMagicBlog',
    },
    analytics: {},
    footer: {
      aboutText:
        'Apple Magic Blog is the leading destination for Apple news, reviews and buying guides in Africa. Independently written, beautifully designed.',
      copyright: 'Copyright © Apple Magic Blog. All rights reserved.',
      email: 'hello@applemagic.blog',
    },
  })
  console.log('  settings: site')

  // Pages
  for (const def of pagesDef) {
    await client.createOrReplace({
      _id: `page-${def.slug}`,
      _type: 'page',
      title: def.title,
      slug: { _type: 'slug', current: def.slug },
      excerpt: def.seoDescription,
      seoTitle: def.title,
      seoDescription: def.seoDescription,
      content: pageContent(def.slug),
    })
    console.log('  page:', def.slug)
  }

  // Publish any draft-transactions already handled via createOrReplace (auto-published).
  console.log('Seeding complete.')
}

main().catch((e) => {
  console.error('SEED ERROR:', e)
  process.exit(1)
})
