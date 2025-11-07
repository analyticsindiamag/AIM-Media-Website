import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { FileText, FolderOpen, Users, Eye } from 'lucide-react'

// Admin pages should be dynamic, not statically generated
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminDashboard() {
  try {
    const [totalArticles, publishedArticles, totalCategories, totalEditors] =
      await Promise.all([
        prisma.article.count(),
        prisma.article.count({ where: { published: true } }),
        prisma.category.count(),
        prisma.editor.count(),
      ])

    const recentArticles = await prisma.article.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        editor: true,
      },
    })

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Articles</p>
              <p className="text-3xl font-bold">{totalArticles}</p>
            </div>
            <FileText className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Published</p>
              <p className="text-3xl font-bold">{publishedArticles}</p>
            </div>
            <Eye className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Categories</p>
              <p className="text-3xl font-bold">{totalCategories}</p>
            </div>
            <FolderOpen className="w-12 h-12 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Editors</p>
              <p className="text-3xl font-bold">{totalEditors}</p>
            </div>
            <Users className="w-12 h-12 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Recent Articles */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-bold">Recent Articles</h2>
          <Link
            href="/admin/articles/new"
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Create New Article
          </Link>
        </div>
        <div className="p-6">
          {recentArticles.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Title</th>
                  <th className="text-left py-3 px-4">Category</th>
                  <th className="text-left py-3 px-4">Author</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Views</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentArticles.map((article) => (
                  <tr key={article.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium">{article.title}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-muted-foreground">
                        {article.category.name}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm">{article.editor.name}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          article.published
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {article.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm">{article.views}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/articles/${article.id}`}
                        className="text-sm text-primary hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No articles yet. Create your first article!
            </p>
          )}
        </div>
      </div>
    </div>
  )
  } catch (error) {
    // During build, database might not be available
    // Return empty dashboard with zero counts
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Articles</p>
                <p className="text-3xl font-bold">0</p>
              </div>
              <FileText className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="text-3xl font-bold">0</p>
              </div>
              <Eye className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-3xl font-bold">0</p>
              </div>
              <FolderOpen className="w-12 h-12 text-purple-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Editors</p>
                <p className="text-3xl font-bold">0</p>
              </div>
              <Users className="w-12 h-12 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Recent Articles */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Articles</h2>
            <Link
              href="/admin/articles/new"
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Create New Article
            </Link>
          </div>
          <div className="p-6">
            <p className="text-center text-muted-foreground py-8">
              Database not available. Please configure DATABASE_URL.
            </p>
          </div>
        </div>
      </div>
    )
  }
}

