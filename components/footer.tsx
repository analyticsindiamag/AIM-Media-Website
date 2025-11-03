"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Twitter, Facebook, Linkedin } from 'lucide-react'

export function Footer() {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) return null

  return (
    <footer className="mt-16 border-t border-border bg-white dark:bg-[#0a0a0a]">
      <div className="content-container py-8 md:py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright */}
          <div className="text-sm text-[#666666] dark:text-[#999999]">
            © 2023–25 Port. All rights reserved.
          </div>
          
          {/* Links */}
          <nav className="flex items-center gap-6 text-sm flex-wrap justify-center">
            <Link 
              href="/about" 
              className="text-[#666666] dark:text-[#999999] hover:text-black dark:hover:text-white hover:underline transition-colors"
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className="text-[#666666] dark:text-[#999999] hover:text-black dark:hover:text-white hover:underline transition-colors"
            >
              Contact
            </Link>
            <Link 
              href="/privacy" 
              className="text-[#666666] dark:text-[#999999] hover:text-black dark:hover:text-white hover:underline transition-colors"
            >
              Privacy
            </Link>
            <Link 
              href="/terms" 
              className="text-[#666666] dark:text-[#999999] hover:text-black dark:hover:text-white hover:underline transition-colors"
            >
              Terms
            </Link>
            <Link 
              href="/sitemap.xml" 
              className="text-[#666666] dark:text-[#999999] hover:text-black dark:hover:text-white hover:underline transition-colors"
            >
              Sitemap
            </Link>
          </nav>
          
          {/* Social Icons */}
          <div className="flex items-center gap-3">
            <a 
              href="https://twitter.com" 
              aria-label="Twitter" 
              className="p-2 hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a] rounded transition-colors" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Twitter className="w-4 h-4 text-[#666666] dark:text-[#999999]" />
            </a>
            <a 
              href="https://facebook.com" 
              aria-label="Facebook" 
              className="p-2 hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a] rounded transition-colors" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Facebook className="w-4 h-4 text-[#666666] dark:text-[#999999]" />
            </a>
            <a 
              href="https://linkedin.com" 
              aria-label="LinkedIn" 
              className="p-2 hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a] rounded transition-colors" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Linkedin className="w-4 h-4 text-[#666666] dark:text-[#999999]" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

