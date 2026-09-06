export const SITE = {
  name: 'Apple Magic Blog',
  shortName: 'Apple Magic',
  tagline: {
    en: 'The magic of Apple, decoded',
    fr: "La magie d'Apple, décryptée",
  },
  url:
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_URL ||
    'https://applemagic.blog',
  description: {
    en: `Apple Magic Blog is the leading destination for everything Apple in Africa — in-depth reviews, buying guides, comparisons, news and how-tos for iPhone, iPad, Mac, Apple Watch, AirPods and more.`,
    fr: `Apple Magic Blog est la destination de référence pour tout ce qui concerne Apple en Afrique — tests approfondis, guides d'achat, comparatifs, actualités et tutoriels pour iPhone, iPad, Mac, Apple Watch, AirPods et plus encore.`,
  },
  locales: ['en', 'fr'] as const,
  defaultLocale: 'en',
  blogPath: '/posts',
  categoriesPath: '/categories',
} as const

export const DEFAULT_CATEGORIES = [
  { title: 'iPhone', slug: 'iphone', color: '#2997ff' },
  { title: 'iPad', slug: 'ipad', color: '#ff9f0a' },
  { title: 'Mac', slug: 'mac', color: '#5e5ce6' },
  { title: 'Apple Watch', slug: 'apple-watch', color: '#ff375f' },
  { title: 'AirPods', slug: 'airpods', color: '#34c759' },
  { title: 'Vision Pro', slug: 'vision-pro', color: '#bf5af2' },
  { title: 'Software', slug: 'software', color: '#0071e3' },
  { title: 'Buying Guides', slug: 'buying-guides', color: '#ff9f0a' },
  { title: 'Comparisons', slug: 'comparisons', color: '#ff453a' },
  { title: 'News', slug: 'news', color: '#86868b' },
] as const

export const AFRICAN_CURRENCIES = [
  { code: 'ZAR', name: 'South African Rand', country: 'South Africa' },
  { code: 'KES', name: 'Kenyan Shilling', country: 'Kenya' },
  { code: 'NGN', name: 'Nigerian Naira', country: 'Nigeria' },
  { code: 'EGP', name: 'Egyptian Pound', country: 'Egypt' },
  { code: 'GHS', name: 'Ghanaian Cedi', country: 'Ghana' },
  { code: 'TZS', name: 'Tanzanian Shilling', country: 'Tanzania' },
  { code: 'MAD', name: 'Moroccan Dirham', country: 'Morocco' },
  { code: 'XOF', name: 'West African CFA', country: 'West Africa' },
] as const

export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/applemagicblog',
  facebook: 'https://facebook.com/applemagicblog',
  instagram: 'https://instagram.com/applemagicblog',
  youtube: 'https://youtube.com/@applemagicblog',
  tiktok: 'https://tiktok.com/@applemagicblog',
} as const

export const MISCELLANEOUS = {
  email: 'hello@applemagic.com',
  supportEmail: 'support@applemagic.com',
  brandColor: '#06c',
  magicGradientStart: '#ff375f',
  magicGradientEnd: '#2997ff',
} as const
