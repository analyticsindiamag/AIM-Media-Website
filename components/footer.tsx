"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Twitter, Facebook, Linkedin } from 'lucide-react'

export function Footer() {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) return null

  return (
    <footer className="mt-16 border-t border-border bg-white">
      <div className="content-container px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-[var(--muted-foreground)]">
            © 2023–25 Port. All rights reserved.
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/about" className="text-[var(--muted-foreground)] hover:text-black hover:underline">About</Link>
            <Link href="/contact" className="text-[var(--muted-foreground)] hover:text-black hover:underline">Contact</Link>
            <Link href="/privacy" className="text-[var(--muted-foreground)] hover:text-black hover:underline">Privacy</Link>
            <Link href="/terms" className="text-[var(--muted-foreground)] hover:text-black hover:underline">Terms</Link>
            <Link href="/sitemap.xml" className="text-[var(--muted-foreground)] hover:text-black hover:underline">Sitemap</Link>
          </nav>
          <div className="flex items-center gap-3">
            <a href="https://twitter.com" aria-label="Twitter" className="p-2 hover:bg-secondary" target="_blank" rel="noopener noreferrer">
              <Twitter className="w-4 h-4 text-[var(--muted-foreground)]" />
            </a>
            <a href="https://facebook.com" aria-label="Facebook" className="p-2 hover:bg-secondary" target="_blank" rel="noopener noreferrer">
              <Facebook className="w-4 h-4 text-[var(--muted-foreground)]" />
            </a>
            <a href="https://linkedin.com" aria-label="LinkedIn" className="p-2 hover:bg-secondary" target="_blank" rel="noopener noreferrer">
              <Linkedin className="w-4 h-4 text-[var(--muted-foreground)]" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

