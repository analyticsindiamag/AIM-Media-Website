'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ImageUpload } from '@/components/admin/image-upload'
import { GripVertical, Edit2, X } from 'lucide-react'
import Image from 'next/image'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  bannerImage: string | null
  order: number
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [reordering, setReordering] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    bannerImage: '',
  })
  const [editData, setEditData] = useState<Category | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const response = await fetch('/api/categories')
    const data = await response.json()
    if (Array.isArray(data)) {
      setCategories(data as Category[])
    } else if (data && typeof data === 'object' && Array.isArray((data as { categories?: Category[] }).categories)) {
      setCategories((data as { categories: Category[] }).categories)
    } else {
      console.warn('Unexpected categories response', data)
      setCategories([])
    }
  }

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name && !formData.slug) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setFormData((prev) => ({ ...prev, slug }))
    }
  }, [formData.name, formData.slug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          bannerImage: formData.bannerImage || null,
        }),
      })

      if (response.ok) {
        setFormData({ name: '', slug: '', description: '', bannerImage: '' })
        fetchCategories()
      } else {
        alert('Failed to create category')
      }
    } catch (_error) {
      alert('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingId(category.id)
    setEditData(category)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditData(null)
  }

  const handleUpdate = async () => {
    if (!editData) return

    setLoading(true)
    try {
      const response = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editData.id,
          name: editData.name,
          slug: editData.slug,
          description: editData.description || null,
          bannerImage: editData.bannerImage || null,
        }),
      })

      if (response.ok) {
        setEditingId(null)
        setEditData(null)
        fetchCategories()
      } else {
        alert('Failed to update category')
      }
    } catch (_error) {
      alert('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newCategories = [...categories]
    const draggedItem = newCategories[draggedIndex]
    newCategories.splice(draggedIndex, 1)
    newCategories.splice(index, 0, draggedItem)
    setCategories(newCategories)
    setDraggedIndex(index)
  }

  const handleDragEnd = async () => {
    if (draggedIndex === null) return

    setReordering(true)
    try {
      // Update order values based on new positions
      const updatedCategories = categories.map((cat, index) => ({
        ...cat,
        order: index,
      }))

      const response = await fetch('/api/categories/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categories: updatedCategories.map((cat) => ({
            id: cat.id,
            order: cat.order,
          })),
        }),
      })

      if (response.ok) {
        // Update local state with new order values
        setCategories(updatedCategories)
      } else {
        // Revert on error
        fetchCategories()
        alert('Failed to save category order')
      }
    } catch (error) {
      console.error('Reorder error:', error)
      fetchCategories()
      alert('An error occurred while reordering')
    } finally {
      setDraggedIndex(null)
      setReordering(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Categories</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Add Category Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Add New Category</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enterprise AI"
                required
              />
            </div>

            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                placeholder="enterprise-ai"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Category description..."
                rows={3}
              />
            </div>

            <div>
              <ImageUpload
                label="Banner Image (optional)"
                value={formData.bannerImage}
                onChange={(url) => setFormData({ ...formData, bannerImage: url })}
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Category'}
            </Button>
          </form>
        </div>

        {/* Categories List */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">All Categories</h2>
          {reordering && (
            <p className="text-sm text-muted-foreground mb-4">
              Saving order...
            </p>
          )}
          {categories.length > 0 ? (
            <div className="space-y-3">
              {categories.map((category, index) => (
                <div
                  key={category.id}
                  draggable={editingId !== category.id}
                  onDragStart={() => editingId !== category.id && handleDragStart(index)}
                  onDragOver={(e) => editingId !== category.id && handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`border border-border rounded-lg p-4 transition-opacity ${
                    draggedIndex === index ? 'opacity-50' : ''
                  } ${editingId !== category.id ? 'cursor-move hover:bg-gray-50' : ''}`}
                >
                  {editingId === category.id && editData ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold">Edit Category</h3>
                        <button
                          onClick={handleCancelEdit}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div>
                        <Label htmlFor={`edit-name-${category.id}`}>Name</Label>
                        <Input
                          id={`edit-name-${category.id}`}
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor={`edit-slug-${category.id}`}>Slug</Label>
                        <Input
                          id={`edit-slug-${category.id}`}
                          value={editData.slug}
                          onChange={(e) => setEditData({ ...editData, slug: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor={`edit-description-${category.id}`}>Description</Label>
                        <Textarea
                          id={`edit-description-${category.id}`}
                          value={editData.description || ''}
                          onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                          rows={3}
                        />
                      </div>

                      <div>
                        <ImageUpload
                          label="Banner Image"
                          value={editData.bannerImage || ''}
                          onChange={(url) => setEditData({ ...editData, bannerImage: url })}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={handleUpdate} disabled={loading}>
                          {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button onClick={handleCancelEdit} variant="outline">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <GripVertical className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-bold">{category.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              Slug: {category.slug}
                            </p>
                            {category.description && (
                              <p className="text-sm mt-2">{category.description}</p>
                            )}
                            {category.bannerImage && (
                              <div className="relative w-full h-32 mt-3 rounded-lg overflow-hidden">
                                <Image
                                  src={category.bannerImage}
                                  alt={`${category.name} banner`}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 flex gap-3">
                          <button
                            className="text-blue-600 text-sm hover:underline flex items-center gap-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEdit(category)
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            className="text-red-600 text-sm hover:underline"
                            onClick={async (e) => {
                              e.stopPropagation()
                              if (!confirm('Delete this category?')) return
                              const res = await fetch(`/api/categories?id=${category.id}`, { method: 'DELETE' })
                              if (res.ok) {
                                fetchCategories()
                              } else {
                                alert('Failed to delete category')
                              }
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No categories yet.</p>
          )}
          {categories.length > 0 && (
            <p className="text-sm text-muted-foreground mt-4">
              💡 Drag and drop categories to reorder them
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

