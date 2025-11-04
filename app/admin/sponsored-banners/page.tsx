'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImageUpload } from '@/components/admin/image-upload'
import { Select } from '@/components/ui/select'
import { Plus, Edit2, Trash2 } from 'lucide-react'

interface SponsoredBanner {
  id: string
  title: string
  imageUrl: string
  linkUrl: string | null
  type: 'homepage-main' | 'homepage-side' | 'article-side'
  active: boolean
  startDate: string | null
  endDate: string | null
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export default function SponsoredBannersPage() {
  const [banners, setBanners] = useState<SponsoredBanner[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '',
    imageUrl: '',
    linkUrl: '',
    type: 'homepage-main' as 'homepage-main' | 'homepage-side' | 'article-side',
    active: true,
    startDate: '',
    endDate: '',
    displayOrder: 0,
  })

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/sponsored-banners?active=false')
      const data = await response.json()
      setBanners(data)
    } catch (_error) {
      console.error('Failed to fetch banners')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm({
      title: '',
      imageUrl: '',
      linkUrl: '',
      type: 'homepage-main',
      active: true,
      startDate: '',
      endDate: '',
      displayOrder: 0,
    })
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (banner: SponsoredBanner) => {
    setForm({
      title: banner.title,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || '',
      type: banner.type,
      active: banner.active,
      startDate: banner.startDate ? banner.startDate.split('T')[0] : '',
      endDate: banner.endDate ? banner.endDate.split('T')[0] : '',
      displayOrder: banner.displayOrder,
    })
    setEditingId(banner.id)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingId 
        ? `/api/sponsored-banners/${editingId}`
        : '/api/sponsored-banners'
      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
        }),
      })

      if (response.ok) {
        alert(editingId ? 'Banner updated successfully!' : 'Banner created successfully!')
        resetForm()
        fetchBanners()
      } else {
        const error = await response.json()
        alert(`Failed: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error saving banner:', error)
      alert('Failed to save banner')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return

    try {
      const response = await fetch(`/api/sponsored-banners/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('Banner deleted successfully!')
        fetchBanners()
      } else {
        alert('Failed to delete banner')
      }
    } catch (error) {
      console.error('Error deleting banner:', error)
      alert('Failed to delete banner')
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'homepage-main': return 'Homepage Main Banner (Horizontal)'
      case 'homepage-side': return 'Homepage Side Banner (Vertical)'
      case 'article-side': return 'Article Side Banner (Vertical)'
      default: return type
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Sponsored Banners</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Banner
        </Button>
      </div>

      {showForm && (
        <div className="bg-white border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? 'Edit Banner' : 'Create New Banner'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title/Name</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                placeholder="e.g., Summer Sale 2025"
              />
            </div>

            <div>
              <Label>Banner Image</Label>
              <ImageUpload
                label="Upload Banner Image"
                value={form.imageUrl}
                onChange={(url) => setForm({ ...form, imageUrl: url })}
              />
              <div className="mt-2">
                <Label htmlFor="imageUrl">Or enter Image URL manually</Label>
                <Input
                  id="imageUrl"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://..."
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="linkUrl">Click-through URL (optional)</Label>
              <Input
                id="linkUrl"
                value={form.linkUrl}
                onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label htmlFor="type">Banner Type</Label>
              <select
                id="type"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="homepage-main">Homepage Main Banner (Horizontal)</option>
                <option value="homepage-side">Homepage Side Banner (Vertical)</option>
                <option value="article-side">Article Side Banner (Vertical)</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                />
                <span>Active</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date (optional)</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date (optional)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="displayOrder">Display Order</Label>
              <Input
                id="displayOrder"
                type="number"
                value={form.displayOrder}
                onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })}
              />
              <p className="text-sm text-gray-500 mt-1">Lower numbers appear first</p>
            </div>

            <div className="flex gap-2">
              <Button type="submit">{editingId ? 'Update' : 'Create'} Banner</Button>
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {banners.map((banner) => (
              <tr key={banner.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium">{banner.title}</div>
                  {banner.imageUrl && (
                    <img src={banner.imageUrl} alt={banner.title} className="w-16 h-16 object-cover mt-2" />
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{getTypeLabel(banner.type)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded ${banner.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {banner.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{banner.displayOrder}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(banner)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {banners.length === 0 && (
          <div className="p-8 text-center text-gray-500">No banners found. Create one to get started.</div>
        )}
      </div>
    </div>
  )
}

