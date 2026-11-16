'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

const COOKIE_KEY = 'fl_cookie_consent'

export function CookieBanner() {
  const t = useTranslations('cookieBanner')
  const [visible, setVisible] = useState(false)
  const bannerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      if (!localStorage.getItem(COOKIE_KEY)) {
        setVisible(true)
      }
    } catch {
      // localStorage unavailable (SSR, private mode) — don't show
    }
  }, [])

  useEffect(() => {
    if (!visible) {
      document.documentElement.style.removeProperty('--cookie-banner-height')
      return
    }
    const update = () => {
      const height = bannerRef.current?.offsetHeight ?? 0
      document.documentElement.style.setProperty('--cookie-banner-height', `${height}px`)
    }
    update()
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('resize', update)
      document.documentElement.style.removeProperty('--cookie-banner-height')
    }
  }, [visible])

  function accept() {
    try {
      localStorage.setItem(COOKIE_KEY, 'accepted')
    } catch {
      /* ignore */
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      ref={bannerRef}
      className="border-fl-border bg-fl-surface fixed right-0 bottom-0 left-0 z-50 border-t"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-4 px-6 py-4 sm:flex-row sm:items-center">
        <p className="text-fl-fg-2 flex-1 font-mono text-xs leading-relaxed">
          {t('message')}{' '}
          <Link
            href="/privacy"
            className="text-fl-fg hover:text-fl-fg-bright underline"
          >
            {t('learnMore')}
          </Link>
        </p>
        <button
          onClick={accept}
          className="bg-fl-fg text-fl-bg hover:bg-fl-fg-bright flex-shrink-0 px-6 py-2 font-mono text-sm tracking-widest whitespace-nowrap uppercase transition-colors"
        >
          {t('accept')}
        </button>
      </div>
    </div>
  )
}
