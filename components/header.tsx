"use client"

import Link from 'next/link'
import Image from 'next/image'
import { Search, LogIn, LogOut, User } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signIn, signOut } from 'next-auth/react'
import { getArticleUrl } from '@/lib/article-url'
import { StocksTicker } from './stocks-ticker'

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
  const { data: session } = useSession()
  const [categories, setCategories] = useState<Category[]>([])
  const [logoUrl, setLogoUrl] = useState<string>('')
  const [siteName, setSiteName] = useState<string>('AIM MEDIA HOUSE')
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Article[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [headerBarLeftText, setHeaderBarLeftText] = useState<string>('')
  const [headerBarLeftLink, setHeaderBarLeftLink] = useState<string>('')
  const [headerBarRightText, setHeaderBarRightText] = useState<string>('')
  const [headerBarRightLink, setHeaderBarRightLink] = useState<string>('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [customNavLinks, setCustomNavLinks] = useState<Array<{href: string, label: string}> | null>(null)

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
        
        // Parse custom nav links if provided
        if (settings.navLinksJson) {
          try {
            const parsed = JSON.parse(settings.navLinksJson)
            if (Array.isArray(parsed) && parsed.length > 0) {
              setCustomNavLinks(parsed)
            }
          } catch (e) {
            console.error('Failed to parse navLinksJson:', e)
            setCustomNavLinks(null)
          }
        } else {
          setCustomNavLinks(null)
        }
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
    // Use custom nav links if provided, otherwise use categories
    if (customNavLinks && customNavLinks.length > 0) {
      return customNavLinks
    }
    
    // Fallback to categories with Latest first
    const latestLink = { href: '/', label: 'Latest' }
    const categoryLinks = categories.map((c) => ({ 
      href: `/category/${c.slug}`, 
      label: c.name 
    }))
    return [latestLink, ...categoryLinks]
  }, [categories, customNavLinks])

  // Hide header on admin routes
  if (pathname?.startsWith('/admin')) return null

  // Handle scroll for collapsible header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowUserMenu(false)
    }
    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showUserMenu])

  const showHeaderBar = headerBarLeftText || headerBarRightText

  return (
    <header className={`bg-white border-b border-[var(--wsj-border-light)] sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-sm' : ''}`}>
      {/* Top bar - Configurable dark bar */}
      {showHeaderBar && (
        <div className={`bg-[var(--wsj-bg-dark-gray)] text-[var(--wsj-text-white)] transition-all duration-300 ${isScrolled ? 'h-0 overflow-hidden' : ''}`}>
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

      {/* Stocks Ticker - US Tech and AI Stocks - Collapsible on scroll */}
      <div className={`transition-all duration-300 ${isScrolled ? 'h-0 overflow-hidden' : ''}`}>
        <StocksTicker />
      </div>

      {/* Main header section */}
      <div className={`bg-white transition-all duration-300 ${isScrolled ? 'py-1' : ''}`}>
        <div className="wsj-container">
          {/* Logo and Search row */}
          <div className={`flex items-center justify-between px-4 md:px-8 border-b border-[var(--wsj-border-light)] transition-all duration-300 ${isScrolled ? 'py-1' : 'py-3'}`}>
            {/* Centered Logo */}
            <div className="flex-1"></div>
            <Link href="/" className="flex items-center justify-center flex-1" aria-label="Home">
              {logoUrl ? (
                <div className={`flex items-center justify-center transition-all duration-300 ${isScrolled ? 'h-8 md:h-10' : 'h-10 md:h-12'}`}>
                  {logoUrl.startsWith('http') && !logoUrl.match(/supabase\.co|cloudinary\.com|unsplash\.com|googleusercontent\.com/) ? (
                    <img
                      src={logoUrl}
                      alt={siteName}
                      className="max-h-full w-auto object-contain"
                      style={{ height: 'auto' }}
                      onError={() => setLogoUrl('')}
                    />
                  ) : (
                    <Image
                      src={logoUrl}
                      alt={siteName}
                      width={300}
                      height={130}
                      className="max-h-full w-auto object-contain"
                      priority
                      onError={() => setLogoUrl('')}
                    />
                  )}
                </div>
              ) : (
                <div className={`wsj-logo transition-all duration-300 ${isScrolled ? 'text-lg md:text-xl' : ''}`}>
                  {siteName.split(' ').map((word, i) => {
                    if (i === 0 || i === siteName.split(' ').length - 1) {
                      return <span key={i} style={{ fontSize: '0.7em' }}>{word} </span>
                    }
                    return <span key={i}>{word} </span>
                  })}
                </div>
              )}
            </Link>
            {/* Auth button */}
            <div className="flex-1 flex justify-end items-center gap-4">
              {/* User Auth */}
              {session?.user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 text-[var(--wsj-text-black)] hover:text-[var(--wsj-text-medium-gray)] transition-colors"
                    aria-label="User menu"
                  >
                    {session.user.image ? (
                      <div className="relative w-8 h-8 rounded-full overflow-hidden">
                        <Image
                          src={session.user.image}
                          alt={session.user.name || 'User'}
                          fill
                          className="object-cover"
                          sizes="32px"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[var(--wsj-bg-light-gray)] flex items-center justify-center">
                        <User className="w-4 h-4 text-[var(--wsj-text-medium-gray)]" />
                      </div>
                    )}
                    <span className="hidden md:inline text-sm font-sans">
                      {session.user.name || session.user.email}
                    </span>
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded border p-2 z-50">
                      <div className="px-4 py-2 border-b border-[var(--wsj-border-light)]">
                        <p className="text-sm font-medium text-[var(--wsj-text-black)] font-sans">
                          {session.user.name || 'User'}
                        </p>
                        <p className="text-xs text-[var(--wsj-text-medium-gray)] font-sans">
                          {session.user.email}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          signOut({ callbackUrl: '/' })
                          setShowUserMenu(false)
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-[var(--wsj-text-black)] transition-colors flex items-center gap-2 font-sans"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => signIn('google', { callbackUrl: pathname || '/' })}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--wsj-text-black)] hover:text-[var(--wsj-text-medium-gray)] border border-[var(--wsj-border-light)] rounded transition-colors font-sans"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden md:inline">Sign In</span>
                </button>
              )}
            </div>
          </div>

          {/* Main Navigation row */}
          <nav className={`px-4 md:px-8 transition-all duration-300 ${isScrolled ? 'hidden' : ''}`}>
            <div className="flex items-center justify-between gap-0 h-[var(--wsj-header-nav-height)]">
              <div className="flex items-center gap-0">
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
              {/* Search icon at the end of navigation */}
              <button
                onClick={() => setShowSearch(true)}
                className="text-[var(--wsj-text-black)] hover:text-[var(--wsj-text-medium-gray)] transition-colors p-2"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
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
