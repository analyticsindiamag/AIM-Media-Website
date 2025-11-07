'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { RichTextEditor } from '@/components/admin/rich-text-editor'
import { ImageUpload } from '@/components/admin/image-upload'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Category { id: string; name: string }
interface Editor { id: string; name: string }

export default function EditArticlePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
  })

  useEffect(() => {
    async function load() {
      try {
        const [articleRes, catsRes, edsRes] = await Promise.all([
          fetch(`/api/articles/${id}`),
          fetch('/api/categories'),
          fetch('/api/editors'),
        ])
        if (!articleRes.ok) throw new Error('Failed to load article')
        const article = await articleRes.json()
        setCategories(await catsRes.json())
        setEditors(await edsRes.json())
        
        // Format scheduledAt for datetime-local input
        const scheduledAtValue = article.scheduledAt 
          ? new Date(article.scheduledAt).toISOString().slice(0, 16)
          : ''
        
        setFormData({
          title: article.title || '',
          slug: article.slug || '',
          excerpt: article.excerpt || '',
          content: article.content || '',
          featuredImage: article.featuredImage || '',
          featuredImageMediaId: article.featuredImageMediaId || null,
          categoryId: article.categoryId,
          editorId: article.editorId,
          published: !!article.published,
          scheduledAt: scheduledAtValue,
          metaTitle: article.metaTitle || '',
          metaDescription: article.metaDescription || '',
          featured: !!article.featured,
        })
      } catch {
        alert('Failed to load article')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const save = async (publish: boolean) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData, 
          published: publish,
          featuredImageMediaId: formData.featuredImageMediaId || undefined,
        }),
      })
      if (res.ok) {
        router.push('/admin/articles')
        router.refresh()
      } else {
        alert('Failed to save')
      }
    } catch {
      alert('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!confirm('Delete this article?')) return
    try {
      const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/admin/articles')
        router.refresh()
      } else {
        alert('Failed to delete')
      }
    } catch {
      alert('Failed to delete')
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Edit Article</h1>
        <button className="text-red-600 text-sm hover:underline" onClick={remove}>Delete</button>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="slug">Slug *</Label>
          <Input id="slug" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea id="excerpt" rows={3} value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} />
        </div>
        <div>
          <Label>Category *</Label>
          <Select value={formData.categoryId} onValueChange={(v) => setFormData({ ...formData, categoryId: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Author *</Label>
          <Select value={formData.editorId} onValueChange={(v) => setFormData({ ...formData, editorId: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Select author" />
            </SelectTrigger>
            <SelectContent>
              {editors.map((e) => (
                <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <ImageUpload 
          label="Featured Image" 
          value={formData.featuredImage} 
          mediaId={formData.featuredImageMediaId}
          onChange={(url, mediaId) => setFormData({ ...formData, featuredImage: url, featuredImageMediaId: mediaId || null })} 
        />
        <div>
          <Label>Content *</Label>
          <RichTextEditor content={formData.content} onChange={(html) => setFormData({ ...formData, content: html })} />
        </div>
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
        <div className="border-t pt-6">
          <h2 className="text-xl font-bold mb-4">SEO Settings</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="metaTitle">Meta Title</Label>
              <Input id="metaTitle" value={formData.metaTitle} onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Textarea id="metaDescription" rows={2} value={formData.metaDescription} onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <input id="featured" type="checkbox" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} />
              <Label htmlFor="featured">Set as Featured (hero)</Label>
            </div>
          </div>
        </div>
        <div className="flex gap-4 pt-6 border-t">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving}>Cancel</Button>
          <Button type="button" variant="outline" onClick={() => save(false)} disabled={saving}>Save as Draft</Button>
          <Button type="button" onClick={() => save(!formData.scheduledAt)} disabled={saving}>
            {saving 
              ? (formData.scheduledAt ? 'Scheduling...' : 'Publishing...') 
              : (formData.scheduledAt ? 'Schedule' : 'Publish')}
          </Button>
        </div>
      </div>
    </div>
  )
}
