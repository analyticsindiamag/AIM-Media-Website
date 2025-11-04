"use client"

import Link from 'next/link'
import Image from 'next/image'
import { Search, ChevronDown } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'

type Category = { id: string; name: string; slug: string }

export function Header() {
  const pathname = usePathname()
  const [categories, setCategories] = useState<Category[]>([])
  const [logoUrl, setLogoUrl] = useState<string>('')
  const [siteName, setSiteName] = useState<string>('THE WALL STREET JOURNAL')
  const [showSearch, setShowSearch] = useState(false)

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data: Category[]) => setCategories(data))
      .catch(() => setCategories([]))
    
    fetch('/api/settings')
      .then((r) => r.json())
      .then((settings) => {
        if (settings.logoUrl) setLogoUrl(settings.logoUrl)
        if (settings.siteName) setSiteName(settings.siteName.toUpperCase())
      })
      .catch(() => {})
  }, [])

  const navLinks = useMemo(() => {
    const staticCats = [
      { href: '/', label: 'Latest' },
      { href: '/category/tech', label: 'Tech' },
      { href: '/category/ai', label: 'AI' },
      { href: '/category/ai-startups', label: 'Startups' },
      { href: '/category/opinion', label: 'Opinion' },
      { href: '/category/ai-tools', label: 'AI Tools' },
      { href: '/category/enterprise-ai', label: 'Enterprise AI' },
      { href: '/category/research', label: 'Research' },
    ]
    const dynamic = categories.map((c) => ({ href: `/category/${c.slug}`, label: c.name }))
    const all = [...staticCats, ...dynamic]
    const seen = new Set<string>()
    return all.filter((l) => (seen.has(l.href) ? false : (seen.add(l.href), true)))
  }, [categories])

  // Hide header on admin routes
  if (pathname?.startsWith('/admin')) return null

  return (
    <header className="bg-white border-b border-[var(--wsj-border-light)] sticky top-0 z-50">
      {/* Top bar - WSJ style dark bar */}
      <div className="bg-[var(--wsj-bg-dark-gray)] text-[var(--wsj-text-white)]">
        <div className="wsj-container">
          <div className="flex items-center justify-between h-[var(--wsj-header-top-height)] px-4 md:px-8" style={{ fontSize: 'var(--wsj-font-size-ticker)', fontFamily: 'var(--wsj-font-sans)' }}>
            <div className="flex items-center gap-3">
              <span style={{ fontWeight: 'var(--wsj-font-weight-medium)' }}>{siteName.split(' ').slice(0, -2).join(' ')}</span>
            </div>
            <div className="flex items-center gap-3">
              <span style={{ fontWeight: 'var(--wsj-font-weight-medium)' }}>{siteName} | Tech</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main header section */}
      <div className="bg-white">
        <div className="wsj-container">
          {/* Logo and actions row */}
          <div className="flex items-center justify-between py-4 px-4 md:px-8">
            {/* Left spacer */}
            <div className="w-12"></div>
            
            {/* Centered Logo */}
            <Link href="/" className="flex items-center justify-center flex-1" aria-label="Home">
              {logoUrl ? (
                <div className="flex items-center justify-center h-12 md:h-16 w-full max-w-[300px]">
                  {logoUrl.startsWith('http') && !logoUrl.match(/supabase\.co|cloudinary\.com|unsplash\.com|googleusercontent\.com/) ? (
                    <img
                      src={logoUrl}
                      alt={siteName}
                      className="max-h-full max-w-full object-contain"
                      style={{ height: 'auto', width: 'auto' }}
                      onError={() => setLogoUrl('')}
                    />
                  ) : (
                    <div className="relative w-full h-full">
                      <Image
                        src={logoUrl}
                        alt={siteName}
                        fill
                        className="object-contain"
                        priority
                        sizes="(max-width: 768px) 200px, 300px"
                        onError={() => setLogoUrl('')}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="wsj-logo">
                  {siteName.split(' ').map((word, i) => {
                    if (i === 0 || i === siteName.split(' ').length - 1) {
                      return <span key={i} style={{ fontSize: '0.7em' }}>{word} </span>
                    }
                    return <span key={i}>{word} </span>
                  })}
                </div>
              )}
            </Link>
            
            {/* Right side: Subscribe/Sign In */}
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <button className="wsj-button-primary">
                  Subscribe
                </button>
                <button className="wsj-button-secondary">
                  Sign In
                </button>
              </div>
              <button className="text-[var(--wsj-blue-primary)] font-sans text-[var(--wsj-font-size-xs)] font-bold hover:underline">
                VIEW MEMBERSHIP OPTIONS
              </button>
            </div>
          </div>

          {/* Secondary navigation */}
          <div className="flex items-center justify-between border-t border-[var(--wsj-border-light)] px-4 md:px-8 py-2" style={{ fontSize: 'var(--wsj-font-size-sm)', fontFamily: 'var(--wsj-font-sans)' }}>
            <div className="flex items-center gap-4 text-[var(--wsj-text-medium-gray)]">
              <button className="hover:text-[var(--wsj-text-black)] transition-colors flex items-center gap-1">
                English Edition <ChevronDown className="w-3 h-3" />
              </button>
              <Link href="/" className="hover:text-[var(--wsj-text-black)] transition-colors">Print Edition</Link>
              <Link href="/" className="hover:text-[var(--wsj-text-black)] transition-colors">Video</Link>
              <Link href="/" className="hover:text-[var(--wsj-text-black)] transition-colors">Audio</Link>
              <span className="text-[var(--wsj-border-light)]">|</span>
              <Link href="/" className="hover:text-[var(--wsj-text-black)] transition-colors">Latest Headlines</Link>
              <Link href="/" className="hover:text-[var(--wsj-text-black)] transition-colors">Puzzles</Link>
              <button className="hover:text-[var(--wsj-text-black)] transition-colors flex items-center gap-1">
                More <ChevronDown className="w-3 h-3" />
              </button>
            </div>
            <button
              onClick={() => setShowSearch(true)}
              className="text-[var(--wsj-text-black)] hover:text-[var(--wsj-text-medium-gray)] transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Main Navigation row */}
          <nav className="border-t border-[var(--wsj-border-light)] px-4 md:px-8">
            <div className="flex items-center justify-start gap-0 h-[var(--wsj-header-nav-height)] overflow-x-auto">
              {navLinks.map((l, index) => {
                const isActive = pathname === l.href || (l.href !== '/' && pathname?.startsWith(l.href))
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`wsj-nav-link ${isActive ? 'wsj-nav-link-active' : ''}`}
                  >
                    {l.label}
                  </Link>
                )
              })}
            </div>
          </nav>
        </div>
      </div>

      {/* Search overlay - WSJ style */}
      {showSearch && (
        <div 
          className="fixed inset-0 z-[60] bg-black/70" 
          onClick={() => setShowSearch(false)}
        >
          <div
            className="wsj-container px-4 md:px-8 pt-24"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white border border-[var(--wsj-border-light)] shadow-lg max-w-2xl mx-auto">
              <div className="p-6">
                <input
                  autoFocus
                  type="search"
                  placeholder="Search articles..."
                  aria-label="Search"
                  className="w-full px-4 py-4 text-lg border-0 border-b-2 border-[var(--wsj-border-light)] bg-transparent text-[var(--wsj-text-black)] focus:outline-none focus:border-[var(--wsj-text-black)] transition-colors font-sans"
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setShowSearch(false)
                  }}
                />
                <div className="text-xs text-[var(--wsj-text-medium-gray)] mt-3 font-sans">
                  Press Esc to close
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
