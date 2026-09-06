'use client'

import { useEffect, useState } from 'react'

import {
  currencyFromCountry,
  detectCurrency,
  fetchCurrencyRates,
} from '@/lib/currency'

/** Source currency stored in the CMS (we always author prices in FCFA). */
const BASE_CURRENCY = 'XAF'

/** Format a numeric amount with the current browser locale + currency. */
function formatValue(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${currency} ${Math.round(amount).toLocaleString()}`
  }
}

/* ---- Shared, module-level rate cache + subscribers ---- */

interface RatesPayload {
  currency: string
  rates: Record<string, number> | null
}

let cachedRates: Record<string, number> | null = null
let ratesRequested = false
const subscribers = new Set<(payload: RatesPayload) => void>()

function emit(): void {
  const currency = detectCurrency(
    typeof navigator !== 'undefined' ? navigator.language : undefined,
    typeof Intl !== 'undefined'
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : undefined,
  )
  for (const fn of subscribers) fn({ currency, rates: cachedRates })
}

async function ensureRatesLoaded(): Promise<void> {
  if (ratesRequested) return
  ratesRequested = true
  cachedRates = await fetchCurrencyRates('USD')
  emit()
}

interface LocalCurrencyState {
  currency: string
  rate: number | null
  ready: boolean
  /** Convert an FCFA (authoring) amount into the local currency and format it. */
  format: (xaf: number) => string
  /** Format an amount already expressed in the given (or local) currency. */
  formatNative: (amount: number, currency?: string) => string
}

/**
 * Resolve the visitor's local currency and its rate relative to FCFA via a
 * free, key-less exchange-rate API. Defaults to FCFA when unknown/unreachable.
 */
export function useLocalCurrency(): LocalCurrencyState {
  const browserCurrency = () =>
    detectCurrency(
      typeof navigator !== 'undefined' ? navigator.language : undefined,
      typeof Intl !== 'undefined'
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : undefined,
    )
  const [currency, setCurrency] = useState<string>(() => browserCurrency())
  const [rate, setRate] = useState<number | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const handle = (payload: RatesPayload) => {
      setCurrency(payload.currency)
      if (payload.rates) {
        const xafRate = payload.rates[BASE_CURRENCY]
        const targetRate = payload.rates[payload.currency]
        setRate(
          xafRate && targetRate && payload.currency !== BASE_CURRENCY
            ? targetRate / xafRate
            : payload.currency === BASE_CURRENCY
              ? 1
              : null,
        )
      } else {
        setRate(null)
      }
      setReady(true)
    }

    subscribers.add(handle)
    setCurrency(browserCurrency())

    // Language alone is not a reliable location signal: Cameroon users often
    // have a French (fr-FR) browser but should see XAF, not EUR.
    fetch('https://ipapi.co/json/')
      .then((response) => (response.ok ? response.json() : null))
      .then((location) => {
        const geoCurrency = currencyFromCountry(location?.country_code)
        if (!location?.country_code) return
        setCurrency(geoCurrency)
        if (cachedRates) {
          const xafRate = cachedRates[BASE_CURRENCY]
          const targetRate = cachedRates[geoCurrency]
          setRate(
            xafRate && targetRate && geoCurrency !== BASE_CURRENCY
              ? targetRate / xafRate
              : geoCurrency === BASE_CURRENCY
                ? 1
                : null,
          )
        }
      })
      .catch(() => undefined)

    if (cachedRates) {
      handle({ currency, rates: cachedRates })
    } else {
      // If we never resolved, start the shared fetch.
      ensureRatesLoaded().then(() => {
        if (cachedRates) handle({ currency, rates: cachedRates })
      })
    }

    return () => {
      subscribers.delete(handle)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const currencyCode = currency || 'XAF'

  return {
    currency: currencyCode,
    rate,
    ready,
    format: (xaf) => {
      if (!rate) return formatValue(xaf, BASE_CURRENCY)
      return formatValue(xaf * rate, currencyCode)
    },
    formatNative: (amount, c = currencyCode) => formatValue(amount, c),
  }
}
