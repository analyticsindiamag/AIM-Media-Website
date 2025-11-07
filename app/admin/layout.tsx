import { AdminNav } from '@/components/admin/admin-nav'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import type { Metadata } from 'next'

// Admin routes should be dynamic, not statically generated
export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Authentication is now handled in middleware.ts to prevent infinite redirect loops
  // This layout only renders for authenticated users (or login page which has its own layout)

  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 p-8 bg-gray-50">
        <AdminBreadcrumbs />
        {children}
      </main>
    </div>
  )
}

