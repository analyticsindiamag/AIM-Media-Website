'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RichTextEditor } from '@/components/admin/rich-text-editor'
import { ImageUpload } from '@/components/admin/image-upload'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Category {
  id: string
  name: string
}

interface Editor {
  id: string
  name: string
}

export default function NewArticlePage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [editors, setEditors] = useState<Editor[]>([])
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    featuredImageMediaId: null as string | null,
    categoryId: '',
    editorId: '',
    published: false,
    scheduledAt: '',
    metaTitle: '',
    metaDescription: '',
    featured: false,
    subFeatured: false,
    exclusive: false,
  })

  // Fetch categories and editors
  useEffect(() => {
    setMounted(true)
    Promise.all([
      fetch('/api/categories').then((res) => res.json()),
      fetch('/api/editors').then((res) => res.json()),
    ]).then(([cats, eds]) => {
      const normalizedCategories = Array.isArray(cats)
        ? (cats as Category[])
        : cats && typeof cats === 'object' && Array.isArray((cats as { categories?: Category[] }).categories)
          ? (cats as { categories: Category[] }).categories
          : []
      const normalizedEditors = Array.isArray(eds)
        ? (eds as Editor[])
        : eds && typeof eds === 'object' && Array.isArray((eds as { editors?: Editor[] }).editors)
          ? (eds as { editors: Editor[] }).editors
          : []

      setCategories(normalizedCategories)
      setEditors(normalizedEditors)
    })
  }, [])

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !formData.slug) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setFormData((prev) => ({ ...prev, slug }))
    }
  }, [formData.title, formData.slug])

  const handleSubmit = async (e: React.FormEvent, publish: boolean) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData, 
          published: publish,
          featuredImageMediaId: formData.featuredImageMediaId || undefined,
        }),
      })

      if (response.ok) {
        router.push(`/admin/articles`)
        router.refresh()
      } else {
        alert('Failed to create article')
      }
    } catch (_error) {
      alert('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Create New Article</h1>

      <form className="space-y-6">
        {/* Title */}
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Enter article title"
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
            placeholder="article-url-slug"
            required
          />
        </div>

        {/* Excerpt */}
        <div>
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea
            id="excerpt"
            value={formData.excerpt}
            onChange={(e) =>
              setFormData({ ...formData, excerpt: e.target.value })
            }
            placeholder="Brief summary of the article"
            rows={3}
          />
        </div>

        {/* Category */}
        <div>
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.categoryId}
            onValueChange={(value) =>
              setFormData({ ...formData, categoryId: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Editor */}
        <div>
          <Label htmlFor="editor">Author *</Label>
          <Select
            value={formData.editorId}
            onValueChange={(value) =>
              setFormData({ ...formData, editorId: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select author" />
            </SelectTrigger>
            <SelectContent>
              {editors.map((editor) => (
                <SelectItem key={editor.id} value={editor.id}>
                  {editor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Featured Image */}
        <ImageUpload
          label="Featured Image"
          value={formData.featuredImage}
          mediaId={formData.featuredImageMediaId}
          onChange={(url, mediaId) => setFormData({ ...formData, featuredImage: url, featuredImageMediaId: mediaId || null })}
        />

        {/* Content */}
        <div>
          <Label>Article Content *</Label>
          <RichTextEditor
            content={formData.content}
            onChange={(html) => setFormData({ ...formData, content: html })}
          />
        </div>

        {/* Publishing Options */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-bold mb-4">Publishing Options</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                id="published"
                type="checkbox"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              />
              <Label htmlFor="published">Publish immediately</Label>
            </div>

            <div>
              <Label htmlFor="scheduledAt">Schedule for later (leave empty to publish now)</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                placeholder="Schedule publication date"
              />
              {formData.scheduledAt && (
                <p className="text-sm text-gray-500 mt-1">
                  Article will be published on {new Date(formData.scheduledAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-bold mb-4">SEO Settings</h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="metaTitle">Meta Title</Label>
              <Input
                id="metaTitle"
                value={formData.metaTitle}
                onChange={(e) =>
                  setFormData({ ...formData, metaTitle: e.target.value })
                }
                placeholder="Leave blank to use article title"
              />
            </div>

            <div>
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Textarea
                id="metaDescription"
                value={formData.metaDescription}
                onChange={(e) =>
                  setFormData({ ...formData, metaDescription: e.target.value })
                }
                placeholder="Leave blank to use excerpt"
                rows={2}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="featured"
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              />
              <Label htmlFor="featured">Set as Featured (main homepage article)</Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="subFeatured"
                type="checkbox"
                checked={formData.subFeatured}
                onChange={(e) => setFormData({ ...formData, subFeatured: e.target.checked })}
              />
              <Label htmlFor="subFeatured">Set as Sub-Featured (below main featured)</Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="exclusive"
                type="checkbox"
                checked={formData.exclusive}
                onChange={(e) => setFormData({ ...formData, exclusive: e.target.checked })}
              />
              <Label htmlFor="exclusive">Mark as Exclusive Story</Label>
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
            type="button"
            variant="outline"
            onClick={(e) => handleSubmit(e, false)}
            disabled={loading}
          >
            Save as Draft
          </Button>
          <Button
            type="button"
            onClick={(e) => handleSubmit(e, !formData.scheduledAt)}
            disabled={loading}
          >
            {loading 
              ? (formData.scheduledAt ? 'Scheduling...' : 'Publishing...') 
              : (formData.scheduledAt ? 'Schedule' : 'Publish')}
          </Button>
        </div>
      </form>
    </div>
  )
}

