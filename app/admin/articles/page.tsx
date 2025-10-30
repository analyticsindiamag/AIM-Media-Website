'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface Article {
  id: string
  title: string
  slug: string
  published: boolean
  views: number
  category: {
    name: string
  }
  editor: {
    name: string
  }
  createdAt: string
  excerpt?: string
  content?: string
  featuredImage?: string
  categoryId?: string
  editorId?: string
  metaTitle?: string
  metaDescription?: string
  featured?: boolean
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles')
      const data = await response.json()
      setArticles(data)
    } catch (_error) {
      console.error('Failed to fetch articles')
    } finally {
      setLoading(false)
    }
  }

  const setFeatured = async (id: string) => {
    try {
      const article = articles.find((a) => a.id === id)
      if (!article) return
      const res = await fetch(`/api/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt ?? '',
          content: article.content ?? '<p></p>',
          featuredImage: article.featuredImage ?? '',
          categoryId: article.categoryId,
          editorId: article.editorId,
          published: article.published,
          metaTitle: article.metaTitle ?? '',
          metaDescription: article.metaDescription ?? '',
          featured: true,
        }),
      })
      if (res.ok) {
        fetchArticles()
      } else {
        alert('Failed to set featured')
      }
    } catch (_e) {
      alert('An error occurred')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return

    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchArticles()
      } else {
        alert('Failed to delete article')
      }
    } catch (_error) {
      alert('An error occurred')
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Articles</h1>
        <Link href="/admin/articles/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Article
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        {articles.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Title</th>
                <th className="text-left py-3 px-4">Category</th>
                <th className="text-left py-3 px-4">Author</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Featured</th>
                <th className="text-left py-3 px-4">Views</th>
                <th className="text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
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
                    {article.featured ? (
                      <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">Featured</span>
                    ) : (
                      <button onClick={() => setFeatured(article.id)} className="text-sm text-purple-600 hover:underline">Set Featured</button>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm">{article.views}</span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <Link
                      href={`/article/${article.slug}`}
                      target="_blank"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/articles/${article.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(article.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">
              No articles yet. Create your first article!
            </p>
            <Link href="/admin/articles/new">
              <Button>Create Article</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

