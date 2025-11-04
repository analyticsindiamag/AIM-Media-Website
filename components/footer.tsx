"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Footer() {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) return null

  return (
    <footer className="mt-16 border-t border-[var(--wsj-border-light)] bg-white">
      <div className="wsj-container py-8 md:py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright */}
          <div className="text-[var(--wsj-font-size-sm)] text-[var(--wsj-text-medium-gray)] font-sans">
            © {new Date().getFullYear()} AI Tech News. All rights reserved.
          </div>
          
          {/* Links */}
          <nav className="flex items-center gap-6 text-[var(--wsj-font-size-sm)] flex-wrap justify-center font-sans">
            <Link 
              href="/about" 
              className="text-[var(--wsj-text-medium-gray)] hover:text-[var(--wsj-text-black)] hover:underline transition-colors"
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className="text-[var(--wsj-text-medium-gray)] hover:text-[var(--wsj-text-black)] hover:underline transition-colors"
            >
              Contact
            </Link>
            <Link 
              href="/privacy" 
              className="text-[var(--wsj-text-medium-gray)] hover:text-[var(--wsj-text-black)] hover:underline transition-colors"
            >
              Privacy
            </Link>
            <Link 
              href="/terms" 
              className="text-[var(--wsj-text-medium-gray)] hover:text-[var(--wsj-text-black)] hover:underline transition-colors"
            >
              Terms
            </Link>
            <Link 
              href="/sitemap.xml" 
              className="text-[var(--wsj-text-medium-gray)] hover:text-[var(--wsj-text-black)] hover:underline transition-colors"
            >
              Sitemap
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
