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
    <header className="border-b border-border bg-white sticky top-0 z-50">
      <div className="content-container px-4">
        {/* Top row: wordmark, controls */}
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center" aria-label="Home">
            <div className="font-serif font-black tracking-tight text-3xl text-black">Port</div>
          </Link>
          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded transition-colors hover:bg-secondary"
              aria-label="Search"
              onClick={() => setShowSearch(true)}
            >
              <Search className="w-5 h-5 text-black" />
            </button>
            <button
              className="p-2 rounded transition-colors hover:bg-secondary"
              aria-label="Toggle dark mode"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-black" /> : <Moon className="w-5 h-5 text-black" />}
            </button>
          </div>
        </div>
        {/* Nav row */}
        <nav className="hidden md:flex items-center gap-6 h-10 border-t border-border">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[12px] tracking-wide uppercase text-[var(--muted-foreground)] hover:text-black hover:underline py-2"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Search overlay */}
      {showSearch && (
        <div className="fixed inset-0 z-[60] bg-black/50" onClick={() => setShowSearch(false)}>
          <div
            className="content-container px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mt-24 bg-white p-4 md:p-6 border border-border shadow-sm">
              <input
                autoFocus
                type="search"
                placeholder="Search articles..."
                aria-label="Search"
                className="w-full px-4 py-3 border border-border focus:outline-none focus:ring-1 focus:ring-[var(--ring)]"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setShowSearch(false)
                }}
              />
              <div className="text-xs text-[var(--muted-foreground)] mt-2">Press Esc to close</div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

