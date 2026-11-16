'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  FileText,
  GraduationCap,
  Loader2,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  UploadCloud,
  UserRound,
} from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { useAuthStore } from '@/store/auth'

const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024
const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']

type LawStatus = 'student' | 'graduate'

interface ApplicationResult {
  status: 'pending' | 'approved' | 'rejected'
  application_id: number
  message: string
}

function minBirthDate(): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 15)
  return d.toISOString().slice(0, 10)
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 102.4) / 10} KB`
  return `${Math.round(bytes / 104857.6) / 10} MB`
}

export default function RegisterPage() {
  const [invite, setInvite] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [lawStatus, setLawStatus] = useState<LawStatus>('student')
  const [lawSchool, setLawSchool] = useState('')
  const [graduationYear, setGraduationYear] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [document, setDocument] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [kvkkAccepted, setKvkkAccepted] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ApplicationResult | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const errorRef = useRef<HTMLDivElement | null>(null)
  const activeRequest = useRef<AbortController | null>(null)

  useEffect(() => {
    setInvite(new URLSearchParams(window.location.search).get('invite'))
    return () => activeRequest.current?.abort()
  }, [])

  useEffect(() => {
    if (!error) return
    errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    errorRef.current?.focus({ preventScroll: true })
  }, [error])

  const chooseDocument = useCallback((file: File | null) => {
    setError('')
    if (!file) {
      setDocument(null)
      return
    }
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('e-Devlet belgesi PDF, JPEG veya PNG olmalıdır.')
      setDocument(null)
      return
    }
    if (file.size > MAX_DOCUMENT_BYTES) {
      setError('Belge en fazla 5 MB olabilir.')
      setDocument(null)
      return
    }
    setDocument(file)
  }, [])

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setError('')
      if (!displayName.trim() || displayName.trim().length < 2) {
        setError('Ad soyad en az 2 karakter olmalıdır.')
        return
      }
      if (!/^[a-zA-Z0-9._-]{3,50}$/.test(username)) {
        setError('Kullanıcı adı 3-50 karakter olmalı; boşluk olmadan yalnızca harf, rakam, nokta, tire ve alt çizgi kullanın.')
        return
      }
      if (displayName.trim().length > 100) {
        setError('Ad soyad en fazla 100 karakter olabilir.')
        return
      }
      if (phone.trim() && (phone.trim().length < 5 || phone.trim().length > 30)) {
        setError('Telefon numarası 5-30 karakter olmalıdır.')
        return
      }
      if (lawSchool.trim().length > 200) {
        setError('Hukuk fakültesi bilgisi en fazla 200 karakter olabilir.')
        return
      }
      if (!email.trim()) {
        setError('E-posta adresi zorunludur.')
        return
      }
      if (!birthDate) {
        setError('Doğum tarihi zorunludur.')
        return
      }
      if (birthDate > minBirthDate()) {
        setError('Üyelik için en az 15 yaşında olmanız gerekir.')
        return
      }
      if (!lawSchool.trim() || lawSchool.trim().length < 2) {
        setError('Hukuk fakültesi / okul bilgisi zorunludur.')
        return
      }
      if (lawStatus === 'graduate' && graduationYear) {
        const year = Number(graduationYear)
        if (!Number.isInteger(year) || year < 1950 || year > new Date().getFullYear()) {
          setError('Mezuniyet yılı geçersiz.')
          return
        }
      }
      if (password !== confirmPassword) {
        setError('Şifreler eşleşmiyor.')
        return
      }
      if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{10,25}$/.test(password)) {
        setError('Şifre 10-25 karakter olmalı; en az bir büyük harf, bir rakam ve bir sembol içermelidir.')
        return
      }
      if (!document) {
        setError('e-Devlet öğrenci veya mezun belgenizi yükleyin.')
        return
      }
      if (!kvkkAccepted || !termsAccepted) {
        setError('KVKK aydınlatma metnini ve üyelik koşullarını onaylamalısınız.')
        return
      }

      setLoading(true)
      activeRequest.current?.abort()
      const controller = new AbortController()
      activeRequest.current = controller
      try {
        const form = new FormData()
        form.append('display_name', displayName.trim())
        form.append('username', username.trim().replace(/\s+/g, '_').toLowerCase())
        form.append('email', email.trim().toLowerCase())
        if (phone.trim()) form.append('phone', phone.trim())
        form.append('birth_date', birthDate)
        form.append('law_status', lawStatus)
        form.append('law_school', lawSchool.trim())
        if (lawStatus === 'graduate' && graduationYear) {
          form.append('graduation_year', graduationYear)
        }
        form.append('password', password)
        form.append('native_language', 'tr')
        form.append('kvkk_accepted', String(kvkkAccepted))
        form.append('terms_accepted', String(termsAccepted))
        form.append('e_devlet_document', document)

        const response = await apiFetch('/api/auth/apply', {
          method: 'POST',
          body: form,
          signal: controller.signal,
        })
        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
          if (response.status === 409) {
            setError(
              data?.detail === 'Username already taken'
                ? 'Bu kullanıcı adı kullanılıyor.'
                : 'Bu e-posta adresiyle daha önce başvuru yapılmış.'
            )
          } else if (response.status === 413) {
            setError('Belge en fazla 5 MB olabilir.')
          } else if (response.status === 400) {
            setError('Belge okunamadı. Geçerli bir PDF, JPEG veya PNG yükleyin.')
          } else if (response.status === 422) {
            const detail = data?.detail
            const field = Array.isArray(detail) ? detail[0]?.loc?.at(-1) : null
            const fieldMessages: Record<string, string> = {
              display_name: 'Ad soyad geçersiz.',
              username: 'Kullanıcı adı geçersiz.',
              email: 'Geçerli bir e-posta adresi girin.',
              phone: 'Telefon numarası geçersiz.',
              birth_date: 'Doğum tarihi geçersiz veya yaş koşulunu karşılamıyor.',
              law_status: 'Hukuk durumu seçin.',
              law_school: 'Hukuk fakültesi bilgisi geçersiz.',
              graduation_year: 'Mezuniyet yılı geçersiz.',
              e_devlet_document: 'e-Devlet belgesi geçersiz.',
              kvkk_accepted: 'KVKK onayı zorunludur.',
              terms_accepted: 'Üyelik koşulları onayı zorunludur.',
            }
            const explicit = typeof detail === 'string' ? detail : null
            setError(
              (field && fieldMessages[String(field)]) ||
                explicit ||
                'Form bilgilerini kontrol edin.'
            )
          } else {
            setError('Başvuru gönderilemedi. Lütfen tekrar deneyin.')
          }
          return
        }
        setResult(data as ApplicationResult)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return
        setError('Bağlantı kurulamadı. Lütfen tekrar deneyin.')
      } finally {
        setLoading(false)
      }
    },
    [
      birthDate,
      confirmPassword,
      displayName,
      document,
      email,
      graduationYear,
      kvkkAccepted,
      lawSchool,
      lawStatus,
      password,
      phone,
      termsAccepted,
      username,
    ]
  )

  if (invite) return <InviteApplication invite={invite} />

  if (result) {
    return (
      <main className="min-h-screen bg-[#081226] px-4 py-10 text-[#0f1e3d] sm:py-16">
        <div className="mx-auto max-w-2xl">
          <Link href="/" className="mb-8 flex items-center justify-center gap-3 text-[#f7f3ea]">
            <Image src="/ghdil-logo.png" alt="GH Dil" width={56} height={56} className="rounded-full ring-1 ring-[#c9a24b]/60" />
            <span className="font-serif text-xl tracking-[0.18em]">GH DİL</span>
          </Link>
          <section className="overflow-hidden rounded-[2rem] border border-[#c9a24b]/40 bg-[#f7f3ea] shadow-2xl">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#c9a24b] via-[#e7cf93] to-[#c9a24b]" />
            <div className="p-7 sm:p-12">
              <div className="flex flex-col items-center text-center">
                <span className="mb-5 flex size-16 items-center justify-center rounded-full bg-[#0f1e3d] text-[#e7cf93]">
                  <CheckCircle2 className="size-8" />
                </span>
                <p className="text-[11px] font-semibold tracking-[0.24em] text-[#8a6a24] uppercase">
                  Başvuru alındı
                </p>
                <h1 className="mt-3 font-serif text-3xl leading-tight text-[#0f1e3d] sm:text-4xl">
                  {result.status === 'approved' ? 'Üyeliğiniz aktif' : 'Başvurunuz alındı'}
                </h1>
                <p className="mt-4 max-w-lg text-sm leading-7 text-[#43506a]">
                  {result.message}
                </p>
                <div className="mt-6 w-full rounded-2xl border border-[#0f1e3d]/10 bg-white/70 p-5 text-left">
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-[#5c6880]">Başvuru numarası</span>
                    <span className="font-mono font-semibold text-[#0f1e3d]">
                      GHD-{String(result.application_id).padStart(5, '0')}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-4 text-sm">
                    <span className="text-[#5c6880]">Durum</span>
                    <span className="rounded-full bg-[#c9a24b]/15 px-3 py-1 text-xs font-semibold text-[#7a5a17]">
                      {result.status === 'approved' ? 'Onaylandı' : 'İnceleme devam ediyor'}
                    </span>
                  </div>
                </div>
                <div className="mt-7 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0f1e3d] px-7 py-3.5 text-sm font-semibold text-[#f7f3ea] transition hover:bg-[#1b3159]"
                  >
                    Hemen giriş yap
                    <ArrowRight className="size-4" />
                  </Link>
                  <a
                    href="https://globalhukukcular.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[#0f1e3d]/20 px-7 py-3.5 text-sm font-semibold text-[#0f1e3d] transition hover:border-[#c9a24b]"
                  >
                    Dernek sitesine git
                  </a>
                </div>
                <p className="mt-6 text-xs leading-6 text-[#5c6880]">
                  Üyeliğiniz incelenirken platformu hemen kullanabilirsiniz. Belgeniz yalnızca
                  yetkili dernek yöneticileri tarafından görüntülenir.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#081226] text-[#0f1e3d]">
      <div className="pointer-events-none fixed inset-0 opacity-40 [background-image:radial-gradient(circle_at_20%_10%,rgba(201,162,75,0.16),transparent_28%),radial-gradient(circle_at_85%_70%,rgba(54,91,145,0.22),transparent_32%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
        <header className="mb-6 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 text-[#f7f3ea]">
            <Image src="/ghdil-logo.png" alt="GH Dil" width={50} height={50} className="rounded-full ring-1 ring-[#c9a24b]/60" />
            <span className="hidden sm:block">
              <span className="block font-serif text-lg tracking-[0.2em]">GH DİL</span>
              <span className="block text-[10px] tracking-[0.16em] text-[#c9a24b] uppercase">
                Global Hukukçular Derneği
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-[#e8e3d6] transition hover:border-[#c9a24b]/60">
              <ArrowLeft className="size-3.5" /> Ana sayfa
            </Link>
            <Link href="/login" className="rounded-full bg-[#c9a24b] px-4 py-2 font-semibold text-[#0f1e3d] transition hover:bg-[#dbb96b]">
              Giriş
            </Link>
          </div>
        </header>

        <div className="grid overflow-hidden rounded-[2rem] border border-[#c9a24b]/35 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] lg:grid-cols-[0.86fr_1.14fr]">
          <aside className="relative overflow-hidden bg-[#0f1e3d] p-7 text-[#f7f3ea] sm:p-10">
            <div className="absolute -right-16 -top-16 size-64 rounded-full border border-[#c9a24b]/20" />
            <div className="absolute -bottom-24 -left-16 size-72 rounded-full border border-[#c9a24b]/10" />
            <div className="relative">
              <p className="text-[10px] font-semibold tracking-[0.26em] text-[#c9a24b] uppercase">
                Üyelere özel platform
              </p>
              <h1 className="mt-4 font-serif text-3xl leading-[1.15] sm:text-4xl">
                Hukuk kariyerinize
                <br />
                <span className="text-[#e7cf93]">küresel bir dil</span> kazandırın.
              </h1>
              <p className="mt-5 max-w-md text-sm leading-7 text-[#cdd4e2]">
                GH Dil, Global Hukukçular Derneği üyeleri için tasarlanmış yapay zekâ destekli
                dil öğrenme platformudur. Başvurunuz dernek yönetimi tarafından incelenir.
              </p>

              <div className="mt-8 space-y-3">
                {[
                  ['Üyelik doğrulaması', 'e-Devlet öğrenci veya mezun belgesi'],
                  ['Hukuk odaklı içerik', 'Mesleki senaryolar ve terminoloji'],
                  ['Kişisel verileriniz güvende', 'Belgeler yalnızca yetkililere açık'],
                ].map(([title, desc]) => (
                  <div key={title} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-[#c9a24b]/15 text-[#e7cf93]">
                      <Check className="size-3.5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#f7f3ea]">{title}</p>
                      <p className="mt-0.5 text-xs leading-5 text-[#aab5c8]">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex items-center gap-3 border-t border-white/10 pt-6">
                <Image src="/ghdil-logo.png" alt="" width={46} height={46} className="rounded-full ring-1 ring-[#c9a24b]/50" />
                <p className="text-xs leading-5 text-[#aab5c8]">
                  “Justitia et Sapientia”
                  <br />
                  <span className="text-[#c9a24b]">Global Hukukçular Derneği</span>
                </p>
              </div>
            </div>
          </aside>

          <section className="bg-[#f7f3ea] p-5 sm:p-8 lg:p-10">
            <div className="mb-7">
              <p className="text-[10px] font-semibold tracking-[0.24em] text-[#8a6a24] uppercase">
                E-Üyelik başvurusu
              </p>
              <h2 className="mt-2 font-serif text-3xl text-[#0f1e3d]">Üyelik başvuru formu</h2>
              <p className="mt-2 text-sm leading-6 text-[#5c6880]">
                Zorunlu alanları doldurun. Başvurunuzu gönderdikten sonra hemen giriş yapabilirsiniz.
              </p>
            </div>

            {error && (
              <div
                ref={errorRef}
                role="alert"
                tabIndex={-1}
                className="mb-5 rounded-xl border border-[#b42318]/25 bg-[#b42318]/8 px-4 py-3 text-sm leading-6 text-[#8a1c12] outline-none"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-7" noValidate>
              <fieldset>
                <legend className="mb-3 flex items-center gap-2 font-serif text-lg text-[#0f1e3d]">
                  <span className="flex size-6 items-center justify-center rounded-full bg-[#0f1e3d] text-[11px] text-[#f7f3ea]">1</span>
                  Kişisel bilgiler
                </legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Ad soyad" required icon={<UserRound className="size-3.5" />}>
                    <input className={inputClass} value={displayName} maxLength={100} onChange={(e) => setDisplayName(e.target.value)} autoComplete="name" placeholder="Adınız ve soyadınız" required />
                  </Field>
                  <Field label="Kullanıcı adı" required icon={<UserRound className="size-3.5" />}>
                    <input className={inputClass} value={username} maxLength={50} onChange={(e) => setUsername(e.target.value)} autoComplete="username" placeholder="ornek.kullanici" required />
                  </Field>
                  <Field label="E-posta" required icon={<Mail className="size-3.5" />}>
                    <input className={inputClass} type="email" value={email} maxLength={255} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="ornek@eposta.com" required />
                  </Field>
                  <Field label="Telefon" icon={<Phone className="size-3.5" />}>
                    <input className={inputClass} type="tel" value={phone} maxLength={30} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="+90 5xx xxx xx xx" />
                  </Field>
                  <Field label="Doğum tarihi" required icon={<CalendarDays className="size-3.5" />}>
                    <input className={inputClass} type="date" value={birthDate} max={minBirthDate()} onChange={(e) => setBirthDate(e.target.value)} required />
                  </Field>
                  <div className="rounded-xl border border-[#0f1e3d]/10 bg-white/60 p-3 text-xs leading-5 text-[#5c6880]">
                    <ShieldCheck className="mb-1 size-4 text-[#8a6a24]" />
                    Doğum tarihi, üyelik yaş koşulu ve dernek kayıtları için kullanılır.
                  </div>
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-3 flex items-center gap-2 font-serif text-lg text-[#0f1e3d]">
                  <span className="flex size-6 items-center justify-center rounded-full bg-[#0f1e3d] text-[11px] text-[#f7f3ea]">2</span>
                  Hukuk eğitimi
                </legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { value: 'student' as const, title: 'Hukuk öğrencisiyim', desc: 'Lisans öğrencisi veya hazırlık' },
                    { value: 'graduate' as const, title: 'Hukuk mezunuyum', desc: 'Mezun, avukat veya akademisyen' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setLawStatus(option.value)}
                      className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                        lawStatus === option.value
                          ? 'border-[#c9a24b] bg-[#c9a24b]/10 shadow-sm'
                          : 'border-[#0f1e3d]/12 bg-white/55 hover:border-[#c9a24b]/60'
                      }`}
                      aria-pressed={lawStatus === option.value}
                    >
                      <span className={`mt-0.5 flex size-5 items-center justify-center rounded-full border ${lawStatus === option.value ? 'border-[#0f1e3d] bg-[#0f1e3d] text-white' : 'border-[#0f1e3d]/25'}`}>
                        {lawStatus === option.value && <Check className="size-3" />}
                      </span>
                      <span>
                        <span className="flex items-center gap-1.5 text-sm font-semibold text-[#0f1e3d]">
                          <GraduationCap className="size-4 text-[#8a6a24]" /> {option.title}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-[#5c6880]">{option.desc}</span>
                      </span>
                    </button>
                  ))}
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="Hukuk fakültesi / okul" required icon={<GraduationCap className="size-3.5" />}>
                    <input className={inputClass} value={lawSchool} maxLength={200} onChange={(e) => setLawSchool(e.target.value)} placeholder="Üniversite ve fakülte adı" required />
                  </Field>
                  {lawStatus === 'graduate' && (
                    <Field label="Mezuniyet yılı" icon={<CalendarDays className="size-3.5" />}>
                      <input className={inputClass} type="number" min={1950} max={new Date().getFullYear()} value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)} placeholder={String(new Date().getFullYear())} />
                    </Field>
                  )}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-3 flex items-center gap-2 font-serif text-lg text-[#0f1e3d]">
                  <span className="flex size-6 items-center justify-center rounded-full bg-[#0f1e3d] text-[11px] text-[#f7f3ea]">3</span>
                  Hesap ve belge
                </legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Şifre" required icon={<LockKeyhole className="size-3.5" />}>
                    <input className={inputClass} type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="En az 10 karakter" required />
                  </Field>
                  <Field label="Şifre tekrar" required icon={<LockKeyhole className="size-3.5" />}>
                    <input className={inputClass} type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" placeholder="Şifrenizi tekrarlayın" required />
                  </Field>
                </div>
                <label className="mt-2 flex w-fit cursor-pointer items-center gap-2 text-xs text-[#5c6880]">
                  <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} className="accent-[#0f1e3d]" />
                  Şifreleri göster
                </label>
                <p className="mt-1 text-[11px] leading-5 text-[#5c6880]">
                  10-25 karakter, en az bir büyük harf, bir rakam ve bir sembol.
                </p>

                <div className="mt-5">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-[#0f1e3d]">
                    <FileText className="size-3.5 text-[#8a6a24]" /> e-Devlet öğrenci / mezun belgesi <span className="text-[#b42318]">*</span>
                  </p>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault()
                      setDragActive(false)
                      chooseDocument(e.dataTransfer.files?.[0] ?? null)
                    }}
                    className={`rounded-2xl border-2 border-dashed p-5 text-center transition ${
                      dragActive ? 'border-[#c9a24b] bg-[#c9a24b]/10' : document ? 'border-[#2f6b4f]/40 bg-[#2f6b4f]/5' : 'border-[#0f1e3d]/20 bg-white/45'
                    }`}
                  >
                    <input
                      ref={inputRef}
                      id="e-devlet-document"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                      className="sr-only"
                      onChange={(e) => chooseDocument(e.target.files?.[0] ?? null)}
                    />
                    {document ? (
                      <div className="flex flex-col items-center gap-1">
                        <CheckCircle2 className="size-7 text-[#2f6b4f]" />
                        <p className="max-w-full truncate text-sm font-semibold text-[#0f1e3d]">{document.name}</p>
                        <p className="text-xs text-[#5c6880]">{formatBytes(document.size)} · Yüklemeye hazır</p>
                        <button type="button" onClick={() => { setDocument(null); if (inputRef.current) inputRef.current.value = '' }} className="mt-1 text-xs font-semibold text-[#8a1c12] underline underline-offset-4">
                          Belgeyi kaldır
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <UploadCloud className="size-8 text-[#8a6a24]" />
                        <button type="button" onClick={() => inputRef.current?.click()} className="text-sm font-semibold text-[#0f1e3d] underline decoration-[#c9a24b] decoration-2 underline-offset-4">
                          Belge seçin
                        </button>
                        <p className="text-xs text-[#5c6880]">veya bu alana sürükleyip bırakın</p>
                        <p className="mt-1 text-[11px] text-[#5c6880]">PDF, JPEG veya PNG · en fazla 5 MB</p>
                      </div>
                    )}
                  </div>
                  <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-5 text-[#5c6880]">
                    <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-[#8a6a24]" />
                    Belgeniz şifreli sunucuda saklanır; yalnızca yetkili dernek yöneticileri
                    üyelik doğrulaması için görüntüleyebilir.
                  </p>
                </div>
              </fieldset>

              <div className="space-y-3 rounded-xl border border-[#0f1e3d]/10 bg-white/55 p-4">
                <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-5 text-[#43506a]">
                  <input type="checkbox" checked={kvkkAccepted} onChange={(e) => setKvkkAccepted(e.target.checked)} className="mt-0.5 size-4 accent-[#0f1e3d]" />
                  <span>
                    <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#0f1e3d] underline decoration-[#c9a24b] underline-offset-2">KVKK aydınlatma metnini</Link>{' '}
                    okudum; kişisel verilerimin üyelik süreci kapsamında işlenmesini onaylıyorum.
                  </span>
                </label>
                <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-5 text-[#43506a]">
                  <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-0.5 size-4 accent-[#0f1e3d]" />
                  <span>
                    <Link href="/terms" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#0f1e3d] underline decoration-[#c9a24b] underline-offset-2">Üyelik koşullarını</Link>{' '}
                    ve dernek üyelik esaslarını kabul ediyorum.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0f1e3d] px-7 py-4 text-sm font-semibold text-[#f7f3ea] shadow-[0_14px_30px_-12px_rgba(15,30,61,0.7)] transition hover:bg-[#1b3159] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : null}
                {loading ? 'Başvuru gönderiliyor…' : 'Üyelik başvurusunu gönder'}
                {!loading && <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />}
              </button>
              <p className="text-center text-[11px] leading-5 text-[#5c6880]">
                Başvurunuz onaylanana kadar platforma giriş yapılamaz. Sorularınız için{' '}
                <a href="https://globalhukukcular.com/iletisim" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#0f1e3d] underline underline-offset-2">
                  dernek ile iletişime geçin
                </a>.
              </p>
            </form>
          </section>
        </div>
      </div>
    </main>
  )
}

const inputClass =
  'w-full rounded-xl border border-[#0f1e3d]/15 bg-white/80 px-3.5 py-2.5 text-sm text-[#0f1e3d] outline-none transition placeholder:text-[#7b8497] focus:border-[#c9a24b] focus:ring-2 focus:ring-[#c9a24b]/20'

function Field({
  label,
  required,
  icon,
  children,
}: {
  label: string
  required?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-[#0f1e3d]">
        {icon}
        {label}
        {required && <span className="text-[#b42318]">*</span>}
      </span>
      {children}
    </label>
  )
}

function InviteApplication({ invite }: { invite: string }) {
  const router = useRouter()
  const startSession = useAuthStore((s) => s.startSession)
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (!displayName.trim() || displayName.trim().length < 2) {
      setError('Ad soyad en az 2 karakter olmalıdır.')
      return
    }
    if (!/^[a-zA-Z0-9._-]{3,50}$/.test(username)) {
      setError('Kullanıcı adı 3-50 karakter olmalı; boşluk kullanmayın.')
      return
    }
    if (!email.trim()) {
      setError('E-posta adresi zorunludur.')
      return
    }
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.')
      return
    }
    if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{10,25}$/.test(password)) {
      setError(
        'Şifre 10-25 karakter olmalı; en az bir büyük harf, bir rakam ve bir sembol içermelidir.'
      )
      return
    }
    setLoading(true)
    try {
      const response = await apiFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.toLowerCase(),
          email: email.trim().toLowerCase(),
          password,
          display_name: displayName.trim(),
          native_language: 'tr',
          invite_token: invite,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        if (response.status === 403) {
          setError(
            data?.detail === 'Invalid or expired invite'
              ? 'Davet bağlantısı geçersiz veya süresi dolmuş. Dernek yönetiminden yeni davet isteyin.'
              : 'Kayıt şu anda kapalı.'
          )
        } else if (response.status === 409) {
          setError(
            data?.detail === 'Username already taken'
              ? 'Bu kullanıcı adı kullanılıyor.'
              : 'Bu e-posta adresi kullanılıyor.'
          )
        } else {
          setError('Kayıt tamamlanamadı. Bilgilerinizi kontrol edin.')
        }
        return
      }
      startSession(data.access_token)
      router.push('/onboarding')
    } catch {
      setError('Bağlantı kurulamadı. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#081226] px-4 py-10">
      <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_20%_10%,rgba(201,162,75,0.18),transparent_30%),radial-gradient(circle_at_85%_80%,rgba(54,91,145,0.25),transparent_35%)]" />
      <div className="relative w-full max-w-lg">
        <Link href="/" className="mb-6 flex items-center justify-center gap-3 text-[#f7f3ea]">
          <Image
            src="/ghdil-logo.png"
            alt="GH Dil"
            width={64}
            height={64}
            className="rounded-full ring-1 ring-[#c9a24b]/60"
          />
          <span>
            <span className="block font-serif text-xl tracking-[0.18em]">GH DİL</span>
            <span className="block text-[10px] tracking-[0.16em] text-[#c9a24b] uppercase">
              Davetli üye kaydı
            </span>
          </span>
        </Link>
        <section className="overflow-hidden rounded-[1.75rem] border border-[#c9a24b]/40 bg-[#f7f3ea] text-[#0f1e3d] shadow-2xl">
          <div className="h-1 w-full bg-gradient-to-r from-[#c9a24b] via-[#e7cf93] to-[#c9a24b]" />
          <div className="p-7 sm:p-9">
            <p className="text-[10px] font-semibold tracking-[0.24em] text-[#8a6a24] uppercase">
              Yönetici daveti
            </p>
            <h1 className="mt-2 font-serif text-3xl">Üyeliğinizi tamamlayın</h1>
            <p className="mt-2 text-sm leading-6 text-[#5c6880]">
              Dernek yönetimi tarafından davet edildiniz. Hesabınızı oluşturduğunuzda
              doğrudan GH Dil platformuna erişebilirsiniz.
            </p>

            {error && (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-[#b42318]/25 bg-[#b42318]/8 px-4 py-3 text-sm leading-6 text-[#8a1c12]"
              >
                {error}
              </div>
            )}

            <form onSubmit={submit} className="mt-6 space-y-4">
              <Field label="Ad soyad" required icon={<UserRound className="size-3.5" />}>
                <input
                  value={displayName}
                  maxLength={100}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={inputClass}
                  autoComplete="name"
                  required
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Kullanıcı adı" required icon={<UserRound className="size-3.5" />}>
                  <input
                    value={username}
                    maxLength={50}
                    onChange={(e) => setUsername(e.target.value)}
                    className={inputClass}
                    autoComplete="username"
                    required
                  />
                </Field>
                <Field label="E-posta" required icon={<Mail className="size-3.5" />}>
                  <input
                    type="email"
                    value={email}
                    maxLength={255}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    autoComplete="email"
                    required
                  />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Şifre" required icon={<LockKeyhole className="size-3.5" />}>
                  <input
                    type="password"
                    value={password}
                    maxLength={25}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                    autoComplete="new-password"
                    required
                  />
                </Field>
                <Field label="Şifre tekrar" required icon={<LockKeyhole className="size-3.5" />}>
                  <input
                    type="password"
                    value={confirmPassword}
                    maxLength={25}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputClass}
                    autoComplete="new-password"
                    required
                  />
                </Field>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0f1e3d] px-6 py-3.5 text-sm font-semibold text-[#f7f3ea] transition hover:bg-[#1b3159] disabled:opacity-60"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : null}
                {loading ? 'Hesap oluşturuluyor…' : 'Hesabımı oluştur'}
                {!loading && <ArrowRight className="size-4" />}
              </button>
            </form>
            <p className="mt-5 text-center text-[11px] leading-5 text-[#5c6880]">
              Davet bağlantınız yok mu?{' '}
              <Link href="/register" className="font-semibold underline underline-offset-2">
                Normal üyelik başvurusu yapın
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
