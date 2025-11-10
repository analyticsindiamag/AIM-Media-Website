"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { SubscribeForm } from './subscribe-form'

export function Footer() {
  const pathname = usePathname()
  const [footerLinks, setFooterLinks] = useState<Array<{label: string, href: string}>>([
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Sitemap', href: '/sitemap.xml' },
  ])

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((settings) => {
        if (settings.footerLinksJson) {
          try {
            const parsed = JSON.parse(settings.footerLinksJson)
            if (Array.isArray(parsed) && parsed.length > 0) {
              setFooterLinks(parsed)
            }
          } catch (e) {
            console.error('Failed to parse footerLinksJson:', e)
          }
        }
      })
      .catch(() => {})
  }, [])

  if (pathname?.startsWith('/admin')) return null

  return (
    <footer className="mt-16 border-t border-[var(--wsj-border-light)] bg-white">
      <div className="wsj-container py-8 md:py-12">
        {/* Subscribe Section */}
        <div className="mb-8 pb-8 border-b border-[var(--wsj-border-light)]">
          <SubscribeForm />
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright */}
          <div className="text-[var(--wsj-font-size-sm)] text-[var(--wsj-text-medium-gray)] font-sans">
            © {new Date().getFullYear()} AI Tech News. All rights reserved.
          </div>
          
          {/* Links */}
          <nav className="flex items-center gap-6 text-[var(--wsj-font-size-sm)] flex-wrap justify-center font-sans">
            {footerLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className="text-[var(--wsj-text-medium-gray)] hover:text-[var(--wsj-text-black)] hover:underline transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}
