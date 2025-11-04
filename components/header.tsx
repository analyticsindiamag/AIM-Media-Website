"use client"

import Link from 'next/link'
import Image from 'next/image'
import { Search, ChevronDown } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { getArticleUrl } from '@/lib/article-url'

type Category = { id: string; name: string; slug: string }
type Article = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  featuredImage: string | null
  publishedAt: Date | null
  category: { name: string; slug: string }
  editor: { name: string; slug: string }
}

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [logoUrl, setLogoUrl] = useState<string>('')
  const [siteName, setSiteName] = useState<string>('THE WALL STREET JOURNAL')
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Article[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [headerBarLeftText, setHeaderBarLeftText] = useState<string>('')
  const [headerBarLeftLink, setHeaderBarLeftLink] = useState<string>('')
  const [headerBarRightText, setHeaderBarRightText] = useState<string>('')
  const [headerBarRightLink, setHeaderBarRightLink] = useState<string>('')

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
        if (settings.headerBarLeftText) setHeaderBarLeftText(settings.headerBarLeftText)
        if (settings.headerBarLeftLink) setHeaderBarLeftLink(settings.headerBarLeftLink)
        if (settings.headerBarRightText) setHeaderBarRightText(settings.headerBarRightText)
        if (settings.headerBarRightLink) setHeaderBarRightLink(settings.headerBarRightLink)
      })
      .catch(() => {})
  }, [])

  // Search functionality
  useEffect(() => {
    if (!showSearch) {
      setSearchQuery('')
      setSearchResults([])
      return
    }
  }, [showSearch])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const timeoutId = setTimeout(() => {
      setIsSearching(true)
      fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
        .then((res) => res.json())
        .then((data: { articles: Article[] }) => {
          setSearchResults(data.articles || [])
          setIsSearching(false)
        })
        .catch((err) => {
          console.error('Search error:', err)
          setSearchResults([])
          setIsSearching(false)
        })
    }, 300) // Debounce search by 300ms

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const navLinks = useMemo(() => {
    // Always include Latest as first item
    const latestLink = { href: '/', label: 'Latest' }
    // Map categories to nav links
    const categoryLinks = categories.map((c) => ({ 
      href: `/category/${c.slug}`, 
      label: c.name 
    }))
    // Combine with Latest first
    return [latestLink, ...categoryLinks]
  }, [categories])

  // Hide header on admin routes
  if (pathname?.startsWith('/admin')) return null

  const showHeaderBar = headerBarLeftText || headerBarRightText

  return (
    <header className="bg-white border-b border-[var(--wsj-border-light)] sticky top-0 z-50">
      {/* Top bar - Configurable dark bar */}
      {showHeaderBar && (
        <div className="bg-[var(--wsj-bg-dark-gray)] text-[var(--wsj-text-white)]">
          <div className="wsj-container">
            <div className="flex items-center justify-between h-[var(--wsj-header-top-height)] px-4 md:px-8" style={{ fontSize: 'var(--wsj-font-size-ticker)', fontFamily: 'var(--wsj-font-sans)' }}>
              <div className="flex items-center gap-3">
                {headerBarLeftLink ? (
                  <Link href={headerBarLeftLink} className="hover:underline" style={{ fontWeight: 'var(--wsj-font-weight-medium)' }}>
                    {headerBarLeftText}
                  </Link>
                ) : (
                  <span style={{ fontWeight: 'var(--wsj-font-weight-medium)' }}>{headerBarLeftText}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {headerBarRightLink ? (
                  <Link href={headerBarRightLink} className="hover:underline" style={{ fontWeight: 'var(--wsj-font-weight-medium)' }}>
                    {headerBarRightText}
                  </Link>
                ) : (
                  <span style={{ fontWeight: 'var(--wsj-font-weight-medium)' }}>{headerBarRightText}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main header section */}
      <div className="bg-white">
        <div className="wsj-container">
          {/* Logo and Search row */}
          <div className="flex items-center justify-between py-3 px-4 md:px-8 border-b border-[var(--wsj-border-light)]">
            {/* Centered Logo */}
            <div className="flex-1"></div>
            <Link href="/" className="flex items-center justify-center flex-1" aria-label="Home">
              {logoUrl ? (
                <div className="flex items-center justify-center h-10 md:h-12 w-full max-w-[300px]">
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
            {/* Search button */}
            <div className="flex-1 flex justify-end">
              <button
                onClick={() => setShowSearch(true)}
                className="text-[var(--wsj-text-black)] hover:text-[var(--wsj-text-medium-gray)] transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Navigation row */}
          <nav className="px-4 md:px-8">
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
            <div className="bg-white border border-[var(--wsj-border-light)] shadow-lg max-w-2xl mx-auto max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-[var(--wsj-border-light)]">
                <input
                  autoFocus
                  type="search"
                  placeholder="Search articles..."
                  aria-label="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-4 text-lg border-0 border-b-2 border-[var(--wsj-border-light)] bg-transparent text-[var(--wsj-text-black)] focus:outline-none focus:border-[var(--wsj-text-black)] transition-colors font-sans"
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setShowSearch(false)
                    } else if (e.key === 'Enter' && searchResults.length > 0) {
                      router.push(`/article/${searchResults[0].slug}`)
                      setShowSearch(false)
                    }
                  }}
                />
                <div className="text-xs text-[var(--wsj-text-medium-gray)] mt-3 font-sans">
                  Press Esc to close
                </div>
              </div>
              
              {/* Search Results */}
              <div className="overflow-y-auto flex-1">
                {isSearching && searchQuery.trim() && (
                  <div className="p-6 text-center text-[var(--wsj-text-medium-gray)] font-sans">
                    Searching...
                  </div>
                )}
                
                {!isSearching && searchQuery.trim() && searchResults.length === 0 && (
                  <div className="p-6 text-center text-[var(--wsj-text-medium-gray)] font-sans">
                    No articles found for &quot;{searchQuery}&quot;
                  </div>
                )}
                
                {!isSearching && searchResults.length > 0 && (
                  <div className="divide-y divide-[var(--wsj-border-light)]">
                    {searchResults.map((article) => {
                      const articleUrl = getArticleUrl(article)
                      return (
                      <Link
                        key={article.id}
                        href={articleUrl}
                        onClick={() => setShowSearch(false)}
                        className="block p-4 hover:bg-[var(--wsj-bg-light-gray)] transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          {article.featuredImage && (
                            <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden">
                              <Image
                                src={article.featuredImage}
                                alt={article.title}
                                fill
                                className="object-cover"
                                sizes="80px"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-serif font-bold text-[var(--wsj-font-size-base)] text-[var(--wsj-text-black)] mb-1 line-clamp-2">
                              {article.title}
                            </h3>
                            {article.excerpt && (
                              <p className="text-[var(--wsj-font-size-sm)] text-[var(--wsj-text-dark-gray)] line-clamp-2 mb-2 font-serif">
                                {article.excerpt}
                              </p>
                            )}
                            <div className="text-[var(--wsj-font-size-xs)] text-[var(--wsj-text-medium-gray)] font-sans">
                              {article.category.name} · {article.editor.name}
                            </div>
                          </div>
                        </div>
                      </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
