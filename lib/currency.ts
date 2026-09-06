/**
 * Local pricing helpers.
 *
 * Source of truth in the CMS is FCFA (XAF) — default for our Cameroon
 * market. We convert on the client to the visitor's local currency using
 * the free open-source exchange-rate API (no key, no cost, CORS-enabled).
 *
 * If the visitor is in a XOF/XAF zone (Cameroon, Senegal, Ivory Coast,
 * Mali, etc.) or the rates API is unreachable, we fall back to FCFA.
 */

export const DEFAULT_CURRENCY = 'XAF'

/** ISO → locale string for formatting (e.g. XAF → fr-CM). */
const CURRENCY_LOCALES: Record<string, string> = {
  XAF: 'fr-CM',
  XOF: 'fr-SN',
  USD: 'en-US',
  EUR: 'fr-FR',
  ZAR: 'en-ZA',
  KES: 'en-KE',
  NGN: 'en-NG',
  EGP: 'ar-EG',
  GHS: 'en-GH',
  GBP: 'en-GB',
  CNY: 'zh-CN',
  JPY: 'ja-JP',
}

/** FCFA territories — these users always see the FCFA default price. */
const FCFA_TERRITORIES = [
  'cm',
  'sn',
  'ci',
  'ml',
  'bj',
  'bf',
  'tg',
  'ne',
  'ga',
  'gq',
]

/** Western Africa / USD map for a quick local currency guess from BCP-47 tag. */
const TAG_TO_CURRENCY: Record<string, string> = {
  'en-US': 'USD',
  'en-GB': 'GBP',
  'en-CA': 'USD',
  'fr-FR': 'EUR',
  'en-ZA': 'ZAR',
  'en-KE': 'KES',
  'en-NG': 'NGN',
  'ar-EG': 'EGP',
  'en-GH': 'GHS',
  'zh-CN': 'CNY',
  'ja-JP': 'JPY',
  cm: 'XAF',
  sn: 'XOF',
  ci: 'XOF',
  ml: 'XOF',
  bj: 'XOF',
  bf: 'XOF',
  tg: 'XOF',
  ne: 'XOF',
  ga: 'XAF',
  gq: 'XAF',
  fr: 'EUR',
  en: 'USD',
}

const TIMEZONE_TO_CURRENCY: Record<string, string> = {
  'Africa/Douala': 'XAF',
  'Africa/Libreville': 'XAF',
  'Africa/Malabo': 'XAF',
  'Africa/Brazzaville': 'XAF',
  'Africa/Abidjan': 'XOF',
  'Africa/Dakar': 'XOF',
  'Africa/Bamako': 'XOF',
  'Africa/Lagos': 'NGN',
  'Africa/Accra': 'GHS',
  'Africa/Nairobi': 'KES',
  'Africa/Johannesburg': 'ZAR',
  'Africa/Cairo': 'EGP',
  'Europe/Paris': 'EUR',
  'Europe/London': 'GBP',
  'America/New_York': 'USD',
  'America/Los_Angeles': 'USD',
  'America/Toronto': 'USD',
  'Asia/Tokyo': 'JPY',
  'Asia/Shanghai': 'CNY',
}

/** Best-effort local currency from browser timezone and locale. */
export function detectCurrency(language?: string, timeZone?: string): string {
  if (timeZone && TIMEZONE_TO_CURRENCY[timeZone]) {
    return TIMEZONE_TO_CURRENCY[timeZone]
  }
  const tag = (language || '').toLowerCase()
  if (!tag) return DEFAULT_CURRENCY
  if (TAG_TO_CURRENCY[tag]) return TAG_TO_CURRENCY[tag]

  const region = tag.split('-')[1] || tag.split('_')[1]
  const country = (region || tag.split('-')[0] || '').toLowerCase()
  if (FCFA_TERRITORIES.includes(country)) {
    return country === 'cm' || country === 'ga' || country === 'gq'
      ? 'XAF'
      : 'XOF'
  }
  if (TAG_TO_CURRENCY[country]) return TAG_TO_CURRENCY[country]
  return DEFAULT_CURRENCY
}

/** Map an ISO country code returned by an IP geolocation service to currency. */
export function currencyFromCountry(countryCode?: string): string {
  const country = (countryCode || '').trim().toLowerCase()
  if (FCFA_TERRITORIES.includes(country)) {
    return ['cm', 'ga', 'gq'].includes(country) ? 'XAF' : 'XOF'
  }
  return (
    (
      {
        us: 'USD',
        ca: 'USD',
        gb: 'GBP',
        fr: 'EUR',
        de: 'EUR',
        es: 'EUR',
        it: 'EUR',
        pt: 'EUR',
        za: 'ZAR',
        ke: 'KES',
        ng: 'NGN',
        eg: 'EGP',
        gh: 'GHS',
        jp: 'JPY',
        cn: 'CNY',
      } as Record<string, string>
    )[country] || DEFAULT_CURRENCY
  )
}

export const CURRENCY_CODE_TO_LOCALE: Record<string, string> = CURRENCY_LOCALES

/** Format a numeric amount in a currency + locale. */
export function formatCurrency(
  amount: number,
  currency: string = DEFAULT_CURRENCY,
  locale?: string,
): string {
  const safeCurr = currency || DEFAULT_CURRENCY
  const safeLocale = locale || CURRENCY_LOCALES[safeCurr] || 'fr-CM'
  try {
    return new Intl.NumberFormat(safeLocale, {
      style: 'currency',
      currency: safeCurr,
      maximumFractionDigits: safeCurr === 'XAF' || safeCurr === 'XOF' ? 0 : 0,
    }).format(amount)
  } catch {
    return `${safeCurr} ${Math.round(amount).toLocaleString()}`
  }
}

/**
 * Fetch USD→currency rates from the free open.er-api.com endpoint.
 * Returns a map of currency code → rate relative to USD, or null on failure.
 */
export async function fetchCurrencyRates(
  base = 'USD',
): Promise<Record<string, number> | null> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 6000)
    const res = await fetch(`https://open.er-api.com/v6/latest/${base}`, {
      signal: controller.signal,
    })
    clearTimeout(timer)
    if (!res.ok) return null
    const data = await res.json()
    const rates = data?.rates
    if (data?.result !== 'success' || !rates || typeof rates !== 'object') {
      return null
    }
    return rates as Record<string, number>
  } catch {
    return null
  }
}

export interface CurrencyRateMap {
  currency: string
  rate: number
}
