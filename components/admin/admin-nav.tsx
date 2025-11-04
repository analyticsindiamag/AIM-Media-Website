'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, FileText, FolderOpen, Users, Upload, LogOut, Image, File } from 'lucide-react'

export function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  const links = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/articles', label: 'Articles', icon: FileText },
    { href: '/admin/categories', label: 'Categories', icon: FolderOpen },
    { href: '/admin/editors', label: 'Editors', icon: Users },
    { href: '/admin/import', label: 'Import CSV', icon: Upload },
    { href: '/admin/subscribers', label: 'Subscribers', icon: Users },
    { href: '/admin/sponsored-banners', label: 'Sponsored Banners', icon: Image },
    { href: '/admin/static-pages', label: 'Static Pages', icon: File },
    { href: '/admin/settings', label: 'Settings', icon: LayoutDashboard },
  ]

  return (
    <nav className="w-64 bg-gray-900 text-white min-h-screen p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-black">
          <span className="bg-white text-black px-2 py-1">AI</span> TECH
        </h1>
        <p className="text-sm text-gray-400 mt-2">Admin Portal</p>
      </div>

      <ul className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-white text-black'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{link.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 mt-8 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors w-full"
      >
        <LogOut className="w-5 h-5" />
        <span className="font-medium">Logout</span>
      </button>
    </nav>
  )
}

