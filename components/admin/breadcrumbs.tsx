"use client"

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export function AdminBreadcrumbs() {
  const pathname = usePathname()
  const router = useRouter()

  const segments = (pathname || '/admin')
    .split('?')[0]
    .split('#')[0]
    .split('/')
    .filter(Boolean)

  const isAdmin = segments[0] === 'admin'
  if (!isAdmin) return null

  const crumbs = segments.slice(1) // drop 'admin'
  const buildHref = (index: number) => '/admin/' + crumbs.slice(0, index + 1).join('/')

  return (
    <div className="mb-6 flex items-center justify-between">
      <nav className="text-sm text-muted-foreground">
        <Link href="/admin" className="hover:underline">Admin</Link>
        {crumbs.map((c, i) => (
          <span key={i}>
            <span className="mx-2">/</span>
            {i < crumbs.length - 1 ? (
              <Link href={buildHref(i)} className="hover:underline">
                {decodeURIComponent(c).replace(/-/g, ' ')}
              </Link>
            ) : (
              <span className="text-foreground">
                {decodeURIComponent(c).replace(/-/g, ' ')}
              </span>
            )}
          </span>
        ))}
      </nav>
      <button
        onClick={() => (history.length > 1 ? router.back() : router.push('/admin'))}
        className="text-sm text-primary hover:underline"
        aria-label="Go back"
      >
        Back
      </button>
    </div>
  )
}
