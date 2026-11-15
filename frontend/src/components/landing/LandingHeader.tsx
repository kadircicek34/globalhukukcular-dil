'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { href: '#platform', label: 'Platform' },
  { href: '#yontem', label: 'Yöntem' },
  { href: '#uyelik', label: 'Üyelik' },
  { href: '#sss', label: 'SSS' },
]

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A24B]'

export function LandingHeader({ hasSession }: { hasSession: boolean }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    const desktopQuery = window.matchMedia('(min-width: 768px)')
    function handleDesktop(event: MediaQueryListEvent) {
      if (event.matches) setOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    desktopQuery.addEventListener('change', handleDesktop)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      desktopQuery.removeEventListener('change', handleDesktop)
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  return (
    <header className="sticky top-0 z-50 border-b border-[#C9A24B]/25 bg-[#0F1E3D]/95 text-[#F7F3EA] shadow-[0_10px_40px_rgba(6,15,33,0.18)] backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <a
          href="#top"
          className={`flex min-w-0 items-center gap-3 rounded-sm ${focusRing}`}
          aria-label="GH Dil ana sayfa"
        >
          <span className="relative flex size-10 shrink-0 items-center justify-center rounded-full ring-1 ring-[#C9A24B]/45">
            <Image
              src="/ghdil-logo.png"
              alt=""
              width={40}
              height={40}
              priority
              className="size-10 rounded-full object-cover"
            />
          </span>
          <span className="min-w-0">
            <span className="font-code block text-[13px] leading-tight font-bold tracking-[0.22em] text-[#F7F3EA] uppercase">
              GH Dil
            </span>
            <span className="mt-1 block truncate font-sans text-[9px] leading-none tracking-[0.12em] text-[#C9BCA2] uppercase sm:text-[10px]">
              Global Hukukçular Derneği
            </span>
          </span>
        </a>

        <nav
          aria-label="Ana gezinme"
          className="hidden items-center gap-7 lg:flex"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`group relative py-2 font-sans text-[13px] tracking-wide text-[#E7DFCE] transition-colors hover:text-[#F7F3EA] ${focusRing}`}
            >
              {link.label}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-[#C9A24B] transition-transform duration-300 group-hover:scale-x-100 motion-reduce:transition-none"
              />
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-5 md:flex">
          {!hasSession && (
            <Link
              href="/login"
              className={`font-sans text-[13px] text-[#E7DFCE] transition-colors hover:text-[#F7F3EA] ${focusRing}`}
            >
              Giriş
            </Link>
          )}
          <Link
            href={hasSession ? '/dashboard' : '/register'}
            className={`group inline-flex items-center gap-2 rounded-sm bg-[#C9A24B] px-5 py-2.5 font-sans text-[12px] font-semibold tracking-[0.08em] text-[#0F1E3D] uppercase shadow-[0_8px_20px_rgba(201,162,75,0.18)] transition-colors hover:bg-[#D8B665] ${focusRing}`}
          >
            {hasSession ? 'Panele Git' : 'Üyelik Başvurusu'}
            <ArrowUpRight
              aria-hidden="true"
              className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
            />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="gh-mobile-menu"
          aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'}
          className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-[#C9A24B]/35 text-[#F7F3EA] transition-colors hover:border-[#C9A24B] md:hidden ${focusRing}`}
        >
          {open ? (
            <X aria-hidden="true" className="size-5" />
          ) : (
            <Menu aria-hidden="true" className="size-5" />
          )}
        </button>
      </div>

      {open && (
        <div
          id="gh-mobile-menu"
          className="border-t border-[#C9A24B]/20 bg-[#0F1E3D] px-4 pt-5 pb-7 sm:px-6 md:hidden"
        >
          <nav aria-label="Mobil gezinme" className="flex flex-col">
            {NAV_LINKS.map((link, index) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`font-display flex items-center justify-between border-b border-[#C9A24B]/15 py-4 text-2xl text-[#F7F3EA] ${focusRing}`}
              >
                {link.label}
                <span
                  aria-hidden="true"
                  className="font-code text-[10px] tracking-[0.2em] text-[#C9A24B]"
                >
                  0{index + 1}
                </span>
              </a>
            ))}
          </nav>

          <div className="mt-6 grid gap-3">
            <Link
              href={hasSession ? '/dashboard' : '/register'}
              onClick={() => setOpen(false)}
              className={`inline-flex items-center justify-center gap-2 bg-[#C9A24B] px-5 py-3.5 font-sans text-xs font-semibold tracking-[0.1em] text-[#0F1E3D] uppercase ${focusRing}`}
            >
              {hasSession ? 'Panele Git' : 'Üyelik Başvurusu'}
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
            {!hasSession && (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className={`inline-flex items-center justify-center border border-[#C9A24B]/45 px-5 py-3.5 font-sans text-xs tracking-[0.1em] text-[#F7F3EA] uppercase ${focusRing}`}
              >
                Giriş Yap
              </Link>
            )}
          </div>

          <p className="mt-6 border-t border-[#C9A24B]/15 pt-5 font-sans text-[10px] tracking-[0.16em] text-[#AFA58F] uppercase">
            Global Hukukçular Derneği · dijital dil platformu
          </p>
        </div>
      )}
    </header>
  )
}
