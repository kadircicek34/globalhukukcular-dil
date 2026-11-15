import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GH Dil — Global Hukukçular Derneği',
    short_name: 'GH Dil',
    description:
      'Hukukçular için yapay zekâ destekli dil eğitimi: hukuk odaklı senaryolar, A1–C2 planı ve Lingu ile konuşma pratiği.',
    lang: 'tr',
    start_url: '/',
    display: 'standalone',
    background_color: '#0F1E3D',
    theme_color: '#0F1E3D',
    icons: [
      { src: '/favicon.png', sizes: '512x512', type: 'image/png' },
      { src: '/ghdil-logo.png', sizes: '384x384', type: 'image/png' },
    ],
  }
}
