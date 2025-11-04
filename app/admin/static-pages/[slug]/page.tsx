'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { RichTextEditor } from '@/components/admin/rich-text-editor'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface StaticPage {
  id: string
  title: string
  slug: string
  content: string
  metaTitle: string | null
  metaDescription: string | null
}

export default function EditStaticPagePage() {
  const router = useRouter()
  const params = useParams<{ slug: string }>()
  const slug = params.slug
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [formData, setFormData] = useState<StaticPage>({
    id: '',
    title: '',
    slug: '',
    content: '',
    metaTitle: '',
    metaDescription: '',
  })

  useEffect(() => {
    setMounted(true)
    fetchPage()
  }, [slug])

  const fetchPage = async () => {
    try {
      const response = await fetch(`/api/static-pages/${slug}`)
      if (response.ok) {
        const data = await response.json()
        setFormData(data)
      } else if (response.status === 404) {
        alert('Page not found')
        router.push('/admin/static-pages')
      }
    } catch (error) {
      console.error('Failed to fetch page:', error)
      alert('Failed to load page')
    } finally {
      setFetching(false)
    }
  }

  // Auto-generate slug from title (only if slug is empty or matches old title)
  useEffect(() => {
    if (formData.title && (!formData.slug || formData.slug === slug)) {
      const newSlug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setFormData((prev) => ({ ...prev, slug: newSlug }))
    }
  }, [formData.title, formData.slug, slug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/static-pages/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          slug: formData.slug,
          content: formData.content,
          metaTitle: formData.metaTitle || null,
          metaDescription: formData.metaDescription || null,
        }),
      })

      if (response.ok) {
        const updated = await response.json()
        // If slug changed, redirect to new slug
        if (updated.slug !== slug) {
          router.push(`/admin/static-pages/${updated.slug}`)
        } else {
          alert('Page updated successfully!')
          router.refresh()
        }
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update page')
      }
    } catch (error) {
      console.error('Error updating page:', error)
      alert('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted || fetching) {
    return (
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Edit Static Page</h1>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Edit Static Page</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Enter page title"
            required
          />
        </div>

        {/* Slug */}
        <div>
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) =>
              setFormData({ ...formData, slug: e.target.value })
            }
            placeholder="page-url-slug"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            URL: /{formData.slug}
          </p>
        </div>

        {/* Content */}
        <div>
          <Label>Page Content *</Label>
          <RichTextEditor
            content={formData.content}
            onChange={(html) => setFormData({ ...formData, content: html })}
          />
        </div>

        {/* SEO */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-bold mb-4">SEO Settings</h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="metaTitle">Meta Title</Label>
              <Input
                id="metaTitle"
                value={formData.metaTitle || ''}
                onChange={(e) =>
                  setFormData({ ...formData, metaTitle: e.target.value })
                }
                placeholder="Leave blank to use page title"
              />
            </div>

            <div>
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Textarea
                id="metaDescription"
                value={formData.metaDescription || ''}
                onChange={(e) =>
                  setFormData({ ...formData, metaDescription: e.target.value })
                }
                placeholder="Brief description for search engines"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}

