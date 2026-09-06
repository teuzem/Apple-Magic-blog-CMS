'use client'

import { Menu, Search, X } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { AppleWordmark } from '@/components/brand/AppleWordmark'
import { Link } from '@/i18n/navigation'
import { usePathname } from '@/i18n/navigation'
import type { Category, NavigationItem } from '@/lib/sanity.queries'
import { cn } from '@/lib/utils'

import { DarkModeToggle } from './DarkModeToggle'
import { LanguageSwitcher } from './LanguageSwitcher'
import { SearchModal } from './SearchModal'

interface NavigationProps {
  categories?: Category[]
  navItems?: NavigationItem[]
}

/**
 * Apple-style sticky navigation: blurred backdrop, mega menu dropdowns,
 * keyboard search, dark mode toggle and language switcher.
 */
export function Navigation({
  categories = [],
  navItems = [],
}: NavigationProps) {
  const t = useTranslations('nav')
  const locale = useLocale()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeMega, setActiveMega] = useState<string | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mega menu & mobile menu on route change
  useEffect(() => {
    setActiveMega(null)
    setMenuOpen(false)
  }, [pathname])

  // Keyboard shortcut: Cmd/Ctrl + K opens search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const links = [
    { label: t('blog'), href: '/posts' },
    { label: t('categories'), href: '/categories' },
    { label: t('news'), href: '/categories/news' },
    { label: t('iphone'), href: '/categories/iphone' },
    { label: t('ipad'), href: '/categories/ipad' },
    { label: t('mac'), href: '/categories/mac' },
    { label: t('watch'), href: '/categories/apple-watch' },
    { label: t('airpods'), href: '/categories/airpods' },
    { label: t('comparisons'), href: '/categories/comparisons' },
    { label: t('guides'), href: '/categories/buying-guides' },
  ]

  const defaults = links.map((link) => ({
    label: link.label,
    url: link.href,
  }))
  const required = defaults.slice(0, 2)
  const sourceItems = navItems.length ? navItems : defaults
  const navLinkItems = [
    ...required.map(
      (fallback) =>
        sourceItems.find((item) => item.url === fallback.url) || fallback,
    ),
    ...sourceItems.filter(
      (item) => !required.some((requiredItem) => requiredItem.url === item.url),
    ),
  ]

  const itemLabel = (item: NavigationItem) =>
    locale === 'fr' ? item.labelFr || item.label : item.label

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-white/80 backdrop-blur-apple dark:bg-black/80'
          : 'bg-white/60 backdrop-blur-apple dark:bg-black/60',
      )}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-12 min-w-0 w-full max-w-[1320px] items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6 lg:px-8"
      >
        {/* Mobile menu toggle */}
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-gray-7 md:hidden dark:text-white dark:hover:bg-gray-1"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Logo */}
        <Link href="/" aria-label="Apple Magic Blog home" className="shrink-0">
          <AppleWordmark className="text-ink dark:text-white" />
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 md:flex">
          {navLinkItems.slice(0, 7).map((item) => (
            <li key={item.url} className="relative">
              <Link
                href={item.url as any}
                className="rounded-md px-3 py-2 text-[0.8125rem] text-gray-3 transition-colors hover:text-ink dark:text-gray-4 dark:hover:text-white"
              >
                {itemLabel(item)}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Open search"
            onClick={() => setSearchOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-gray-7 dark:text-white dark:hover:bg-gray-1"
          >
            <Search size={19} />
          </button>
          <DarkModeToggle className="relative" />
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          'overflow-hidden bg-white/95 backdrop-blur-apple transition-all duration-300 md:hidden dark:bg-black/95',
          menuOpen ? 'max-h-[70vh] opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <ul className="flex max-h-[calc(100svh-3rem)] flex-col gap-1 overflow-y-auto px-4 pb-6 pt-2 sm:px-6">
          {navLinkItems.map((item) => (
            <li key={item.url}>
              <Link
                href={item.url as any}
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-3 text-[1.0625rem] font-medium text-ink transition-colors hover:bg-gray-7 dark:text-white dark:hover:bg-gray-1"
              >
                {itemLabel(item)}
              </Link>
            </li>
          ))}
          <li className="mt-2 border-t border-gray-6 pt-3 dark:border-gray-2">
            <div className="flex items-center justify-between px-3">
              <span className="text-xs text-gray-3">
                {locale === 'fr' ? 'Langue' : 'Language'}
              </span>
              <LanguageSwitcher />
            </div>
          </li>
        </ul>
      </div>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}
