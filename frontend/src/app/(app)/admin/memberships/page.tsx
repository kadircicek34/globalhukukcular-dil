'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  Check,
  Eye,
  FileText,
  GraduationCap,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  UserRound,
  X,
} from 'lucide-react'
import { AdminNav } from '@/components/admin/AdminNav'
import { AdminPageHeader, AdminPanel } from '@/components/admin/AdminShell'
import { apiFetch } from '@/lib/api'

type MembershipStatus = 'pending' | 'approved' | 'rejected'

interface MembershipApplication {
  id: number
  username: string
  email: string | null
  display_name: string
  birth_date: string | null
  law_status: string | null
  law_school: string | null
  graduation_year: number | null
  phone: string | null
  membership_status: MembershipStatus
  membership_note: string | null
  document_name: string | null
  document_mime: string | null
  application_submitted_at: string | null
  created_at: string
}

interface MembershipListResponse {
  items: MembershipApplication[]
  total: number
  page: number
  page_size: number
}

const statusLabels: Record<MembershipStatus, string> = {
  pending: 'Onay bekliyor',
  approved: 'Onaylandı',
  rejected: 'Reddedildi',
}

const statusClasses: Record<MembershipStatus, string> = {
  pending: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  approved: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  rejected: 'border-red-500/40 bg-red-500/10 text-red-300',
}

