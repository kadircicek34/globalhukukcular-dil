'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  LayoutDashboard,
  MessageSquareText,
  Settings,
  Star,
  UserCheck,
  Users,
} from 'lucide-react'
import { apiFetch } from '@/lib/api'

const items = [
  { href: '/admin', key: 'overview', icon: LayoutDashboard },
  { href: '/admin/users', key: 'users', icon: Users },
  { href: '/admin/memberships', key: 'memberships', icon: UserCheck, label: 'Üyelikler' },
  { href: '/admin/feedback', key: 'feedback', icon: MessageSquareText },
  { href: '/admin/reviews', key: 'reviews', icon: Star },
  { href: '/admin/system', key: 'system', icon: Settings },
] as const

export function AdminNav() {
  const pathname = usePathname()
  const t = useTranslations('admin')
  const [pendingMemberships, setPendingMemberships] = useState<number | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    apiFetch('/api/admin/stats', { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!controller.signal.aborted && data) {
          setPendingMemberships(
            typeof data.memberships_pending === 'number'
              ? data.memberships_pending
              : null
          )
        }
      })
      .catch(() => {})
    return () => controller.abort()
  }, [])

  return (
    <div className="border-fl-border bg-fl-surface flex flex-wrap items-center gap-1 border p-1">
      {items.map((item) => {
        const Icon = item.icon
        const active =
          pathname === item.href ||
          (item.href !== '/admin' && pathname.startsWith(`${item.href}/`))
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex min-h-9 items-center gap-2 px-3 py-2 font-mono text-xs tracking-widest uppercase transition-colors ${
              active
                ? 'bg-fl-bg text-fl-fg border-fl-accent border-l-2'
                : 'text-fl-muted-2 hover:bg-fl-bg hover:text-fl-fg border-l-2 border-transparent'
            }`}
          >
            <Icon className="size-3.5" aria-hidden="true" />
            <span>{'label' in item ? item.label : t(item.key)}</span>
            {item.key === 'memberships' && pendingMemberships !== null && (
              <span
                className={`ml-1 min-w-5 rounded-full px-1.5 py-0.5 text-center font-mono text-[10px] font-bold ${
                  pendingMemberships > 0
                    ? 'bg-amber-500 text-amber-950'
                    : 'bg-fl-bg text-fl-muted-2 border-fl-border border'
                }`}
                aria-label={`${pendingMemberships} bekleyen üyelik`}
              >
                {pendingMemberships}
              </span>
            )}
          </Link>
        )
      })}
    </div>
  )
}
