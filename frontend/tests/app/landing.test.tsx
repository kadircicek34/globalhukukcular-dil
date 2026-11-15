import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import { SITE_URL } from '@/lib/seo'

const { mockHas, mockHeader } = vi.hoisted(() => ({
  mockHas: vi.fn(),
  mockHeader: vi.fn(() => null),
}))

vi.mock('next/headers', () => ({
  cookies: async () => ({ has: mockHas }),
}))

vi.mock('next/font/google', () => ({
  Cormorant_Garamond: () => ({ variable: 'cormorant' }),
}))

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) =>
    React.createElement('a', { href, ...props }, children),
}))

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    width,
    height,
  }: {
    src: string
    alt?: string
    width?: number
    height?: number
  }) => React.createElement('img', { src, alt, width, height }),
}))

vi.mock('@/components/landing/LandingHeader', () => ({
  LandingHeader: mockHeader,
}))

import Home from '@/app/page'

beforeEach(() => {
  mockHas.mockReset().mockReturnValue(false)
  mockHeader.mockClear()
})

afterEach(() => {
  cleanup()
})

describe('GH Dil landing page', () => {
  it('renders a public Turkish landing page for anonymous visitors', async () => {
    const { container } = render(await Home())
    const main = screen.getByRole('main')

    expect(mockHas).toHaveBeenCalledWith('refresh_token')
    expect(mockHeader).toHaveBeenCalledWith({ hasSession: false }, undefined)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(within(main).getByRole('heading', { level: 1 })).toHaveTextContent(
      'Hukukçular için yapay zekâ destekli dil eğitimi.'
    )
    expect(container.querySelectorAll('details')).toHaveLength(5)

    const registrationLinks = within(main)
      .getAllByRole('link', { name: /Üyelik Başvurusu/i })
      .map((link) => link.getAttribute('href'))
    expect(registrationLinks).toEqual(['/register', '/register', '/register'])
    const loginLinks = within(main).getAllByRole('link', {
      name: /Giriş yap/i,
    })
    expect(loginLinks).toHaveLength(2)
    loginLinks.forEach((link) => expect(link).toHaveAttribute('href', '/login'))
  })

  it('sends authenticated members to the panel instead of the application form', async () => {
    mockHas.mockReturnValue(true)
    render(await Home())
    const main = screen.getByRole('main')

    expect(mockHeader).toHaveBeenCalledWith({ hasSession: true }, undefined)
    const dashboardLinks = within(main)
      .getAllByRole('link', { name: /Panele Git/i })
      .map((link) => link.getAttribute('href'))
    expect(dashboardLinks).toEqual(['/dashboard', '/dashboard', '/dashboard'])
    expect(within(main).queryByRole('link', { name: /Giriş yap/i })).toBeNull()
  })

  it('publishes GH Dil structured data on the canonical site URL', async () => {
    const { container } = render(await Home())
    const scripts = container.querySelectorAll(
      'script[type="application/ld+json"]'
    )

    expect(scripts).toHaveLength(1)
    const data = JSON.parse(scripts[0].textContent ?? '')
    const website = data['@graph'].find(
      (node: { '@type': string }) => node['@type'] === 'WebSite'
    )
    const organization = data['@graph'].find(
      (node: { '@type': string }) => node['@type'] === 'EducationalOrganization'
    )

    expect(website.name).toBe('GH Dil')
    expect(website.url).toBe(`${SITE_URL}/`)
    expect(website.inLanguage).toBe('tr-TR')
    expect(organization.name).toBe('GH Dil')
    expect(organization.parentOrganization.name).toBe(
      'Global Hukukçular Derneği'
    )
  })
})