function formatDate(value: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function lawLabel(status: string | null): string {
  if (status === 'student') return 'Hukuk öğrencisi'
  if (status === 'graduate') return 'Hukuk mezunu'
  return '—'
}

export default function AdminMembershipsPage() {
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>(
    'pending'
  )
  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<MembershipListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<number | null>(null)
  const [rejectTarget, setRejectTarget] = useState<MembershipApplication | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectError, setRejectError] = useState('')
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({
        page: String(page),
        page_size: '20',
      })
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (appliedSearch.trim()) params.set('q', appliedSearch.trim())
      const response = await apiFetch(`/api/admin/memberships?${params.toString()}`)
      if (!response.ok) throw new Error('load failed')
      setData((await response.json()) as MembershipListResponse)
    } catch {
      setError('Üyelik başvuruları yüklenemedi. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }, [appliedSearch, page, statusFilter])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(''), 4000)
    return () => window.clearTimeout(timer)
  }, [notice])

  const pendingCount = useMemo(
    () => (data?.items ?? []).filter((item) => item.membership_status === 'pending').length,
    [data]
  )

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / (data?.page_size ?? 20)))

  async function approve(item: MembershipApplication) {
    const confirmed = window.confirm(
      `${item.display_name} adlı başvuruyu onaylıyorsunuz. Üye onaydan sonra giriş yapabilecek.`
    )
    if (!confirmed) return
    setBusyId(item.id)
    setError('')
    try {
      const response = await apiFetch(`/api/admin/memberships/${item.id}/approve`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('approve failed')
      setNotice(`${item.display_name} üyeliği onaylandı.`)
      await load()
    } catch {
      setError('Üyelik onaylanamadı. Lütfen tekrar deneyin.')
    } finally {
      setBusyId(null)
    }
  }

  async function openDocument(item: MembershipApplication) {
    if (!item.document_name) return
    setBusyId(item.id)
    setError('')
    try {
      const response = await apiFetch(`/api/admin/memberships/${item.id}/document`)
      if (!response.ok) throw new Error('document failed')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank', 'noopener,noreferrer')
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch {
      setError('Belge açılamadı. Dosya sunucuda bulunamadı veya yetkiniz yok.')
    } finally {
      setBusyId(null)
    }
  }

  async function submitReject() {
    if (!rejectTarget) return
    if (rejectReason.trim().length < 3) {
      setRejectError('Ret gerekçesi en az 3 karakter olmalıdır.')
      return
    }
    setBusyId(rejectTarget.id)
    setRejectError('')
    try {
      const response = await apiFetch(
        `/api/admin/memberships/${rejectTarget.id}/reject`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: rejectReason.trim() }),
        }
      )
      if (!response.ok) throw new Error('reject failed')
      setNotice(`${rejectTarget.display_name} başvurusu reddedildi.`)
      setRejectTarget(null)
      setRejectReason('')
      await load()
    } catch {
      setRejectError('Başvuru reddedilemedi. Lütfen tekrar deneyin.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-6">
      <AdminPageHeader eyebrow="Admin / Üyelikler" title="Üyelik başvuruları" />
      <AdminNav />

      <div className="grid gap-3 sm:grid-cols-3">
        <AdminPanel className="p-4">
          <p className="text-fl-label text-fl-muted-2 font-mono uppercase tracking-widest">
            Bekleyen (sayfada)
          </p>
          <p className="text-fl-fg mt-1 text-2xl font-bold">{pendingCount}</p>
        </AdminPanel>
        <AdminPanel className="p-4">
          <p className="text-fl-label text-fl-muted-2 font-mono uppercase tracking-widest">
            Toplam kayıt
          </p>
          <p className="text-fl-fg mt-1 text-2xl font-bold">{data?.total ?? '—'}</p>
        </AdminPanel>
        <AdminPanel className="p-4">
          <p className="text-fl-label text-fl-muted-2 font-mono uppercase tracking-widest">
            Belge güvenliği
          </p>
          <p className="text-fl-muted-1 mt-2 flex items-center gap-2 text-xs">
            <ShieldCheck className="size-4 text-emerald-400" /> Yalnızca admin erişimi
          </p>
        </AdminPanel>
      </div>

      <AdminPanel className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1">
            {(
              [
                ['pending', 'Bekleyen'],
                ['approved', 'Onaylı'],
                ['rejected', 'Reddedilen'],
                ['all', 'Tümü'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setStatusFilter(value)
                  setPage(1)
                }}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                  statusFilter === value
                    ? 'border-fl-accent bg-fl-accent text-fl-accent-fg'
                    : 'border-fl-border text-fl-muted-2 hover:border-fl-border-2 hover:text-fl-fg'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              setAppliedSearch(search)
              setPage(1)
            }}
          >
            <div className="relative">
              <Search className="text-fl-muted-3 absolute left-3 top-1/2 size-3.5 -translate-y-1/2" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Ad, e-posta veya okul ara"
                className="border-fl-border bg-fl-bg text-fl-fg placeholder:text-fl-muted-3 focus:border-fl-accent w-64 rounded-full border py-2 pl-9 pr-3 text-xs outline-none"
              />
            </div>
            <button
              type="submit"
              className="border-fl-border text-fl-muted-1 hover:text-fl-fg rounded-full border px-4 py-2 text-xs font-semibold"
            >
              Ara
            </button>
            <button
              type="button"
              onClick={() => void load()}
              className="border-fl-border text-fl-muted-1 hover:text-fl-fg rounded-full border p-2"
              aria-label="Yenile"
            >
              <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </form>
        </div>
      </AdminPanel>

      {notice && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {notice}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading && !data ? (
        <AdminPanel className="flex items-center justify-center gap-2 p-12 text-sm text-fl-muted-2">
          <Loader2 className="size-4 animate-spin" /> Başvurular yükleniyor…
        </AdminPanel>
      ) : (data?.items.length ?? 0) === 0 ? (
        <AdminPanel className="p-12 text-center">
          <UserCheck className="mx-auto size-8 text-fl-muted-3" />
          <p className="text-fl-fg mt-3 text-sm font-semibold">Bu filtrede başvuru yok</p>
          <p className="text-fl-muted-2 mt-1 text-xs">
            Yeni başvurular geldiğinde burada görünecek.
          </p>
        </AdminPanel>
      ) : (
        <div className="space-y-3">
          {data?.items.map((item) => (
            <AdminPanel key={item.id} className="p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-fl-fg text-base font-semibold">{item.display_name}</h3>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusClasses[item.membership_status]}`}
                    >
                      {statusLabels[item.membership_status]}
                    </span>
                    <span className="text-fl-muted-3 font-mono text-[10px]">
                      GHD-{String(item.id).padStart(5, '0')}
                    </span>
                  </div>
                  <p className="text-fl-muted-2 mt-1 font-mono text-xs">@{item.username}</p>

                  <div className="mt-4 grid gap-x-6 gap-y-2 text-xs sm:grid-cols-2 lg:grid-cols-3">
                    <Info icon={<Mail className="size-3.5" />} label="E-posta" value={item.email ?? '—'} />
                    <Info
                      icon={<CalendarDays className="size-3.5" />}
                      label="Doğum tarihi"
                      value={formatDate(item.birth_date)}
                    />
                    <Info
                      icon={<GraduationCap className="size-3.5" />}
                      label="Hukuk durumu"
                      value={lawLabel(item.law_status)}
                    />
                    <Info
                      icon={<UserRound className="size-3.5" />}
                      label="Okul"
                      value={item.law_school ?? '—'}
                    />
                    <Info
                      icon={<CalendarDays className="size-3.5" />}
                      label="Başvuru"
                      value={formatDate(item.application_submitted_at ?? item.created_at)}
                    />
                    {item.phone && (
                      <Info icon={<Phone className="size-3.5" />} label="Telefon" value={item.phone} />
                    )}
                  </div>

                  {item.membership_note && (
                    <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-300">
                      Ret gerekçesi: {item.membership_note}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void openDocument(item)}
                      disabled={!item.document_name || busyId === item.id}
                      className="border-fl-border text-fl-muted-1 hover:border-fl-accent hover:text-fl-fg inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition disabled:opacity-40"
                    >
                      {busyId === item.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <FileText className="size-3.5" />
                      )}
                      e-Devlet belgesi
                      <Eye className="size-3.5" />
                    </button>
                    <span className="text-fl-muted-3 max-w-[220px] truncate text-[11px]">
                      {item.document_name ?? 'Belge yok'}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 gap-2 lg:flex-col">
                  {item.membership_status !== 'approved' && (
                    <button
                      type="button"
                      onClick={() => void approve(item)}
                      disabled={busyId === item.id}
                      className="inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-500/90 px-4 py-2 text-xs font-bold text-emerald-950 transition hover:bg-emerald-400 disabled:opacity-50"
                    >
                      <Check className="size-3.5" /> Onayla
                    </button>
                  )}
                  {item.membership_status !== 'rejected' && (
                    <button
                      type="button"
                      onClick={() => {
                        setRejectTarget(item)
                        setRejectReason('')
                        setRejectError('')
                      }}
                      disabled={busyId === item.id}
                      className="inline-flex items-center justify-center gap-1.5 rounded-full border border-red-500/40 px-4 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                    >
                      <X className="size-3.5" /> Reddet
                    </button>
                  )}
                </div>
              </div>
            </AdminPanel>
          ))}
        </div>
      )}

      {(data?.total ?? 0) > (data?.page_size ?? 20) && (
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={page <= 1}
            className="border-fl-border text-fl-muted-1 rounded-full border px-4 py-2 text-xs disabled:opacity-40"
          >
            Önceki
          </button>
          <span className="text-fl-muted-2 text-xs">
            Sayfa {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            disabled={page >= totalPages}
            className="border-fl-border text-fl-muted-1 rounded-full border px-4 py-2 text-xs disabled:opacity-40"
          >
            Sonraki
          </button>
        </div>
      )}

      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="border-fl-border bg-fl-surface w-full max-w-md rounded-2xl border p-6 shadow-2xl">
            <p className="text-fl-label text-fl-muted-2 font-mono uppercase tracking-widest">
              Başvuruyu reddet
            </p>
            <h3 className="text-fl-fg mt-1 text-lg font-semibold">
              {rejectTarget.display_name}
            </h3>
            <p className="text-fl-muted-2 mt-2 text-xs leading-5">
              Ret gerekçesi üyeye gösterilmez; yönetici kaydında saklanır. Üye daha sonra
              yeniden değerlendirilebilir.
            </p>
            <textarea
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Örn. e-Devlet belgesi okunamadı veya üyelik kriterlerini karşılamıyor."
              className="border-fl-border bg-fl-bg text-fl-fg placeholder:text-fl-muted-3 focus:border-fl-accent mt-4 w-full resize-none rounded-xl border p-3 text-sm outline-none"
            />
            <div className="mt-1 flex justify-between text-[11px] text-fl-muted-3">
              <span>{rejectError || 'En az 3 karakter'}</span>
              <span>{rejectReason.length}/500</span>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                className="border-fl-border text-fl-muted-1 rounded-full border px-4 py-2 text-xs font-semibold"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => void submitReject()}
                disabled={busyId === rejectTarget.id}
                className="inline-flex items-center gap-1.5 rounded-full bg-red-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-400 disabled:opacity-50"
              >
                {busyId === rejectTarget.id && <Loader2 className="size-3.5 animate-spin" />}
                Reddet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-fl-muted-3 mt-0.5">{icon}</span>
      <span className="min-w-0">
        <span className="text-fl-muted-3 block text-[10px] font-medium uppercase tracking-wider">
          {label}
        </span>
        <span className="text-fl-fg-2 block truncate">{value}</span>
      </span>
    </div>
  )
}
