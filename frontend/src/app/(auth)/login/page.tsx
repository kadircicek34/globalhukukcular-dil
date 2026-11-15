'use client'

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import {
  checkoutNavigationHref,
  getSelectedPlan,
} from '@/lib/checkout-navigation'
import { mapUser } from '@/lib/mappers'
import { useAuthStore } from '@/store/auth'

function LoginForm() {
  const t = useTranslations('auth.login')
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get('registered') === 'true'
  const selectedPlan = getSelectedPlan(searchParams.get('plan'))
  const startSession = useAuthStore((s) => s.startSession)
  const setUser = useAuthStore((s) => s.setUser)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const activeRequest = useRef<AbortController | null>(null)
  useEffect(() => () => activeRequest.current?.abort(), [])
  const [loading, setLoading] = useState(false)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError('')
      if (!email.trim()) {
        setError(t('emailRequired'))
        return
      }
      if (!password) {
        setError(t('passwordRequired'))
        return
      }
      setLoading(true)
      activeRequest.current?.abort()
      const controller = new AbortController()
      activeRequest.current = controller
      let sessionVersion = useAuthStore.getState().sessionVersion
      const obsolete = () =>
        controller.signal.aborted ||
        useAuthStore.getState().sessionVersion !== sessionVersion
      try {
        const res = await apiFetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          signal: controller.signal,
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          if (obsolete()) return
          let message = t(
            res.status === 401 && data?.detail === 'Invalid credentials'
              ? 'error'
              : 'loginFailed'
          )
          if (res.status === 422 && Array.isArray(data?.detail)) {
            const first = data.detail[0]
            const field = Array.isArray(first?.loc) ? first.loc.at(-1) : null
            if (field === 'email') message = t('invalidEmail')
          }
          if (res.status === 403) {
            if (data?.detail === 'Membership pending approval') {
              message =
                'Üyelik başvurunuz yönetici onayı bekliyor. Onaylandığında giriş yapabilirsiniz.'
            } else if (data?.detail === 'Membership application rejected') {
              message =
                'Üyelik başvurunuz reddedildi. Ayrıntı için Global Hukukçular Derneği ile iletişime geçin.'
            }
          }
          setError(message)
          return
        }
        const { access_token } = await res.json()
        if (obsolete()) return
        startSession(access_token)
        sessionVersion = useAuthStore.getState().sessionVersion
        const meRes = await apiFetch('/api/auth/me', {
          signal: controller.signal,
        })
        if (!meRes.ok) throw new Error('Profile lookup failed')
        const data = await meRes.json()
        if (obsolete()) return
        if (
          !data ||
          typeof data !== 'object' ||
          Array.isArray(data) ||
          !Number.isInteger(data.id) ||
          data.id <= 0 ||
          typeof data.username !== 'string' ||
          !data.username ||
          (data.learning_goals !== null &&
            (!Array.isArray(data.learning_goals) ||
              !data.learning_goals.every(
                (goal: unknown) => typeof goal === 'string'
              )))
        ) {
          throw new Error('Invalid profile response')
        }
        const mappedUser = mapUser(data)
        setUser(mappedUser)
        if (obsolete()) return
        router.push(
          selectedPlan
            ? checkoutNavigationHref(
                mappedUser.learning_goals === null
                  ? '/onboarding'
                  : '/settings',
                selectedPlan
              )
            : '/dashboard'
        )
      } catch {
        if (obsolete()) return
        setError(t('loginFailed'))
      } finally {
        if (!obsolete()) setLoading(false)
      }
    },
    [email, password, router, selectedPlan, startSession, setUser, t]
  )

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#081226] px-4 py-10">
      <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_20%_10%,rgba(201,162,75,0.18),transparent_30%),radial-gradient(circle_at_85%_80%,rgba(54,91,145,0.25),transparent_35%)]" />
      <div className="relative w-full max-w-md">
        <div className="mb-7 flex flex-col items-center text-center">
          <Link href="/">
            <Image
              src="/ghdil-logo.png"
              alt="GH Dil"
              width={92}
              height={92}
              className="rounded-full ring-1 ring-[#c9a24b]/60"
            />
          </Link>
          <h1 className="mt-4 font-serif text-2xl tracking-[0.16em] text-[#f7f3ea] uppercase">
            GH DİL
          </h1>
          <p className="mt-1 text-[10px] tracking-[0.18em] text-[#c9a24b] uppercase">
            Global Hukukçular Derneği · Üyelere özel
          </p>
        </div>

        <div className="overflow-hidden rounded-[1.75rem] border border-[#c9a24b]/40 bg-[#f7f3ea] text-[#0f1e3d] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.85)]">
          <div className="h-1 w-full bg-gradient-to-r from-[#c9a24b] via-[#e7cf93] to-[#c9a24b]" />
          <div className="p-7 sm:p-8">
            <div className="mb-6 border-b border-[#0f1e3d]/10 pb-4">
              <p className="text-[10px] font-semibold tracking-[0.22em] text-[#8a6a24] uppercase">
                Üye girişi
              </p>
              <h2 className="mt-1 font-serif text-2xl text-[#0f1e3d]">{t('title')}</h2>
            </div>

            {registered && (
              <div className="mb-5 rounded-xl border border-[#2f6b4f]/25 bg-[#2f6b4f]/8 px-4 py-3 text-xs leading-5 text-[#255741]">
                ✓ {t('accountCreated')}
              </div>
            )}
            {error && (
              <div role="alert" className="mb-5 rounded-xl border border-[#b42318]/25 bg-[#b42318]/8 px-4 py-3 text-xs leading-5 text-[#8a1c12]">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label htmlFor="login-email" className="mb-1.5 block text-xs font-semibold tracking-wide text-[#0f1e3d]">
                  {t('email')}
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  className="w-full rounded-xl border border-[#0f1e3d]/15 bg-white/80 px-4 py-3 text-sm text-[#0f1e3d] outline-none transition placeholder:text-[#7b8497] focus:border-[#c9a24b] focus:ring-2 focus:ring-[#c9a24b]/20"
                />
              </div>
              <div>
                <label htmlFor="login-password" className="mb-1.5 block text-xs font-semibold tracking-wide text-[#0f1e3d]">
                  {t('password')}
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    className="w-full rounded-xl border border-[#0f1e3d]/15 bg-white/80 px-4 py-3 pr-11 text-sm text-[#0f1e3d] outline-none transition placeholder:text-[#7b8497] focus:border-[#c9a24b] focus:ring-2 focus:ring-[#c9a24b]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-[#7b8497] transition hover:text-[#0f1e3d]"
                    aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-full bg-[#0f1e3d] py-3.5 text-sm font-semibold text-[#f7f3ea] shadow-[0_12px_26px_-12px_rgba(15,30,61,0.75)] transition hover:bg-[#1b3159] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                    {t('signingIn')}
                  </>
                ) : (
                  t('submit')
                )}
              </button>
            </form>

            <div className="mt-6 border-t border-[#0f1e3d]/10 pt-5 text-center text-xs leading-6 text-[#5c6880]">
              <p>
                Dernek üyesi değil misiniz?{' '}
                <Link
                  href="/register"
                  className="font-semibold text-[#0f1e3d] underline decoration-[#c9a24b] underline-offset-4"
                >
                  Üyelik başvurusu yapın
                </Link>
              </p>
              <p className="mt-1">
                <Link href="/forgot-password" className="transition hover:text-[#0f1e3d]">
                  {t('forgotPassword')}
                </Link>
              </p>
            </div>
          </div>
        </div>
        <p className="mt-5 text-center text-[11px] text-[#6f7b90]">
          <a href="https://globalhukukcular.com" target="_blank" rel="noopener noreferrer" className="transition hover:text-[#c9a24b]">
            globalhukukcular.com
          </a>
          {' '}· Üyelere özel dil platformu
        </p>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
