'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ImageUpload } from '@/components/admin/image-upload'

interface Editor {
  id: string
  name: string
  email: string
  bio: string | null
  avatar: string | null
}

export default function EditorsPage() {
  const [editors, setEditors] = useState<Editor[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    avatar: '',
  })

  useEffect(() => {
    fetchEditors()
  }, [])

  const fetchEditors = async () => {
    const response = await fetch('/api/editors')
    const data = await response.json()
    setEditors(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingId ? `/api/editors/${editingId}` : '/api/editors'
      const method = editingId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({ name: '', email: '', bio: '', avatar: '' })
        setEditingId(null)
        fetchEditors()
      } else {
        const error = await response.json()
        alert(`Failed: ${error.error || 'Unknown error'}`)
      }
    } catch (_error) {
      alert('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (editor: Editor) => {
    setFormData({
      name: editor.name,
      email: editor.email,
      bio: editor.bio || '',
      avatar: editor.avatar || '',
    })
    setEditingId(editor.id)
  }

  const handleCancel = () => {
    setFormData({ name: '', email: '', bio: '', avatar: '' })
    setEditingId(null)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Editors / Authors</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Add/Edit Editor Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? 'Edit Editor' : 'Add New Editor'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="john@example.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Brief bio about the editor..."
                rows={3}
              />
            </div>

            <ImageUpload
              label="Avatar"
              value={formData.avatar}
              onChange={(url) => setFormData({ ...formData, avatar: url })}
            />

            <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
                {loading ? (editingId ? 'Updating...' : 'Creating...') : (editingId ? 'Update Editor' : 'Create Editor')}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
            </Button>
              )}
            </div>
          </form>
        </div>

        {/* Editors List */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">All Editors</h2>
          {editors.length > 0 ? (
            <div className="space-y-3">
              {editors.map((editor) => (
                <div
                  key={editor.id}
                  className="border border-border rounded-lg p-4"
                >
                  <h3 className="font-bold">{editor.name}</h3>
                  <p className="text-sm text-muted-foreground">{editor.email}</p>
                  {editor.bio && (
                    <p className="text-sm mt-2">{editor.bio}</p>
                  )}
                  {editor.avatar && (
                    <img src={editor.avatar} alt={editor.name} className="w-16 h-16 rounded-full mt-2 object-cover" />
                  )}
                  <div className="mt-3 flex gap-3">
                    <button
                      className="text-blue-600 text-sm hover:underline"
                      onClick={() => handleEdit(editor)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 text-sm hover:underline"
                      onClick={async () => {
                        if (!confirm('Delete this editor?')) return
                        const res = await fetch(`/api/editors?id=${editor.id}`, { method: 'DELETE' })
                        if (res.ok) {
                          setEditors((prev) => prev.filter((e) => e.id !== editor.id))
                          if (editingId === editor.id) {
                            handleCancel()
                          }
                        } else {
                          alert('Failed to delete editor')
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No editors yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}

