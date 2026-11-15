import Image from 'next/image'
import Link from 'next/link'
import { cookies } from 'next/headers'
import type { Metadata } from 'next'
import {
  ArrowRight,
  ArrowUpRight,
  AtSign,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  ExternalLink,
  GraduationCap,
  Landmark,
  Lock,
  Mail,
  Mic,
  Scale,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'
import { Cormorant_Garamond } from 'next/font/google'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { createPublicMetadata, SITE_URL } from '@/lib/seo'

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const MEMBERSHIP_URL = 'https://globalhukukcular.com'
const PLATFORMS = [
  { label: 'globalhukukcular.com', href: MEMBERSHIP_URL },
  { label: 'Akademi', href: 'https://akademi.globalhukukcular.com' },
  { label: 'Canlı', href: 'https://live.globalhukukcular.com' },
  { label: 'Meet', href: 'https://meet.globalhukukcular.com' },
  { label: 'HMGS', href: 'https://hmgs.globalhukukcular.com' },
]

const FEATURES = [
  {
    title: 'Hukuk odaklı senaryolar',
    description:
      'Sözleşme müzakeresi, müvekkil görüşmesi, duruşma dili ve akademik hukuk metinleriyle gerçek meslek bağlamında çalışın.',
    Icon: Scale,
    number: '01',
  },
  {
    title: 'Lingu ile yapay zekâ desteği',
    description:
      'Seviyenize uygun açıklamalar, anında düzeltmeler ve hedef dilde doğal yanıtlar alın.',
    Icon: Sparkles,
    number: '02',
  },
  {
    title: 'Konuşma pratiği',
    description:
      'Sesli diyaloglarla telaffuzunuzu ve akıcılığınızı geliştirin; hukuki ifadeleri güvenle kullanın.',
    Icon: Mic,
    number: '03',
  },
  {
    title: 'A1–C2 çalışma planı',
    description:
      'Seviye tespitinin ardından öğrenme hızınıza ve hedefinize göre kişisel bir yol haritası oluşturun.',
    Icon: BookOpen,
    number: '04',
  },
  {
    title: 'Ölçülebilir ilerleme',
    description:
      'Ders, beceri ve seri bazında ilerlemenizi görün; güçlü olduğunuz alanları pekiştirin, eksiklerinize odaklanın.',
    Icon: TrendingUp,
    number: '05',
  },
  {
    title: 'Üyeye özel erişim',
    description:
      'Platform yalnızca doğrulanmış dernek üyelerine açıktır. Başvuru ve belgeler güvenli biçimde yönetilir.',
    Icon: ShieldCheck,
    number: '06',
  },
]

const STEPS = [
  {
    number: '01',
    title: 'Üyelik başvurusu',
    description:
      'Hukuk öğrencisi veya mezunu olarak başvurunuzu e-Devlet belgenizle tamamlayın.',
    Icon: GraduationCap,
    note: 'Doğum tarihi · Hukuk statüsü · e-Devlet belgesi',
  },
  {
    number: '02',
    title: 'Yönetim onayı',
    description:
      'Belgeniz ve üyelik uygunluğunuz dernek yönetimi tarafından incelenir. Sonuç e-posta ile bildirilir.',
    Icon: ShieldCheck,
    note: 'Gizli inceleme · KVKK uyumu',
  },
  {
    number: '03',
    title: 'Kişisel program',
    description:
      'Onayın ardından giriş yapın, seviye tespitinizi tamamlayın ve çalışma planınızı oluşturun.',
    Icon: Sparkles,
    note: 'Seviye tespiti · A1–C2 planı · Lingu',
  },
]

const REQUIREMENTS = [
  {
    title: 'Doğum tarihi',
    description:
      'Başvuru sahibinin en az 15 yaşında olduğunu doğrulamak için alınır.',
    Icon: CalendarDays,
  },
  {
    title: 'Hukuk öğrencisi veya mezunu',
    description:
      'Hukuk fakültesi öğrencileri ve hukuk fakültesinden mezun olanlar başvurabilir.',
    Icon: Landmark,
  },
  {
    title: 'e-Devlet belgesi',
    description:
      'Öğrenci veya mezuniyet belgesi. PDF, JPEG ya da PNG; en fazla 5 MB.',
    Icon: GraduationCap,
  },
  {
    title: 'KVKK ve kullanım koşulları',
    description:
      'Başvuru öncesinde aydınlatma metnini ve platform koşullarını okuyup onaylamanız gerekir.',
    Icon: Lock,
  },
]

const FAQS = [
  {
    question: 'GH Dil kimlere açık?',
    answer:
      'GH Dil, Global Hukukçular Derneği bünyesinde hukuk fakültesi öğrencileri ve hukuk mezunları için tasarlanmıştır. Platformu kullanabilmek için üyelik başvurusunun dernek yönetimi tarafından onaylanması gerekir.',
  },
  {
    question: 'Üyelik başvurusu nasıl yapılır?',
    answer:
      'Başvuru formunda kimlik bilgilerinizi, doğum tarihinizi, hukuk statünüzü ve eğitim bilgilerinizi paylaşırsınız. e-Devlet üzerinden aldığınız öğrenci veya mezuniyet belgesini yükler, KVKK aydınlatma metnini ve kullanım koşullarını onaylarsınız. Başvurunuz yönetim incelemesine alınır.',
  },
  {
    question: 'e-Devlet belgesi olarak hangi dosyalar kabul edilir?',
    answer:
      'e-Devlet’ten alınan öğrenci belgesi veya mezuniyet belgesi kabul edilir. PDF, JPEG ve PNG biçimleri desteklenir; dosya boyutu en fazla 5 MB olabilir. Belge uzantısı ve içeriği birlikte doğrulanır, yalnızca yetkili yöneticiler tarafından görüntülenebilir.',
  },
  {
    question: 'Başvuru için ödeme yapmam gerekiyor mu?',
    answer:
      'Üyelik başvurusu için ödeme alınmaz. Başvurunuzun onaylanmasının ardından platforma erişim koşulları ve varsa gelişmiş özellikler panel içinde açıkça gösterilir.',
  },
  {
    question: 'Başvurum ne zaman sonuçlanır?',
    answer:
      'Her başvuru dernek yönetimi tarafından ayrı ayrı incelenir. Sonuç, başvurunuzda belirttiğiniz e-posta adresine bildirilir. Eksik veya okunamayan belge olması hâlinde başvuru gerekçesiyle birlikte değerlendirilir.',
  },
]

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A24B]'
const focusRingOnLight =
  'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8A6A24]'

