import { AdminNav } from '@/components/admin/admin-nav'
import { AdminBreadcrumbs } from '@/components/admin/breadcrumbs'
import type { Metadata } from 'next'

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

