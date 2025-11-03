"use client"

import Link from 'next/link'
import { Search, Moon, Sun } from 'lucide-react'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'

type Category = { id: string; name: string; slug: string }

export function Header() {
  const pathname = usePathname()
  const [categories, setCategories] = useState<Category[]>([])
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light'
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  })
  const [showSearch, setShowSearch] = useState(false)

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data: Category[]) => setCategories(data))
      .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }, [])

  const navLinks = useMemo(() => {
    const staticCats = [
      { href: '/category/tech', label: 'TECH' },
      { href: '/category/ai', label: 'AI' },
      { href: '/category/ai-startups', label: 'STARTUPS' },
      { href: '/category/opinion', label: 'OPINION' },
    ]
    const dynamic = categories.map((c) => ({ href: `/category/${c.slug}`, label: c.name.toUpperCase() }))
    const all = [...staticCats, ...dynamic]
    // de-dupe by href
    const seen = new Set<string>()
    return all.filter((l) => (seen.has(l.href) ? false : (seen.add(l.href), true)))
  }, [categories])

  // Hide header on admin routes
  if (pathname?.startsWith('/admin')) return null

  return (
    <header className="border-b border-border bg-white dark:bg-[#0a0a0a] sticky top-0 z-50">
      {/* Top bar - NYT style */}
      <div className="border-b border-border bg-white dark:bg-[#0a0a0a]">
        <div className="content-container">
          <div className="flex items-center justify-between h-8 px-4 md:px-8 text-[11px]">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-black dark:text-white hover:text-[#666666] dark:hover:text-[#999999] uppercase font-medium">
                Home
              </Link>
              <Link href="/category/enterprise-ai" className="text-black dark:text-white hover:text-[#666666] dark:hover:text-[#999999] uppercase font-medium">
                Enterprise AI
              </Link>
              <Link href="/category/ai-startups" className="text-black dark:text-white hover:text-[#666666] dark:hover:text-[#999999] uppercase font-medium">
                AI Startups
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-black dark:text-white hover:text-[#666666] dark:hover:text-[#999999] uppercase font-medium">
                Subscribe
              </button>
              <button className="text-black dark:text-white hover:text-[#666666] dark:hover:text-[#999999] uppercase font-medium">
                Log In
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="content-container">
        {/* Main header: centered logo and nav */}
        <div className="flex items-center justify-between h-20 px-4 md:px-8">
          {/* Search icon on left */}
          <button
            className="p-2 transition-colors hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a] rounded"
            aria-label="Search"
            onClick={() => setShowSearch(true)}
          >
            <Search className="w-5 h-5 text-black dark:text-white" />
          </button>
          
          {/* Centered Logo */}
          <Link href="/" className="flex items-center flex-1 justify-center" aria-label="Home">
            <div className="font-serif font-black tracking-tight text-4xl md:text-5xl lg:text-6xl text-black dark:text-white text-center">
              Port
            </div>
          </Link>
          
          {/* Right side: dark mode */}
          <div className="flex items-center gap-1">
            <button
              className="p-2 transition-colors hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a] rounded"
              aria-label="Toggle dark mode"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-black dark:text-white" />
              ) : (
                <Moon className="w-5 h-5 text-black dark:text-white" />
              )}
            </button>
          </div>
        </div>
        
        {/* Main Navigation row */}
        <nav className="border-t border-border px-4 md:px-8">
          <div className="flex items-center justify-center gap-6 h-12 overflow-x-auto">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[13px] tracking-wide uppercase text-black dark:text-white hover:text-[#666666] dark:hover:text-[#999999] transition-colors py-2 whitespace-nowrap font-medium"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Search overlay - NYT style */}
      {showSearch && (
        <div 
          className="fixed inset-0 z-[60] bg-black/70 dark:bg-black/90" 
          onClick={() => setShowSearch(false)}
        >
          <div
            className="content-container px-4 md:px-8 pt-24"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white dark:bg-[#111111] border border-border shadow-lg max-w-2xl mx-auto">
              <div className="p-6">
                <input
                  autoFocus
                  type="search"
                  placeholder="Search articles..."
                  aria-label="Search"
                  className="w-full px-4 py-4 text-lg border-0 border-b-2 border-[#e6e6e6] dark:border-[#2a2a2a] bg-transparent text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setShowSearch(false)
                  }}
                />
                <div className="text-xs text-[#666666] dark:text-[#999999] mt-3">
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