export async function generateMetadata(): Promise<Metadata> {
  return createPublicMetadata({
    path: '/',
    title: 'GH Dil | Hukukçular için Yapay Zekâ Destekli Dil Eğitimi',
    description:
      'Global Hukukçular Derneği üyelerine özel GH Dil; hukuk odaklı senaryolar, A1–C2 çalışma planı ve yapay zekâ eğitmeni Lingu ile konuşma pratiği sunar.',
    locale: 'tr',
  })
}

export default async function Home() {
  const cookieStore = await cookies()
  const hasSession = cookieStore.has('refresh_token')
  const primaryHref = hasSession ? '/dashboard' : '/register'
  const primaryLabel = hasSession ? 'Panele Git' : 'Üyelik Başvurusu'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: 'GH Dil',
        inLanguage: 'tr-TR',
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
      {
        '@type': 'EducationalOrganization',
        '@id': `${SITE_URL}/#organization`,
        name: 'GH Dil',
        alternateName: 'Global Hukukçular Derneği Dil Platformu',
        url: `${SITE_URL}/`,
        logo: `${SITE_URL}/ghdil-logo.png`,
        inLanguage: 'tr-TR',
        parentOrganization: {
          '@type': 'Organization',
          name: 'Global Hukukçular Derneği',
          url: MEMBERSHIP_URL,
        },
      },
      {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/#webpage`,
        url: `${SITE_URL}/`,
        name: 'GH Dil | Hukukçular için Yapay Zekâ Destekli Dil Eğitimi',
        description:
          'Hukukçular için hukuk odaklı senaryolar, A1–C2 çalışma planı ve yapay zekâ eğitmeni Lingu ile dil eğitimi.',
        inLanguage: 'tr-TR',
        isPartOf: { '@id': `${SITE_URL}/#website` },
      },
    ],
  }

  return (
    <div
      id="top"
      lang="tr"
      className={`${cormorant.variable} gh-landing min-h-screen overflow-x-clip bg-[#F7F3EA] font-sans text-[#0F1E3D] antialiased`}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <a
        href="#main"
        className={`sr-only z-[100] focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:bg-[#C9A24B] focus:px-5 focus:py-3 focus:font-sans focus:text-sm focus:font-semibold focus:text-[#0F1E3D] ${focusRing}`}
      >
        İçeriğe geç
      </a>

      <LandingHeader hasSession={hasSession} />

      <main id="main">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-[#0F1E3D] text-[#F7F3EA]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-48 -right-52 size-[38rem] rounded-full border border-[#C9A24B]/15"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-32 -right-36 size-[26rem] rounded-full border border-[#C9A24B]/20"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-24 -right-10 size-[12rem] rounded-full border border-[#C9A24B]/10"
          />
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-[9%] hidden w-px bg-[#C9A24B]/12 lg:block"
          />

          <div className="mx-auto grid w-full max-w-7xl items-center gap-14 px-5 pt-16 pb-20 sm:px-6 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8 lg:pt-24 lg:pb-28">
            <div className="gh-rise relative z-10 min-w-0">
              <p className="flex items-center gap-3 font-sans text-[10px] font-medium tracking-[0.26em] text-[#C9A24B] uppercase sm:text-[11px]">
                <span aria-hidden="true" className="h-px w-8 bg-[#C9A24B]" />
                Global Hukukçular Derneği
              </p>

              <h1 className="font-display mt-7 max-w-3xl text-[clamp(2.65rem,10vw,5.6rem)] leading-[0.98] font-medium tracking-[-0.025em] text-balance text-[#F7F3EA]">
                Hukukçular için{' '}
                <em className="text-[#D8B665] italic">yapay zekâ destekli</em>{' '}
                dil eğitimi.
              </h1>

              <p className="mt-7 max-w-xl font-sans text-[15px] leading-7 text-[#C9C3B5] sm:text-base sm:leading-8">
                GH Dil; hukuk odaklı senaryolar, A1–C2 arası yapılandırılmış bir
                müfredat ve yapay zekâ eğitmeni Lingu ile mesleki dil pratiğini
                tek platformda buluşturur.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href={primaryHref}
                  className={`group inline-flex items-center justify-center gap-2.5 bg-[#C9A24B] px-6 py-3.5 font-sans text-xs font-semibold tracking-[0.12em] text-[#0F1E3D] uppercase shadow-[0_12px_30px_rgba(0,0,0,0.18)] transition-colors hover:bg-[#D8B665] ${focusRing}`}
                >
                  {primaryLabel}
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
                  />
                </Link>
                <Link
                  href={hasSession ? '#platform' : '/login'}
                  className={`group inline-flex items-center justify-center gap-2.5 border border-[#C9A24B]/45 px-6 py-3.5 font-sans text-xs font-medium tracking-[0.12em] text-[#F7F3EA] uppercase transition-colors hover:border-[#C9A24B] hover:bg-[#C9A24B]/10 ${focusRing}`}
                >
                  {hasSession ? 'Platformu keşfet' : 'Giriş yap'}
                  {hasSession ? (
                    <ChevronDown aria-hidden="true" className="size-4" />
                  ) : (
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                  )}
                </Link>
              </div>

              <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-3">
                {['Üyelere özel', 'e-Devlet ile başvuru', 'A1–C2 müfredat'].map(
                  (badge) => (
                    <li
                      key={badge}
                      className="flex items-center gap-2 font-sans text-[11px] tracking-wide text-[#B9B2A2]"
                    >
                      <span className="flex size-4 items-center justify-center rounded-full border border-[#C9A24B]/40">
                        <Check
                          aria-hidden="true"
                          className="size-2.5 text-[#C9A24B]"
                        />
                      </span>
                      {badge}
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Emblem and lesson card */}
            <div className="gh-rise gh-delay-2 relative mx-auto w-full max-w-md min-w-0 lg:max-w-none">
              <div className="relative mx-auto flex aspect-square w-full max-w-[22rem] items-center justify-center sm:max-w-[26rem]">
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full border border-[#C9A24B]/20"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-[9%] rounded-full border border-[#C9A24B]/35"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-[18%] rounded-full border border-dashed border-[#C9A24B]/20"
                />
                <div className="gh-float relative z-10 w-[58%] overflow-hidden rounded-full shadow-[0_30px_80px_rgba(3,10,24,0.55)] ring-1 ring-[#C9A24B]/50">
                  <Image
                    src="/ghdil-logo.png"
                    alt="GH Dil amblemi"
                    width={384}
                    height={384}
                    priority
                    sizes="(min-width: 1024px) 280px, 220px"
                    className="h-auto w-full"
                  />
                </div>
                <span
                  aria-hidden="true"
                  className="font-code absolute top-[8%] left-[3%] text-[9px] tracking-[0.32em] text-[#C9A24B]/80 uppercase [writing-mode:vertical-rl]"
                >
                  Since 2024
                </span>
                <span className="absolute right-[1%] bottom-[10%] flex items-center gap-2 rounded-full border border-[#C9A24B]/30 bg-[#0F1E3D]/80 px-3 py-1.5 font-sans text-[9px] tracking-[0.18em] text-[#D8C9A6] uppercase backdrop-blur-sm">
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full bg-[#C9A24B]"
                  />
                  Üyelere özel
                </span>
              </div>

              <div className="gh-glass relative z-20 -mt-10 ml-auto w-[94%] rounded-2xl border border-[#C9A24B]/30 bg-[#122746]/85 p-5 text-[#F7F3EA] shadow-[0_24px_70px_rgba(3,10,24,0.45)] backdrop-blur-xl sm:-mt-12 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-sans text-[9px] font-medium tracking-[0.24em] text-[#C9A24B] uppercase">
                    Bugünün dersi
                  </p>
                  <span className="font-code text-[9px] tracking-[0.16em] text-[#8FA1BC]">
                    DERS 04
                  </span>
                </div>
                <h2 className="font-display mt-3 text-[1.7rem] leading-[1.05] font-medium text-[#F7F3EA] sm:text-3xl">
                  Hukuki İngilizce
                  <span className="block text-[#D8C9A6] italic">
                    Sözleşme dili
                  </span>
                </h2>
                <p className="mt-3 font-sans text-xs leading-5 text-[#B9C0CC]">
                  “Force majeure” maddesini okuyun ve kendi cümlelerinizle
                  özetleyin.
                </p>
                <div className="mt-5">
                  <div className="flex items-center justify-between font-sans text-[9px] tracking-[0.12em] text-[#9EAAC0] uppercase">
                    <span>Haftalık hedef</span>
                    <span className="text-[#D8C9A6]">4 / 5 ders</span>
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#F7F3EA]/10">
                    <div className="h-full w-[80%] rounded-full bg-[#C9A24B]" />
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#F7F3EA]/10 pt-4">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#C9A24B]/40 bg-[#0F1E3D]">
                      <Sparkles
                        aria-hidden="true"
                        className="size-3.5 text-[#C9A24B]"
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-sans text-[11px] font-medium text-[#F7F3EA]">
                        Lingu
                      </span>
                      <span className="block font-sans text-[9px] text-[#8FA1BC]">
                        Yapay zekâ eğitmeni
                      </span>
                    </span>
                  </div>
                  <span
                    aria-hidden="true"
                    className="flex size-8 items-center justify-center rounded-full bg-[#C9A24B] text-[#0F1E3D]"
                  >
                    <ArrowRight className="size-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[#C9A24B]/20">
            <div className="mx-auto grid w-full max-w-7xl grid-cols-2 lg:grid-cols-4">
              {[
                { value: 'A1–C2', label: 'Kademeli müfredat' },
                { value: '4', label: 'Temel dil becerisi' },
                { value: '7/24', label: 'Lingu ile erişim' },
                { value: '%100', label: 'Üyeye özel platform' },
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  className={`px-5 py-7 sm:px-7 sm:py-8 ${
                    index % 2 === 1 ? 'border-l border-[#C9A24B]/15' : ''
                  } ${
                    index > 1
                      ? 'border-t border-[#C9A24B]/15 lg:border-t-0'
                      : ''
                  } ${index > 0 ? 'lg:border-l lg:border-[#C9A24B]/15' : ''}`}
                >
                  <p className="font-display text-3xl leading-none font-medium text-[#D8B665] sm:text-4xl">
                    {stat.value}
                  </p>
                  <p className="mt-2 font-sans text-[10px] tracking-[0.16em] text-[#AEB6C4] uppercase">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────────── */}
        <section
          id="platform"
          className="scroll-mt-24 px-5 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28"
        >
          <div className="mx-auto w-full max-w-7xl">
            <div className="gh-reveal flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <p className="flex items-center gap-3 font-sans text-[10px] font-semibold tracking-[0.24em] text-[#8A6A24] uppercase">
                  <span aria-hidden="true" className="h-px w-8 bg-[#C9A24B]" />
                  Platform
                </p>
                <h2 className="font-display mt-5 text-[clamp(2.3rem,7vw,4.4rem)] leading-[1.02] font-medium tracking-[-0.02em] text-balance text-[#0F1E3D]">
                  Hukuk pratiğine göre{' '}
                  <span className="text-[#8A6A24] italic">tasarlandı.</span>
                </h2>
              </div>
              <p className="max-w-sm border-l border-[#C9A24B]/50 pl-5 font-sans text-sm leading-7 text-[#5A5346] md:mb-1">
                Genel dil kurslarından farklı olarak GH Dil, hukukçunun okuma,
                yazma, dinleme ve konuşma ihtiyaçlarını aynı öğrenme akışında
                ele alır.
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              {FEATURES.map((feature) => (
                <article
                  key={feature.title}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#0F1E3D]/10 bg-[#FFFDF8] p-6 shadow-[0_10px_35px_rgba(15,30,61,0.04)] transition-[transform,box-shadow,border-color] duration-300 focus-within:border-[#C9A24B]/45 hover:-translate-y-1 hover:border-[#C9A24B]/45 hover:shadow-[0_22px_50px_rgba(15,30,61,0.08)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-7"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-[#C9A24B] transition-transform duration-500 group-hover:scale-x-100 motion-reduce:transition-none"
                  />
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex size-11 items-center justify-center rounded-full border border-[#0F1E3D]/10 bg-[#F7F3EA] text-[#0F1E3D] transition-colors duration-300 group-hover:border-[#C9A24B]/40 group-hover:text-[#8A6A24] motion-reduce:transition-none">
                      <feature.Icon
                        aria-hidden="true"
                        className="size-[18px]"
                        strokeWidth={1.6}
                      />
                    </span>
                    <span className="font-display text-xl leading-none text-[#C9A24B]/60">
                      {feature.number}
                    </span>
                  </div>
                  <h3 className="font-display mt-8 text-[1.65rem] leading-tight font-semibold text-[#0F1E3D]">
                    {feature.title}
                  </h3>
                  <p className="mt-3 font-sans text-[13px] leading-6 text-[#5A5346]">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Method ───────────────────────────────────────────── */}
        <section
          id="yontem"
          className="relative overflow-hidden bg-[#0F1E3D] px-5 py-20 text-[#F7F3EA] sm:px-6 sm:py-24 lg:px-8 lg:py-28"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-40 -left-40 size-[30rem] rounded-full border border-[#C9A24B]/10"
          />
          <div className="relative mx-auto w-full max-w-7xl">
            <div className="gh-reveal max-w-3xl">
              <p className="flex items-center gap-3 font-sans text-[10px] font-semibold tracking-[0.24em] text-[#C9A24B] uppercase">
                <span aria-hidden="true" className="h-px w-8 bg-[#C9A24B]" />
                Yöntem
              </p>
              <h2 className="font-display mt-5 text-[clamp(2.3rem,7vw,4.4rem)] leading-[1.02] font-medium tracking-[-0.02em] text-balance">
                Üç adımda{' '}
                <span className="text-[#D8B665] italic">
                  üyeliğe ve eğitime.
                </span>
              </h2>
              <p className="mt-5 max-w-xl font-sans text-sm leading-7 text-[#B9C0CC]">
                Başvurudan ilk derse kadar süreç sade tutulur. Belge incelemesi
                ve üyelik onayı dernek yönetimindedir.
              </p>
            </div>

            <ol className="mt-12 grid gap-4 md:grid-cols-3 lg:gap-6">
              {STEPS.map((step, index) => (
                <li
                  key={step.number}
                  className="gh-reveal group relative flex flex-col rounded-2xl border border-[#C9A24B]/20 bg-[#13294B] p-6 sm:p-7"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex size-11 items-center justify-center rounded-full border border-[#C9A24B]/35 text-[#D8B665]">
                      <step.Icon
                        aria-hidden="true"
                        className="size-[18px]"
                        strokeWidth={1.5}
                      />
                    </span>
                    <span className="font-display text-3xl leading-none text-[#C9A24B]/55">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="font-display mt-8 text-2xl leading-tight font-semibold text-[#F7F3EA]">
                    {step.title}
                  </h3>
                  <p className="mt-3 flex-1 font-sans text-[13px] leading-6 text-[#B9C0CC]">
                    {step.description}
                  </p>
                  <p className="mt-6 border-t border-[#C9A24B]/15 pt-4 font-sans text-[9px] tracking-[0.14em] text-[#8FA1BC] uppercase">
                    {step.note}
                  </p>
                  {index < STEPS.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="absolute top-1/2 -right-3 hidden size-6 -translate-y-1/2 items-center justify-center rounded-full border border-[#C9A24B]/30 bg-[#0F1E3D] text-[#C9A24B] md:flex lg:-right-4"
                    >
                      <ArrowRight className="size-3" />
                    </span>
                  )}
                </li>
              ))}
            </ol>

            <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Link
                href={primaryHref}
                className={`group inline-flex items-center justify-center gap-2.5 bg-[#C9A24B] px-6 py-3.5 font-sans text-xs font-semibold tracking-[0.12em] text-[#0F1E3D] uppercase transition-colors hover:bg-[#D8B665] ${focusRing}`}
              >
                {primaryLabel}
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
                />
              </Link>
              <p className="font-sans text-[11px] leading-5 text-[#8FA1BC]">
                Başvurular dernek yönetiminin onayına tabidir.
              </p>
            </div>
          </div>
        </section>

        {/* ── Platform preview ─────────────────────────────────── */}
        <section
          id="onizleme"
          className="scroll-mt-24 px-5 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28"
        >
          <div className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
            <div className="gh-reveal max-w-lg">
              <p className="flex items-center gap-3 font-sans text-[10px] font-semibold tracking-[0.24em] text-[#8A6A24] uppercase">
                <span aria-hidden="true" className="h-px w-8 bg-[#C9A24B]" />
                Platform önizlemesi
              </p>
              <h2 className="font-display mt-5 text-[clamp(2.3rem,7vw,4.4rem)] leading-[1.02] font-medium tracking-[-0.02em] text-balance text-[#0F1E3D]">
                Ders, pratik ve geri bildirim{' '}
                <span className="text-[#8A6A24] italic">aynı akışta.</span>
              </h2>
              <p className="mt-6 font-sans text-sm leading-7 text-[#5A5346]">
                GH Dil paneli; günlük hedefleri, dersleri ve Lingu konuşmalarını
                tek bir sade ekranda birleştirir. Nereden devam edeceğinizi her
                zaman bilirsiniz.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  'Kişisel plana göre günlük ders akışı',
                  'Dört beceride ayrı ilerleme görünümü',
                  'Lingu ile ders bağlamında konuşma pratiği',
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 font-sans text-[13px] leading-6 text-[#3F3A31]"
                  >
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-[#C9A24B]/45">
                      <Check
                        aria-hidden="true"
                        className="size-3 text-[#8A6A24]"
                      />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href={primaryHref}
                className={`mt-9 inline-flex items-center gap-2 border-b border-[#C9A24B] pb-1 font-sans text-xs font-semibold tracking-[0.12em] text-[#0F1E3D] uppercase transition-colors hover:text-[#8A6A24] ${focusRingOnLight}`}
              >
                {hasSession ? 'Panele git' : 'Başvuru formunu aç'}
                <ArrowUpRight aria-hidden="true" className="size-3.5" />
              </Link>
            </div>

            <div className="gh-reveal gh-delay-2 min-w-0">
              <div className="relative">
                <div
                  aria-hidden="true"
                  className="absolute -inset-2 rounded-[1.4rem] border border-[#C9A24B]/30 sm:-inset-3"
                />
                <div className="relative overflow-hidden rounded-2xl border border-[#0F1E3D]/20 bg-[#FFFDF8] shadow-[0_30px_80px_rgba(15,30,61,0.16)]">
                  <div className="flex items-center gap-2 border-b border-[#0F1E3D]/10 bg-[#122746] px-4 py-3">
                    <span
                      aria-hidden="true"
                      className="size-2 rounded-full bg-[#C9A24B]/80"
                    />
                    <span
                      aria-hidden="true"
                      className="size-2 rounded-full bg-[#F7F3EA]/25"
                    />
                    <span
                      aria-hidden="true"
                      className="size-2 rounded-full bg-[#F7F3EA]/25"
                    />
                    <span className="font-code mx-auto truncate rounded-full border border-[#F7F3EA]/10 px-4 py-1 text-[8px] tracking-[0.08em] text-[#9DA9BB]">
                      dil.globalhukukcular.com
                    </span>
                  </div>

                  <div className="grid min-h-[25rem] grid-cols-1 sm:grid-cols-[9rem_1fr]">
                    <aside className="hidden border-r border-[#0F1E3D]/10 bg-[#FBF7ED] p-3 sm:block">
                      <div className="flex items-center gap-2 px-1 py-2">
                        <Image
                          src="/ghdil-logo.png"
                          alt=""
                          width={24}
                          height={24}
                          className="size-6 rounded-full"
                        />
                        <span className="font-code text-[9px] font-bold tracking-[0.16em] text-[#0F1E3D] uppercase">
                          GH Dil
                        </span>
                      </div>
                      <div className="mt-5 space-y-1">
                        {[
                          { label: 'Panel', active: true },
                          { label: 'Planım', active: false },
                          { label: 'Dersler', active: false },
                          { label: 'Konuşma', active: false },
                          { label: 'İlerleme', active: false },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className={`rounded-md px-2.5 py-2 font-sans text-[10px] ${
                              item.active
                                ? 'bg-[#0F1E3D] text-[#F7F3EA]'
                                : 'text-[#6B6354]'
                            }`}
                          >
                            {item.label}
                          </div>
                        ))}
                      </div>
                      <div className="mt-10 rounded-lg border border-[#C9A24B]/30 bg-[#FFFDF8] p-2.5">
                        <p className="font-sans text-[8px] tracking-[0.12em] text-[#8A6A24] uppercase">
                          Üyelik
                        </p>
                        <p className="mt-1 font-sans text-[9px] leading-4 text-[#5A5346]">
                          Onaylı üye
                        </p>
                        <span className="mt-1.5 inline-flex items-center gap-1 font-sans text-[8px] text-[#3E6B4D]">
                          <span className="size-1 rounded-full bg-[#3E6B4D]" />
                          Aktif
                        </span>
                      </div>
                    </aside>

                    <div className="min-w-0 p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-sans text-[8px] tracking-[0.16em] text-[#8A6A24] uppercase">
                            Hoş geldiniz
                          </p>
                          <p className="font-display mt-1 text-xl leading-tight font-semibold text-[#0F1E3D] sm:text-2xl">
                            Av. Elif Yılmaz
                          </p>
                        </div>
                        <span className="font-code shrink-0 rounded-full border border-[#C9A24B]/45 px-2 py-1 text-[8px] tracking-[0.08em] text-[#8A6A24]">
                          B1
                        </span>
                      </div>

                      <div className="mt-4 rounded-xl bg-[#0F1E3D] p-3.5 text-[#F7F3EA]">
                        <div className="flex items-end justify-between gap-3">
                          <div>
                            <p className="font-sans text-[8px] tracking-[0.16em] text-[#C9A24B] uppercase">
                              Haftalık hedef
                            </p>
                            <p className="font-display mt-1 text-2xl leading-none">
                              4{' '}
                              <span className="text-sm text-[#8FA1BC]">
                                / 5 ders
                              </span>
                            </p>
                          </div>
                          <span className="font-sans text-[8px] text-[#B9C0CC]">
                            %80 tamamlandı
                          </span>
                        </div>
                        <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-[#F7F3EA]/10">
                          <div className="h-full w-[80%] rounded-full bg-[#C9A24B]" />
                        </div>
                      </div>

                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <div className="rounded-lg border border-[#0F1E3D]/10 bg-[#FBF7ED] p-3">
                          <div className="flex items-center gap-2">
                            <Scale
                              aria-hidden="true"
                              className="size-3.5 text-[#8A6A24]"
                            />
                            <p className="font-sans text-[9px] font-semibold text-[#0F1E3D]">
                              Sözleşme dili
                            </p>
                          </div>
                          <p className="mt-1.5 font-sans text-[8px] leading-4 text-[#6B6354]">
                            Ders 04 · 12 dk
                          </p>
                          <div className="mt-2 h-1 rounded-full bg-[#0F1E3D]/10">
                            <div className="h-full w-[68%] rounded-full bg-[#C9A24B]" />
                          </div>
                        </div>
                        <div className="rounded-lg border border-[#0F1E3D]/10 bg-[#FBF7ED] p-3">
                          <div className="flex items-center gap-2">
                            <Mic
                              aria-hidden="true"
                              className="size-3.5 text-[#8A6A24]"
                            />
                            <p className="font-sans text-[9px] font-semibold text-[#0F1E3D]">
                              Konuşma pratiği
                            </p>
                          </div>
                          <p className="mt-1.5 font-sans text-[8px] leading-4 text-[#6B6354]">
                            Müzakere · 8 dk
                          </p>
                          <div className="mt-2 h-1 rounded-full bg-[#0F1E3D]/10">
                            <div className="h-full w-[42%] rounded-full bg-[#C9A24B]" />
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 rounded-lg border border-[#C9A24B]/35 bg-[#F7F3EA] p-3">
                        <div className="flex items-start gap-2.5">
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#0F1E3D] text-[#C9A24B]">
                            <Sparkles aria-hidden="true" className="size-3" />
                          </span>
                          <div className="min-w-0">
                            <p className="font-sans text-[8px] font-semibold tracking-[0.1em] text-[#8A6A24] uppercase">
                              Lingu
                            </p>
                            <p className="mt-0.5 font-sans text-[9px] leading-4 text-[#3F3A31]">
                              “Force majeure” maddesini birlikte inceleyelim.
                              Hazır olduğunuzda sesli pratiğe geçebiliriz.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Membership ───────────────────────────────────────── */}
        <section
          id="uyelik"
          className="scroll-mt-24 px-5 pb-20 sm:px-6 sm:pb-24 lg:px-8 lg:pb-28"
        >
          <div className="mx-auto w-full max-w-7xl">
            <div className="gh-reveal relative overflow-hidden rounded-3xl bg-[#0F1E3D] px-5 py-10 text-[#F7F3EA] shadow-[0_30px_80px_rgba(15,30,61,0.16)] sm:px-8 sm:py-12 lg:px-12 lg:py-14">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full border border-[#C9A24B]/15"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-10 -right-10 size-40 rounded-full border border-[#C9A24B]/20"
              />
              <div className="relative grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
                <div>
                  <p className="flex items-center gap-3 font-sans text-[10px] font-semibold tracking-[0.24em] text-[#C9A24B] uppercase">
                    <span
                      aria-hidden="true"
                      className="h-px w-8 bg-[#C9A24B]"
                    />
                    Üyelik
                  </p>
                  <h2 className="font-display mt-5 text-[clamp(2.3rem,7vw,4rem)] leading-[1.02] font-medium tracking-[-0.02em]">
                    Üyelik, hukukçu{' '}
                    <span className="text-[#D8B665] italic">
                      kimliğiyle başlar.
                    </span>
                  </h2>
                  <p className="mt-5 max-w-md font-sans text-sm leading-7 text-[#B9C0CC]">
                    GH Dil’e erişim, doğrulanmış dernek üyeliğine bağlıdır.
                    Başvurunuzu tamamlamak için aşağıdaki bilgileri ve belgeyi
                    hazır bulundurun.
                  </p>

                  <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 font-sans text-[10px] tracking-[0.1em] text-[#8FA1BC] uppercase">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck
                        aria-hidden="true"
                        className="size-3.5 text-[#C9A24B]"
                      />
                      Güvenli inceleme
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Lock
                        aria-hidden="true"
                        className="size-3.5 text-[#C9A24B]"
                      />
                      KVKK uyumu
                    </span>
                  </div>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href={primaryHref}
                      className={`group inline-flex items-center justify-center gap-2.5 bg-[#C9A24B] px-6 py-3.5 font-sans text-xs font-semibold tracking-[0.12em] text-[#0F1E3D] uppercase transition-colors hover:bg-[#D8B665] ${focusRing}`}
                    >
                      {primaryLabel}
                      <ArrowUpRight
                        aria-hidden="true"
                        className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
                      />
                    </Link>
                    {!hasSession && (
                      <Link
                        href="/login"
                        className={`inline-flex items-center justify-center border border-[#C9A24B]/40 px-6 py-3.5 font-sans text-xs font-medium tracking-[0.12em] text-[#F7F3EA] uppercase transition-colors hover:border-[#C9A24B] hover:bg-[#C9A24B]/10 ${focusRing}`}
                      >
                        Giriş yap
                      </Link>
                    )}
                  </div>
                </div>

                <ul className="divide-y divide-[#C9A24B]/15 border-y border-[#C9A24B]/20">
                  {REQUIREMENTS.map((requirement, index) => (
                    <li
                      key={requirement.title}
                      className="flex items-start gap-4 py-5 sm:gap-5"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#C9A24B]/30 text-[#D8B665]">
                        <requirement.Icon
                          aria-hidden="true"
                          className="size-[17px]"
                          strokeWidth={1.5}
                        />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <h3 className="font-sans text-sm font-semibold text-[#F7F3EA]">
                            {requirement.title}
                          </h3>
                          <span className="font-code text-[9px] tracking-[0.18em] text-[#C9A24B]/70">
                            0{index + 1}
                          </span>
                        </div>
                        <p className="mt-1.5 font-sans text-xs leading-5 text-[#AEB6C4]">
                          {requirement.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="relative mt-8 border-t border-[#C9A24B]/15 pt-5 font-sans text-[10px] leading-5 text-[#8FA1BC]">
                Başvuru formunda verdiğiniz bilgiler yalnızca üyelik
                değerlendirmesi için kullanılır. Ayrıntılar için{' '}
                <Link
                  href="/privacy"
                  className={`text-[#D8C9A6] underline decoration-[#C9A24B]/50 underline-offset-4 hover:text-[#F7F3EA] ${focusRing}`}
                >
                  Gizlilik Politikası
                </Link>{' '}
                ve{' '}
                <Link
                  href="/terms"
                  className={`text-[#D8C9A6] underline decoration-[#C9A24B]/50 underline-offset-4 hover:text-[#F7F3EA] ${focusRing}`}
                >
                  Hizmet Koşulları
                </Link>
                ’nı inceleyebilirsiniz.
              </p>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────── */}
        <section
          id="sss"
          className="scroll-mt-24 border-t border-[#0F1E3D]/10 px-5 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28"
        >
          <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
            <div className="gh-reveal lg:sticky lg:top-28 lg:self-start">
              <p className="flex items-center gap-3 font-sans text-[10px] font-semibold tracking-[0.24em] text-[#8A6A24] uppercase">
                <span aria-hidden="true" className="h-px w-8 bg-[#C9A24B]" />
                Sıkça sorulan sorular
              </p>
              <h2 className="font-display mt-5 text-[clamp(2.3rem,7vw,4rem)] leading-[1.02] font-medium tracking-[-0.02em] text-balance text-[#0F1E3D]">
                Merak ettiğiniz{' '}
                <span className="text-[#8A6A24] italic">her şey.</span>
              </h2>
              <p className="mt-5 max-w-sm font-sans text-sm leading-7 text-[#5A5346]">
                Başvuru, belge ve üyelik sürecine dair kısa yanıtlar. Aradığınız
                cevabı bulamazsanız derneğimizle iletişime geçebilirsiniz.
              </p>
              <a
                href={`${MEMBERSHIP_URL}/iletisim`}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-7 inline-flex items-center gap-2 border-b border-[#C9A24B] pb-1 font-sans text-[11px] font-semibold tracking-[0.12em] text-[#0F1E3D] uppercase transition-colors hover:text-[#8A6A24] ${focusRingOnLight}`}
              >
                İletişime geç
                <ExternalLink aria-hidden="true" className="size-3.5" />
              </a>
            </div>

            <div className="gh-reveal gh-delay-2 border-t border-[#0F1E3D]/15">
              {FAQS.map((faq) => (
                <details
                  key={faq.question}
                  className="group border-b border-[#0F1E3D]/15"
                >
                  <summary
                    className={`flex cursor-pointer list-none items-start justify-between gap-5 py-5 font-sans text-sm font-medium text-[#0F1E3D] transition-colors marker:content-none hover:text-[#8A6A24] sm:py-6 sm:text-base ${focusRingOnLight}`}
                  >
                    <span className="text-balance">{faq.question}</span>
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-[#0F1E3D]/15 text-[#8A6A24] transition-transform duration-300 group-open:rotate-180 motion-reduce:transition-none">
                      <ChevronDown aria-hidden="true" className="size-3.5" />
                    </span>
                  </summary>
                  <p className="max-w-2xl pr-8 pb-6 font-sans text-[13px] leading-7 text-[#5A5346]">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Closing CTA ──────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-[#0F1E3D] px-5 py-20 text-[#F7F3EA] sm:px-6 sm:py-24 lg:px-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 size-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#C9A24B]/12"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 size-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#C9A24B]/18"
          />
          <div className="gh-reveal relative mx-auto flex max-w-3xl flex-col items-center text-center">
            <Image
              src="/ghdil-logo.png"
              alt=""
              width={64}
              height={64}
              className="size-14 rounded-full ring-1 ring-[#C9A24B]/45 sm:size-16"
            />
            <p className="mt-6 font-sans text-[10px] font-medium tracking-[0.26em] text-[#C9A24B] uppercase">
              GH Dil · Global Hukukçular Derneği
            </p>
            <h2 className="font-display mt-5 text-[clamp(2.5rem,8vw,4.8rem)] leading-[1.02] font-medium tracking-[-0.025em] text-balance">
              Hukuk dili, kariyerinizin{' '}
              <span className="text-[#D8B665] italic">ortak dili olsun.</span>
            </h2>
            <p className="mt-6 max-w-xl font-sans text-sm leading-7 text-[#B9C0CC]">
              Hukuk odaklı senaryolar, yapılandırılmış bir müfredat ve Lingu ile
              pratik. GH Dil, mesleki iletişiminizi bir üst seviyeye taşır.
            </p>
            <div className="mt-9 flex w-full flex-col justify-center gap-3 sm:flex-row">
              <Link
                href={primaryHref}
                className={`group inline-flex items-center justify-center gap-2.5 bg-[#C9A24B] px-7 py-4 font-sans text-xs font-semibold tracking-[0.12em] text-[#0F1E3D] uppercase transition-colors hover:bg-[#D8B665] ${focusRing}`}
              >
                {primaryLabel}
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
                />
              </Link>
              <a
                href="#platform"
                className={`inline-flex items-center justify-center gap-2.5 border border-[#C9A24B]/40 px-7 py-4 font-sans text-xs font-medium tracking-[0.12em] text-[#F7F3EA] uppercase transition-colors hover:border-[#C9A24B] hover:bg-[#C9A24B]/10 ${focusRing}`}
              >
                Platformu keşfet
                <ArrowRight aria-hidden="true" className="size-4" />
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="bg-[#081226] text-[#F7F3EA]">
        <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-6 sm:py-16 lg:px-8">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-4">
              <div className="flex items-center gap-3">
                <Image
                  src="/ghdil-logo.png"
                  alt=""
                  width={44}
                  height={44}
                  className="size-11 rounded-full ring-1 ring-[#C9A24B]/40"
                />
                <div>
                  <p className="font-code text-sm font-bold tracking-[0.2em] text-[#F7F3EA] uppercase">
                    GH Dil
                  </p>
                  <p className="mt-1 font-sans text-[9px] tracking-[0.1em] text-[#C9A24B] uppercase">
                    Global Hukukçular Derneği
                  </p>
                </div>
              </div>
              <p className="mt-5 max-w-xs font-sans text-[12px] leading-6 text-[#9EABBE]">
                Hukukçular için tasarlanmış, yapay zekâ destekli dijital dil
                eğitimi platformu.
              </p>
              <div className="mt-5 flex items-center gap-3">
                <a
                  href="https://www.instagram.com/globalhukukcular"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Global Hukukçular Derneği Instagram"
                  className={`flex size-9 items-center justify-center rounded-full border border-[#C9A24B]/30 text-[#D8C9A6] transition-colors hover:border-[#C9A24B] hover:text-[#F7F3EA] ${focusRing}`}
                >
                  <AtSign aria-hidden="true" className="size-4" />
                </a>
                <a
                  href={`${MEMBERSHIP_URL}/iletisim`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="İletişim sayfası"
                  className={`flex size-9 items-center justify-center rounded-full border border-[#C9A24B]/30 text-[#D8C9A6] transition-colors hover:border-[#C9A24B] hover:text-[#F7F3EA] ${focusRing}`}
                >
                  <Mail aria-hidden="true" className="size-4" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-2">
              <h2 className="font-sans text-[9px] font-semibold tracking-[0.22em] text-[#C9A24B] uppercase">
                Dernek platformları
              </h2>
              <ul className="mt-4 space-y-2.5">
                {PLATFORMS.map((platform) => (
                  <li key={platform.label}>
                    <a
                      href={platform.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1.5 font-sans text-[12px] text-[#9EABBE] transition-colors hover:text-[#F7F3EA] ${focusRing}`}
                    >
                      {platform.label}
                      <ExternalLink
                        aria-hidden="true"
                        className="size-2.5 opacity-60"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h2 className="font-sans text-[9px] font-semibold tracking-[0.22em] text-[#C9A24B] uppercase">
                GH Dil
              </h2>
              <ul className="mt-4 space-y-2.5">
                {[
                  { label: 'Platform', href: '#platform' },
                  { label: 'Yöntem', href: '#yontem' },
                  { label: 'Üyelik', href: '#uyelik' },
                  { label: 'SSS', href: '#sss' },
                  { label: 'Giriş', href: '/login' },
                ].map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className={`font-sans text-[12px] text-[#9EABBE] transition-colors hover:text-[#F7F3EA] ${focusRing}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h2 className="font-sans text-[9px] font-semibold tracking-[0.22em] text-[#C9A24B] uppercase">
                Kurumsal
              </h2>
              <ul className="mt-4 space-y-2.5">
                {[
                  { label: 'Dernek hakkında', href: MEMBERSHIP_URL },
                  {
                    label: 'İletişim',
                    href: `${MEMBERSHIP_URL}/iletisim`,
                  },
                  { label: 'Gizlilik', href: '/privacy' },
                  { label: 'Hizmet koşulları', href: '/terms' },
                  { label: 'Üyelik başvurusu', href: '/register' },
                ].map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className={`font-sans text-[12px] text-[#9EABBE] transition-colors hover:text-[#F7F3EA] ${focusRing}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h2 className="font-sans text-[9px] font-semibold tracking-[0.22em] text-[#C9A24B] uppercase">
                İletişim
              </h2>
              <p className="mt-4 font-sans text-[12px] leading-6 text-[#9EABBE]">
                Sorularınız ve üyelik süreci için dernek iletişim kanallarını
                kullanabilirsiniz.
              </p>
              <a
                href={`${MEMBERSHIP_URL}/iletisim`}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-3 inline-flex items-center gap-1.5 font-sans text-[12px] text-[#D8C9A6] underline decoration-[#C9A24B]/40 underline-offset-4 transition-colors hover:text-[#F7F3EA] ${focusRing}`}
              >
                İletişim formu
                <ExternalLink aria-hidden="true" className="size-3" />
              </a>
              <p className="mt-4 flex items-center gap-2 font-sans text-[11px] text-[#7F8DA3]">
                <Users aria-hidden="true" className="size-3.5" />
                @globalhukukcular
              </p>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-5 border-t border-[#C9A24B]/15 pt-6 lg:flex-row lg:items-center lg:justify-between">
            <p className="font-sans text-[11px] text-[#7F8DA3]">
              © 2026 Global Hukukçular Derneği. Tüm hakları saklıdır.
            </p>
            <div className="flex flex-col gap-2 font-sans text-[10px] leading-5 text-[#8494ad] sm:flex-row sm:items-center sm:gap-4">
              <a
                href="https://github.com/artcc/freelingo"
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 transition-colors hover:text-[#C9A24B] ${focusRing}`}
              >
                AGPL-3.0 açık kaynak altyapı
                <ExternalLink aria-hidden="true" className="size-2.5" />
              </a>
              <span className="hidden h-3 w-px bg-[#C9A24B]/25 sm:block" />
              <span>
                Bu platform, AGPL-3.0 lisanslı FreeLingo altyapısı üzerine
                geliştirilmiştir.
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
