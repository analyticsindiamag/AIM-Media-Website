import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const revalidate = 0

export default async function SubscribersPage() {
  try {
    const subscribers = await prisma.subscriber.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Subscribers</h1>
        <Link href="/api/subscribers/export" className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
          Export CSV
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        {subscribers.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Subscribed At</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="py-3 px-4">{s.email}</td>
                  <td className="py-3 px-4">{new Date(s.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-20 text-muted-foreground">No subscribers yet.</div>
        )}
      </div>
    </div>
  )
  } catch (error) {
    // During build, database might not be available
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Subscribers</h1>
          <Link href="/api/subscribers/export" className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
            Export CSV
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="text-center py-20 text-muted-foreground">
            Database not available. Please configure DATABASE_URL.
          </div>
        </div>
      </div>
    )
  }
}
