"use client"

import Link from 'next/link'
import { Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'

type Category = { id: string; name: string; slug: string }

export function Header() {
  const pathname = usePathname()
  const [categories, setCategories] = useState<Category[]>([])

  // Hide header on admin routes
  if (pathname?.startsWith('/admin')) return null

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data: Category[]) => setCategories(data))
      .catch(() => setCategories([]))
  }, [])

  const navLinks = useMemo(() => {
    const catLinks = categories.map((c) => ({ href: `/category/${c.slug}`, label: c.name.toUpperCase() }))
    // You can append static links if needed
    return catLinks
  }, [categories])

  return (
    <header className="border-b border-border bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <div className="text-3xl font-black tracking-tighter">
              <span className="bg-black text-white px-3 py-1">AI</span>
              <span className="ml-1">TECH</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className="text-sm font-medium hover:text-primary transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>

          <button className="p-2 hover:bg-muted rounded-lg transition-colors" aria-label="Search">
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  )
}

